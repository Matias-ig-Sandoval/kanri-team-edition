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

import { computed, ref } from "vue";
import { useBoardsStore } from "@/stores/boards";
import {
  collectMemberOptions,
  collectTeamRows,
  computeTeamTotals,
  filterTeamRows,
  summarizeMembers,
} from "@/utils/teamMetrics";

/**
 * Team metrics across all local boards, narrowed by the board and member
 * filters. Members are matched across boards by their normalized name.
 */
export function useTeamMetrics() {
  const store = useBoardsStore();

  // Empty string means "all"
  const boardFilter = ref("");
  const memberFilter = ref("");

  // Reference time for overdue checks, refreshed on init
  const now = ref(new Date());

  const boardOptions = computed(() =>
    store.boards.map((board) => ({ id: board.id, title: board.title }))
  );

  // Members of the selected board, or of all boards
  const memberOptions = computed(() =>
    collectMemberOptions(
      boardFilter.value
        ? store.boards.filter((board) => board.id === boardFilter.value)
        : store.boards
    )
  );

  const allRows = computed(() => collectTeamRows(store.boards, now.value));

  const rows = computed(() =>
    filterTeamRows(allRows.value, {
      boardId: boardFilter.value,
      memberKey: memberFilter.value,
    })
  );

  const totals = computed(() => computeTeamTotals(rows.value));
  const members = computed(() => summarizeMembers(rows.value));

  async function init() {
    await store.init();
    now.value = new Date();
  }

  return {
    boardFilter,
    memberFilter,
    boardOptions,
    memberOptions,
    rows,
    totals,
    members,
    init,
  };
}
