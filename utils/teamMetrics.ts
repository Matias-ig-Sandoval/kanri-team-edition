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

import type { Board, Column } from "@/types/kanban-types";
import { LEAD_ROLE, resolveCardAssignments } from "./cardAssignments";
import { getCardMilestones, getCardProgress } from "./cardProgress";

export type CardStatus = "initial" | "inProgress" | "review" | "done";

export const CARD_STATUSES: Array<CardStatus> = [
  "initial",
  "inProgress",
  "review",
  "done",
];

/** Key of the group that collects cards without a (valid) assignee */
export const UNASSIGNED_KEY = "__unassigned__";

/**
 * One participation of a member in a card. A card with several assignees
 * yields one row per assignee; a card without assignees yields one
 * unassigned row. `cardKey` identifies the card across those rows.
 */
export interface TeamCardRow {
  cardKey: string;
  /** Role of the member on this card ("lead", "support", ...); empty when unassigned */
  assignmentRole: string;
  boardId: string;
  boardTitle: string;
  columnId: string;
  columnTitle: string;
  status: CardStatus;
  cardId: string;
  cardName: string;
  /** Normalized member name, or UNASSIGNED_KEY */
  memberKey: string;
  memberName: string;
  memberRole: string;
  memberColor: string | null;
  /** 0-100, derived from tasks or the manual value */
  progress: number;
  milestonesFinished: number;
  milestonesTotal: number;
  /** ISO string, or null when the card has no (valid) due date */
  dueDate: string | null;
  overdue: boolean;
  finished: boolean;
}

export interface TeamMemberSummary {
  key: string;
  name: string;
  role: string;
  color: string | null;
  total: number;
  /** Cards where the member has the lead role */
  leading: number;
  /** Cards where the member takes part with any other role */
  supporting: number;
  byStatus: Record<CardStatus, number>;
  overdue: number;
  finished: number;
  averageProgress: number;
  cards: Array<TeamCardRow>;
}

export interface TeamTotals {
  total: number;
  averageProgress: number;
  finished: number;
  overdue: number;
}

export interface TeamFilter {
  /** Board ID, or empty for all boards */
  boardId?: string;
  /** Member key (see normalizeMemberName / UNASSIGNED_KEY), or empty for all */
  memberKey?: string;
}

/** Members are stored per board, so the same person is matched by name */
export const normalizeMemberName = (name: string): string =>
  name.trim().replace(/\s+/g, " ").toLowerCase();

const STATUS_KEYWORDS: Array<[CardStatus, RegExp]> = [
  ["review", /review|revis|qa\b|test|prueba|valid|verific|aprob/i],
  ["done", /done|hecho|termin|finaliz|complet|cerrad|closed|entregad|listo/i],
  ["inProgress", /progres|curso|doing|haciendo|wip|desarroll|working|proceso/i],
  ["initial", /to ?do|pendiente|backlog|por hacer|inicio|idea|nuev|new|inbox/i],
];

/**
 * Status of a column. Boards have free-form columns, so this is a heuristic:
 * known words in the title decide first, otherwise the position does
 * (first column = initial, last column = done, the rest = in progress).
 */
export const classifyColumn = (
  column: Pick<Column, "title">,
  index: number,
  columnCount: number
): CardStatus => {
  for (const [status, pattern] of STATUS_KEYWORDS) {
    if (pattern.test(column.title)) return status;
  }

  if (index === 0) return "initial";
  if (columnCount > 1 && index === columnCount - 1) return "done";

  return "inProgress";
};

const toIsoDate = (value: Date | string | null | undefined): string | null => {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toISOString();
};

const average = (values: Array<number>): number => {
  if (values.length === 0) return 0;

  return Math.round(
    values.reduce((sum, value) => sum + value, 0) / values.length
  );
};

/** One row per card across all boards. Separator cards ("---") are skipped. */
export const collectTeamRows = (
  boards: Array<Board>,
  now: Date = new Date()
): Array<TeamCardRow> => {
  const rows: Array<TeamCardRow> = [];

  for (const board of boards) {
    const members = board.members ?? [];

    board.columns.forEach((column, columnIndex) => {
      const status = classifyColumn(column, columnIndex, board.columns.length);

      for (const card of column.cards) {
        if (card.name.startsWith("---")) continue;

        const milestones = getCardMilestones(card);
        const progress = getCardProgress(card);
        const dueDate = toIsoDate(card.dueDate);
        const finished = status === "done" || progress === 100;
        const overdue =
          dueDate !== null &&
          new Date(dueDate).getTime() < now.getTime() &&
          !card.isDueDateCompleted &&
          !finished;

        const cardFields = {
          cardKey: `${board.id}/${column.id}/${card.id ?? card.name}`,
          boardId: board.id,
          boardTitle: board.title,
          columnId: column.id,
          columnTitle: column.title,
          status,
          cardId: card.id ?? "",
          cardName: card.name,
          progress,
          milestonesFinished: milestones.finished,
          milestonesTotal: milestones.total,
          dueDate,
          overdue,
          finished,
        };

        const assignments = resolveCardAssignments(card, members);
        if (assignments.length === 0) {
          rows.push({
            ...cardFields,
            assignmentRole: "",
            memberKey: UNASSIGNED_KEY,
            memberName: "",
            memberRole: "",
            memberColor: null,
          });
          continue;
        }

        // Two board members with the same name count as one person
        const seenMembers = new Set<string>();
        for (const { member, role } of assignments) {
          const memberKey = normalizeMemberName(member.name);
          if (seenMembers.has(memberKey)) continue;
          seenMembers.add(memberKey);

          rows.push({
            ...cardFields,
            assignmentRole: role,
            memberKey,
            memberName: member.name.trim(),
            memberRole: member.role?.trim() ?? "",
            memberColor: member.color ?? null,
          });
        }
      }
    });
  }

  return rows;
};

