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

export declare interface Board {
  background?: BackgroundSettings | null;
  columns: Array<Column>;
  id: string;
  lastEdited?: Date | string;
  createdAt?: Date | string;
  title: string;
  globalTags?: Array<Tag> | null;
  members?: Array<BoardMember> | null;
  /** Template of phases that can be loaded into any card as tasks */
  defaultPhases?: Array<BoardPhase> | null;
}

export declare interface BoardPhase {
  name: string;
  targetColumnId?: string | null;
}

export declare interface BoardMember {
  id: string;
  name: string;
  role?: string;
  color?: string | null;
}

export declare interface BackgroundSettings {
  blur: string;
  brightness: string;
  src: string;
}

export declare interface Column {
  cards: Array<Card>;
  id: string;
  title: string;
}

export declare interface Task {
  finished: boolean;
  id?: string;
  name: string;
  /** Column the card moves to when this task gets finished */
  targetColumnId?: string | null;
}

export declare interface Tag {
  id?: string;
  text: string;
  style?: string;
  color?: string | null;
}

export declare interface Card {
  /** ID of a BoardMember in the parent board's `members` list */
  assigneeId?: string | null;
  /** Manual progress (0-100). Ignored while the card has tasks. */
  progress?: number | null;
  color?: string;
  description?: string;
  dueDate?: Date | string | null;
  id?: string;
  isDueDateCounterRelative?: boolean;
  isDueDateCompleted?: boolean;
  name: string;
  tasks?: Array<Task>;
  tags?: Array<Tag> | null;
}

export declare interface Theme {
  accent: string;
  accentDarker: string;
  bgPrimary: string;
  elevation1: string;
  elevation2: string;
  elevation3: string;
  text: string;
  textButtons: string;
  textD1: string;
  textD2: string;
  textD3: string;
  textD4: string;
}

export declare type ThemeIdentifiers =
  | "catppuccin"
  | "custom"
  | "dark"
  | "light"
  | "auto";

export default {
  Board,
  Card,
  Column,
  ThemeIdentifiers,
};
