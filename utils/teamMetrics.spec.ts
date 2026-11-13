/* SPDX-FileCopyrightText: Copyright (c) 2022-2026 trobonox <hello@trobo.dev>

SPDX-License-Identifier: GPL-3.0-or-later

Kanri is an offline Kanban board app made using Tauri and Nuxt.
Copyright (C) 2022-2026 trobonox <hello@trobo.dev>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { describe, it, expect } from "vitest";

import type { Board } from "@/types/kanban-types";
import {
  UNASSIGNED_KEY,
  classifyColumn,
  collectMemberOptions,
  collectTeamRows,
  computeTeamTotals,
  filterTeamRows,
  summarizeMembers,
  teamRowsToCsv,
  teamRowsToMarkdown,
} from "./teamMetrics";
import type { TeamReportLabels } from "./teamMetrics";

const now = new Date("2026-11-12T12:00:00Z");

const boards: Array<Board> = [
  {
    id: "b1",
    title: "Web",
    members: [
      { id: "m1", name: "Ana Pérez", role: "Dev", color: "#ff0000" },
      { id: "m2", name: "Luis" },
    ],
    columns: [
      {
        id: "c1",
        title: "Por hacer",
        cards: [
          {
            id: "k1",
            name: "Login",
            assignments: [
              { memberId: "m1", role: "lead" },
              { memberId: "m2", role: "support" },
            ],
            dueDate: "2026-11-01T00:00:00Z",
          },
          { id: "k2", name: "---" },
          { id: "k3", name: "Sin dueño", progress: 40 },
        ],
      },
      {
        id: "c2",
        title: "En curso",
        cards: [
          {
            id: "k4",
            name: "API",
            // legacy card saved before `assignments` existed
            assigneeId: "m1",
            tasks: [
              { name: "a", finished: true },
              { name: "b", finished: false },
            ],
            dueDate: "2026-12-01T00:00:00Z",
          },
        ],
      },
      {
        id: "c3",
        title: "Revisión",
        cards: [
          {
            id: "k5",
            name: "Docs",
            assignments: [
              { memberId: "m1", role: "reviewer" },
              { memberId: "m2", role: "lead" },
            ],
          },
        ],
      },
      {
        id: "c4",
        title: "Hecho",
        cards: [
          {
            id: "k6",
            name: "Setup",
            assigneeId: "m2",
            dueDate: "2026-10-01T00:00:00Z",
          },
        ],
      },
    ],
  },
  {
    id: "b2",
    title: "App",
    members: [{ id: "x9", name: "  ana   pérez " }],
    columns: [
      {
        id: "d1",
        title: "Alpha",
        cards: [
          {
            id: "q1",
            name: 'Icono "nuevo"',
            assignments: [{ memberId: "x9", role: "support" }],
            progress: 100,
          },
        ],
      },
      {
        id: "d2",
        title: "Beta",
        cards: [{ id: "q2", name: "Borrado", assigneeId: "gone" }],
      },
      { id: "d3", title: "Gamma", cards: [] },
    ],
  },
];

const labels: TeamReportLabels = {
  headers: [
    "Integrante",
    "Rol",
    "Rol en la tarea",
    "Tablero",
    "Tarea",
    "Columna",
    "Estado",
    "Fases",
    "% Avance",
    "Fecha límite",
  ],
  unassigned: "Sin asignar",
  statuses: {
    initial: "Inicial",
    inProgress: "En curso",
    review: "Revisión",
    done: "Finalizadas",
  },
  formatRole: (role) =>
    ({ lead: "Líder", support: "Apoyo", reviewer: "Revisor" })[role] ?? role,
  formatDate: (isoDate) => isoDate.slice(0, 10),
};

const rows = collectTeamRows(boards, now);
const rowOf = (cardId: string, memberKey: string) => {
  const row = rows.find((r) => r.cardId === cardId && r.memberKey === memberKey);
  if (!row) throw new Error(`no row for ${cardId}/${memberKey}`);

  return row;
};

describe("classifyColumn", () => {
  it("uses known words in the title first", () => {
    expect(classifyColumn({ title: "Por hacer" }, 2, 4)).toBe("initial");
    expect(classifyColumn({ title: "En curso" }, 0, 4)).toBe("inProgress");
    expect(classifyColumn({ title: "Revisión" }, 0, 4)).toBe("review");
    expect(classifyColumn({ title: "Hecho" }, 0, 4)).toBe("done");
  });

  it("falls back to the position of the column", () => {
    expect(classifyColumn({ title: "Alpha" }, 0, 3)).toBe("initial");
    expect(classifyColumn({ title: "Beta" }, 1, 3)).toBe("inProgress");
    expect(classifyColumn({ title: "Gamma" }, 2, 3)).toBe("done");
    expect(classifyColumn({ title: "Única" }, 0, 1)).toBe("initial");
  });
});

describe("collectTeamRows", () => {
  it("creates one row per participation and skips separator cards", () => {
    expect(rows.map((r) => `${r.cardId}:${r.memberKey}:${r.assignmentRole}`)).toEqual([
      "k1:ana pérez:lead",
      "k1:luis:support",
      `k3:${UNASSIGNED_KEY}:`,
      "k4:ana pérez:lead",
      "k5:luis:lead",
      "k5:ana pérez:reviewer",
      "k6:luis:lead",
      "q1:ana pérez:support",
      `q2:${UNASSIGNED_KEY}:`,
    ]);
  });

  it("marks overdue and finished cards", () => {
    expect(rowOf("k1", "ana pérez").overdue).toBe(true);
    expect(rowOf("k4", "ana pérez").overdue).toBe(false);
    expect(rowOf("k6", "luis").overdue).toBe(false);
    expect(rowOf("k6", "luis").finished).toBe(true);
    expect(rowOf("q1", "ana pérez").finished).toBe(true);
  });

  it("derives progress and milestones", () => {
    const api = rowOf("k4", "ana pérez");

    expect(api.progress).toBe(50);
    expect([api.milestonesFinished, api.milestonesTotal]).toEqual([1, 2]);
    expect(rowOf("k3", UNASSIGNED_KEY).progress).toBe(40);
  });
});

describe("computeTeamTotals", () => {
  it("counts a card with several assignees once", () => {
    expect(computeTeamTotals(rows)).toEqual({
      total: 7,
      averageProgress: 27,
      finished: 2,
      overdue: 1,
    });
  });
});

describe("summarizeMembers", () => {
  const members = summarizeMembers(rows);

  it("groups by normalized name with the unassigned group last", () => {
    expect(members.map((m) => m.key)).toEqual([
      "ana pérez",
      "luis",
      UNASSIGNED_KEY,
    ]);
  });

  it("splits lead and support work per member", () => {
    const [ana, luis, unassigned] = members;

    expect([ana?.total, ana?.leading, ana?.supporting]).toEqual([4, 2, 2]);
    expect([luis?.total, luis?.leading, luis?.supporting]).toEqual([3, 2, 1]);
    expect([unassigned?.total, unassigned?.leading, unassigned?.supporting]).toEqual([
      2, 0, 0,
    ]);
  });

  it("aggregates status, overdue, progress, role and color", () => {
    const [ana, luis] = members;

    expect(ana?.byStatus).toEqual({ initial: 2, inProgress: 1, review: 1, done: 0 });
    expect(luis?.byStatus).toEqual({ initial: 1, inProgress: 0, review: 1, done: 1 });
    expect([ana?.overdue, ana?.finished, ana?.averageProgress]).toEqual([1, 1, 38]);
    expect([ana?.role, ana?.color]).toEqual(["Dev", "#ff0000"]);
  });
});

describe("filters", () => {
  it("filters by board and member", () => {
    expect(filterTeamRows(rows, { boardId: "b2" })).toHaveLength(2);
    expect(filterTeamRows(rows, { memberKey: "ana pérez" })).toHaveLength(4);
    expect(
      filterTeamRows(rows, { boardId: "b1", memberKey: UNASSIGNED_KEY })
    ).toHaveLength(1);
    expect(filterTeamRows(rows, {})).toHaveLength(9);
  });

  it("lists each member once across boards", () => {
    expect(collectMemberOptions(boards)).toEqual([
      { key: "ana pérez", name: "Ana Pérez" },
      { key: "luis", name: "Luis" },
    ]);
  });
});

describe("reports", () => {
  it("writes a CSV with BOM, the task role and escaped quotes", () => {
    const csv = teamRowsToCsv(rows, labels);
    const lines = csv.split("\r\n");

    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(lines).toHaveLength(10);
    expect(lines[1]).toBe(
      '"Ana Pérez","Dev","Líder","Web","Login","Por hacer","Inicial","","0%","2026-11-01"'
    );
    expect(lines[3]).toBe(
      '"Sin asignar","","","Web","Sin dueño","Por hacer","Inicial","","40%",""'
    );
    expect(lines[4]).toBe(
      '"Ana Pérez","Dev","Líder","Web","API","En curso","En curso","1/2","50%","2026-12-01"'
    );
    expect(lines[8]?.includes('"Icono ""nuevo"""')).toBe(true);
  });

  it("neutralizes cells a spreadsheet would run as a formula", () => {
    const csv = teamRowsToCsv(
      [{ ...rowOf("k1", "ana pérez"), cardName: "=SUM(A1)" }],
      labels
    );

    expect(csv.split("\r\n")[1]?.split(",")[4]).toBe("\"'=SUM(A1)\"");
  });

  it("writes a Markdown table and escapes pipes", () => {
    const lines = teamRowsToMarkdown(
      [{ ...rowOf("k1", "ana pérez"), cardName: "a|b" }],
      labels,
      "Resumen",
      "Total: 1"
    ).split("\n");

    expect(lines[0]).toBe("## Resumen");
    expect(lines[2]).toBe("Total: 1");
    expect(lines[5]?.split(" | ")).toHaveLength(10);
    expect(lines[6]?.includes("a\\|b")).toBe(true);
  });
});
