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

import {
  buildTasksFromPhases,
  clampProgress,
  getCardMilestones,
  getCardProgress,
  getTaskTargetColumnId,
} from "./cardProgress";

describe("getCardProgress", () => {
  it("uses the manual value when the card has no tasks", () => {
    expect(getCardProgress({ tasks: [], progress: 40 })).toBe(40);
    expect(getCardProgress({ progress: undefined })).toBe(0);
  });

  it("derives the value from tasks and ignores the manual one", () => {
    expect(
      getCardProgress({
        progress: 90,
        tasks: [
          { name: "a", finished: true },
          { name: "b", finished: false },
          { name: "c", finished: false },
          { name: "d", finished: true },
        ],
      })
    ).toBe(50);
  });

  it("clamps manual values to 0-100", () => {
    expect(clampProgress(140)).toBe(100);
    expect(clampProgress(-3)).toBe(0);
    expect(clampProgress("abc")).toBe(0);
  });
});

describe("getCardMilestones", () => {
  it("counts finished and total tasks", () => {
    expect(
      getCardMilestones({
        tasks: [
          { name: "a", finished: true },
          { name: "b", finished: false },
        ],
      })
    ).toEqual({ finished: 1, total: 2 });
    expect(getCardMilestones({})).toEqual({ finished: 0, total: 0 });
  });
});

describe("getTaskTargetColumnId", () => {
  const columns = ["todo", "doing", "done"];

  it("returns the target of a finished task", () => {
    expect(
      getTaskTargetColumnId({ finished: true, targetColumnId: "done" }, "todo", columns)
    ).toBe("done");
  });

  it("returns null when the card must stay where it is", () => {
    const unfinished = { finished: false, targetColumnId: "done" };
    const sameColumn = { finished: true, targetColumnId: "done" };
    const deletedColumn = { finished: true, targetColumnId: "gone" };
    const noTarget = { finished: true, targetColumnId: null };

    expect(getTaskTargetColumnId(unfinished, "todo", columns)).toBe(null);
    expect(getTaskTargetColumnId(sameColumn, "done", columns)).toBe(null);
    expect(getTaskTargetColumnId(deletedColumn, "todo", columns)).toBe(null);
    expect(getTaskTargetColumnId(noTarget, "todo", columns)).toBe(null);
    expect(getTaskTargetColumnId(undefined, "todo", columns)).toBe(null);
  });
});

describe("buildTasksFromPhases", () => {
  it("creates tasks and skips blank names and names the card already has", () => {
    let counter = 0;
    const tasks = buildTasksFromPhases(
      [
        { name: "Diseño", targetColumnId: "doing" },
        { name: " revisión " },
        { name: "   " },
        { name: "Entrega", targetColumnId: "done" },
      ],
      [{ name: "REVISIÓN", finished: true }],
      () => `id${++counter}`
    );

    expect(tasks).toEqual([
      { finished: false, id: "id1", name: "Diseño", targetColumnId: "doing" },
      { finished: false, id: "id2", name: "Entrega", targetColumnId: "done" },
    ]);
  });
});
