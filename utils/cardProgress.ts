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

import type { Card } from "@/types/kanban-types";

export const clampProgress = (value: unknown): number => {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return 0;

  return Math.min(100, Math.max(0, Math.round(numeric)));
};

/**
 * Progress of a card in percent (0-100).
 * Cards with tasks derive it from the finished tasks.
 * Cards without tasks use the manual `progress` value (default 0).
 */
export const getCardProgress = (
  card: Pick<Card, "tasks" | "progress">
): number => {
  const tasks = card.tasks ?? [];
  if (tasks.length > 0) {
    const finished = tasks.filter((task) => task.finished).length;
    return Math.round((finished / tasks.length) * 100);
  }

  return clampProgress(card.progress ?? 0);
};
