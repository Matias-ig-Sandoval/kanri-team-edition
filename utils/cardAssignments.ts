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

import type {
  BoardMember,
  Card,
  CardAssignment,
} from "@/types/kanban-types";

export const LEAD_ROLE = "lead";

/** Roles offered in the UI, in display order. Other strings stay valid. */
export const ASSIGNMENT_ROLES: Array<string> = [LEAD_ROLE, "support", "reviewer"];

/** Translation key of a built-in role, or null for a custom role */
export const assignmentRoleKey = (role: string): string | null => {
  switch (role) {
    case "lead":
      return "modals.editCard.roleLead";
    case "support":
      return "modals.editCard.roleSupport";
    case "reviewer":
      return "modals.editCard.roleReviewer";
    default:
      return null;
  }
};

const roleRank = (role: string): number => {
  const index = ASSIGNMENT_ROLES.indexOf(role);

  return index === -1 ? ASSIGNMENT_ROLES.length : index;
};

/**
 * Valid assignments in display order: lead first, then support, reviewer and
 * custom roles. Entries without a member are dropped, a member is kept once,
 * and only the first lead stays lead (later ones become support).
 */
export const normalizeAssignments = (
  assignments: Array<CardAssignment>
): Array<CardAssignment> => {
  const seen = new Set<string>();
  const result: Array<CardAssignment> = [];
  let hasLead = false;

  for (const assignment of assignments) {
    if (!assignment || !assignment.memberId) continue;
    if (seen.has(assignment.memberId)) continue;
    seen.add(assignment.memberId);

    let role = assignment.role || "support";
    if (role === LEAD_ROLE) {
      if (hasLead) role = "support";
      hasLead = true;
    }

    result.push({ memberId: assignment.memberId, role });
  }

  // Array.prototype.sort is stable, so members keep their order within a role
  return result.sort((a, b) => roleRank(a.role) - roleRank(b.role));
};

/**
 * Assignments of a card, always normalized. Cards saved before `assignments`
 * existed fall back to the legacy `assigneeId` as their lead.
 */
export const getCardAssignments = (
  card: Pick<Card, "assignments" | "assigneeId">
): Array<CardAssignment> => {
  if (Array.isArray(card.assignments)) {
    return normalizeAssignments(card.assignments);
  }
  if (card.assigneeId) {
    return [{ memberId: card.assigneeId, role: LEAD_ROLE }];
  }

  return [];
};

export interface ResolvedAssignment {
  member: BoardMember;
  role: string;
}

/** Assignments of a card joined with the board members; unknown IDs are dropped */
export const resolveCardAssignments = (
  card: Pick<Card, "assignments" | "assigneeId">,
  members: Array<BoardMember>
): Array<ResolvedAssignment> => {
  const resolved: Array<ResolvedAssignment> = [];

  for (const assignment of getCardAssignments(card)) {
    const member = members.find((m) => m.id === assignment.memberId);
    if (member) resolved.push({ member, role: assignment.role });
  }

  return resolved;
};

/** Legacy `assigneeId` value that matches a list of assignments */
export const getLegacyAssigneeId = (
  assignments: Array<CardAssignment>
): string | null => {
  const normalized = normalizeAssignments(assignments);
  const lead = normalized.find((a) => a.role === LEAD_ROLE) ?? normalized[0];

  return lead ? lead.memberId : null;
};

/**
 * Sets the role of one member. Making someone lead turns the previous lead
 * into support, so a card has one lead at most.
 */
export const setAssignmentRole = (
  assignments: Array<CardAssignment>,
  memberId: string,
  role: string
): Array<CardAssignment> =>
  normalizeAssignments(
    assignments.map((assignment) => {
      if (assignment.memberId === memberId) return { memberId, role };
      if (role === LEAD_ROLE && assignment.role === LEAD_ROLE) {
        return { memberId: assignment.memberId, role: "support" };
      }

      return assignment;
    })
  );

/** Adds a member: lead when the card has no lead yet, otherwise support */
export const addAssignment = (
  assignments: Array<CardAssignment>,
  memberId: string
): Array<CardAssignment> => {
  if (!memberId) return normalizeAssignments(assignments);

  const hasLead = assignments.some((a) => a.role === LEAD_ROLE);

  return normalizeAssignments([
    ...assignments,
    { memberId, role: hasLead ? "support" : LEAD_ROLE },
  ]);
};

export const removeAssignment = (
  assignments: Array<CardAssignment>,
  memberId: string
): Array<CardAssignment> =>
  normalizeAssignments(assignments.filter((a) => a.memberId !== memberId));

/** Up to two initials of a name, for compact member chips */
export const getMemberInitials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
