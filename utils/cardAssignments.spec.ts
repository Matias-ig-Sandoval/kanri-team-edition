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
  addAssignment,
  assignmentRoleKey,
  getCardAssignments,
  getLegacyAssigneeId,
  getMemberInitials,
  normalizeAssignments,
  removeAssignment,
  resolveCardAssignments,
  setAssignmentRole,
} from "./cardAssignments";

describe("getCardAssignments", () => {
  it("falls back to the legacy assigneeId as lead", () => {
    expect(getCardAssignments({ assigneeId: "m1" })).toEqual([
      { memberId: "m1", role: "lead" },
    ]);
    expect(getCardAssignments({})).toEqual([]);
    expect(getCardAssignments({ assigneeId: null })).toEqual([]);
  });

  it("prefers assignments over the legacy field, even when empty", () => {
    expect(getCardAssignments({ assignments: [], assigneeId: "m1" })).toEqual([]);
    expect(
      getCardAssignments({
        assignments: [{ memberId: "m2", role: "support" }],
        assigneeId: "m1",
      })
    ).toEqual([{ memberId: "m2", role: "support" }]);
  });
});

describe("normalizeAssignments", () => {
  it("drops empty and repeated members, keeps one lead and sorts by role", () => {
    expect(
      normalizeAssignments([
        { memberId: "a", role: "support" },
        { memberId: "b", role: "lead" },
        { memberId: "a", role: "reviewer" },
        { memberId: "", role: "lead" },
        { memberId: "c", role: "lead" },
        { memberId: "d", role: "qa" },
        { memberId: "e", role: "reviewer" },
      ])
    ).toEqual([
      { memberId: "b", role: "lead" },
      { memberId: "a", role: "support" },
      { memberId: "c", role: "support" },
      { memberId: "e", role: "reviewer" },
      { memberId: "d", role: "qa" },
    ]);
  });
});

describe("editing assignments", () => {
  const lead = { memberId: "a", role: "lead" };
  const support = { memberId: "b", role: "support" };

  it("adds the first member as lead and later ones as support", () => {
    expect(addAssignment([], "a")).toEqual([lead]);
    expect(addAssignment([lead], "b")).toEqual([lead, support]);
    expect(addAssignment([lead, support], "b")).toEqual([lead, support]);
    expect(addAssignment([lead], "")).toEqual([lead]);
  });

  it("moves the lead role instead of duplicating it", () => {
    expect(setAssignmentRole([lead, support], "b", "lead")).toEqual([
      { memberId: "b", role: "lead" },
      { memberId: "a", role: "support" },
    ]);
  });

  it("keeps other and custom roles", () => {
    expect(setAssignmentRole([lead, support], "b", "reviewer")).toEqual([
      lead,
      { memberId: "b", role: "reviewer" },
    ]);
    expect(setAssignmentRole([lead, support], "b", "qa")).toEqual([
      lead,
      { memberId: "b", role: "qa" },
    ]);
  });

  it("removes a member", () => {
    expect(removeAssignment([lead, support], "a")).toEqual([support]);
    expect(removeAssignment([lead], "a")).toEqual([]);
  });
});

describe("getLegacyAssigneeId", () => {
  it("points at the lead, else at the first member, else null", () => {
    expect(
      getLegacyAssigneeId([
        { memberId: "b", role: "support" },
        { memberId: "a", role: "lead" },
      ])
    ).toBe("a");
    expect(getLegacyAssigneeId([{ memberId: "b", role: "support" }])).toBe("b");
    expect(getLegacyAssigneeId([])).toBe(null);
  });
});

describe("resolveCardAssignments", () => {
  it("joins members and drops IDs that are not on the board", () => {
    const members = [
      { id: "a", name: "Ana" },
      { id: "b", name: "Luis" },
    ];

    expect(
      resolveCardAssignments(
        {
          assignments: [
            { memberId: "b", role: "support" },
            { memberId: "gone", role: "lead" },
            { memberId: "a", role: "reviewer" },
          ],
        },
        members
      )
    ).toEqual([
      { member: { id: "b", name: "Luis" }, role: "support" },
      { member: { id: "a", name: "Ana" }, role: "reviewer" },
    ]);
    expect(resolveCardAssignments({ assigneeId: "a" }, members)).toEqual([
      { member: { id: "a", name: "Ana" }, role: "lead" },
    ]);
  });
});

describe("labels", () => {
  it("maps built-in roles to translation keys", () => {
    expect(assignmentRoleKey("lead")).toBe("modals.editCard.roleLead");
    expect(assignmentRoleKey("support")).toBe("modals.editCard.roleSupport");
    expect(assignmentRoleKey("reviewer")).toBe("modals.editCard.roleReviewer");
    expect(assignmentRoleKey("qa")).toBe(null);
  });

  it("builds up to two initials", () => {
    expect(getMemberInitials("ana maría pérez")).toBe("AM");
    expect(getMemberInitials("  Luis ")).toBe("L");
  });
});