export const filterTeamRows = (
  rows: Array<TeamCardRow>,
  filter: TeamFilter
): Array<TeamCardRow> =>
  rows.filter(
    (row) =>
      (!filter.boardId || row.boardId === filter.boardId) &&
      (!filter.memberKey || row.memberKey === filter.memberKey)
  );

/** Totals over distinct cards: a card with several assignees counts once */
export const computeTeamTotals = (rows: Array<TeamCardRow>): TeamTotals => {
  const cards = [...new Map(rows.map((row) => [row.cardKey, row])).values()];

  return {
    total: cards.length,
    averageProgress: average(cards.map((card) => card.progress)),
    finished: cards.filter((card) => card.finished).length,
    overdue: cards.filter((card) => card.overdue).length,
  };
};

/**
 * Metrics per member, sorted by name with the unassigned group last.
 * Role and color come from the first board where the member has one.
 */
export const summarizeMembers = (
  rows: Array<TeamCardRow>
): Array<TeamMemberSummary> => {
  const groups = new Map<string, TeamMemberSummary>();

  for (const row of rows) {
    let group = groups.get(row.memberKey);
    if (!group) {
      group = {
        key: row.memberKey,
        name: row.memberName,
        role: row.memberRole,
        color: row.memberColor,
        total: 0,
        leading: 0,
        supporting: 0,
        byStatus: { initial: 0, inProgress: 0, review: 0, done: 0 },
        overdue: 0,
        finished: 0,
        averageProgress: 0,
        cards: [],
      };
      groups.set(row.memberKey, group);
    }

    if (!group.role && row.memberRole) group.role = row.memberRole;
    if (!group.color && row.memberColor) group.color = row.memberColor;

    group.total += 1;
    if (row.assignmentRole === LEAD_ROLE) group.leading += 1;
    else if (row.assignmentRole) group.supporting += 1;
    group.byStatus[row.status] += 1;
    if (row.overdue) group.overdue += 1;
    if (row.finished) group.finished += 1;
    group.cards.push(row);
  }

  const summaries = [...groups.values()];
  for (const summary of summaries) {
    summary.averageProgress = average(summary.cards.map((card) => card.progress));
  }

  return summaries.sort((a, b) => {
    if (a.key === UNASSIGNED_KEY) return 1;
    if (b.key === UNASSIGNED_KEY) return -1;

    return a.name.localeCompare(b.name);
  });
};

/** All members of the given boards, deduplicated by normalized name */
export const collectMemberOptions = (
  boards: Array<Board>
): Array<{ key: string; name: string }> => {
  const options = new Map<string, string>();

  for (const board of boards) {
    for (const member of board.members ?? []) {
      const key = normalizeMemberName(member.name);
      if (key && !options.has(key)) options.set(key, member.name.trim());
    }
  }

  return [...options.entries()]
    .map(([key, name]) => ({ key, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

/** Texts of the report that depend on the active language */
export interface TeamReportLabels {
  /** Member, Role, Task role, Board, Task, Column, Status, Phases, Progress, Due date */
  headers: Array<string>;
  unassigned: string;
  statuses: Record<CardStatus, string>;
  /** Label of a role on a card ("lead" -> "Líder / A cargo") */
  formatRole: (role: string) => string;
  formatDate: (isoDate: string) => string;
}

const reportCells = (
  row: TeamCardRow,
  labels: TeamReportLabels
): Array<string> => [
  row.memberKey === UNASSIGNED_KEY ? labels.unassigned : row.memberName,
  row.memberRole,
  row.assignmentRole ? labels.formatRole(row.assignmentRole) : "",
  row.boardTitle,
  row.cardName,
  row.columnTitle,
  labels.statuses[row.status],
  row.milestonesTotal > 0
    ? `${row.milestonesFinished}/${row.milestonesTotal}`
    : "",
  `${row.progress}%`,
  row.dueDate ? labels.formatDate(row.dueDate) : "",
];

// Quotes every cell and neutralizes cells a spreadsheet would run as a formula
const csvCell = (value: string): string => {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;

  return `"${safe.replace(/"/g, '""')}"`;
};

/** CSV with a BOM so spreadsheet apps read accents correctly */
export const teamRowsToCsv = (
  rows: Array<TeamCardRow>,
  labels: TeamReportLabels
): string => {
  const lines = [labels.headers, ...rows.map((row) => reportCells(row, labels))];

  return (
    "﻿" + lines.map((cells) => cells.map(csvCell).join(",")).join("\r\n")
  );
};

const markdownCell = (value: string): string =>
  value.replace(/\|/g, "\\|").replace(/\r?\n/g, " ");

export const teamRowsToMarkdown = (
  rows: Array<TeamCardRow>,
  labels: TeamReportLabels,
  title: string,
  summaryLine: string
): string => {
  const toLine = (cells: Array<string>) =>
    `| ${cells.map(markdownCell).join(" | ")} |`;

  return [
    `## ${title}`,
    "",
    summaryLine,
    "",
    toLine(labels.headers),
    toLine(labels.headers.map(() => "---")),
    ...rows.map((row) => toLine(reportCells(row, labels))),
  ].join("\n");
};
