<!-- SPDX-FileCopyrightText: Copyright (c) 2022-2026 trobonox <hello@trobo.dev>

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
along with this program.  If not, see <https://www.gnu.org/licenses/>. -->

<template>
  <Modal :click-outside-to-close="true" @closeModal="$emit('closeModal')">
    <template #content>
      <main class="h-[36rem] min-w-[32rem] max-w-3xl overflow-auto">
        <div class="flex flex-row items-start justify-between">
          <div class="flex flex-col gap-1">
            <h1 class="pointer-events-auto pr-5 text-2xl font-bold">
              {{ $t("modals.boardPhases.title") }}
            </h1>
            <p class="text-dim-3 inline-block max-w-xl text-sm">
              {{ $t("modals.boardPhases.description") }}
            </p>
          </div>
          <XMarkIcon
            class="text-accent-hover size-6 cursor-pointer"
            @click="$emit('closeModal')"
          />
        </div>
        <section class="mt-4 flex flex-col gap-2">
          <h2 class="text-lg font-semibold">
            {{ $t("modals.boardPhases.listTitle") }}
          </h2>
          <p v-if="phases.length === 0" class="text-dim-3 text-sm">
            {{ $t("modals.boardPhases.empty") }}
          </p>
          <div
            v-for="(phase, index) in phases"
            :key="`${index}-${phase.name}`"
            class="flex flex-row items-center gap-2"
          >
            <span class="text-dim-3 w-5 shrink-0 text-right text-sm"
              >{{ index + 1 }}.</span
            >
            <input
              type="text"
              class="bg-elevation-2 text-normal w-full rounded-md px-2 py-1 outline-none"
              maxlength="1000"
              :value="phase.name"
              :placeholder="$t('modals.boardPhases.namePlaceholder')"
              @change="renamePhase(index, $event)"
            />
            <select
              class="bg-elevation-2 text-dim-1 max-w-[180px] shrink-0 cursor-pointer rounded-md px-1 py-1 text-sm outline-none"
              :value="targetValue(phase)"
              :title="$t('modals.editCard.taskTargetTooltip')"
              @change="setPhaseTarget(index, $event)"
            >
              <option value="">
                {{ $t("modals.editCard.taskTargetNone") }}
              </option>
              <option
                v-for="column in columns"
                :key="column.id"
                :value="column.id"
              >
                → {{ column.title }}
              </option>
            </select>
            <button class="shrink-0" @click="removePhase(index)">
              <XMarkIcon class="text-dim-2 text-accent-hover size-4" />
            </button>
          </div>
          <div class="mt-2 flex flex-row items-center gap-2">
            <input
              v-model="newPhaseName"
              type="text"
              class="bg-elevation-2 text-normal border-accent-focus w-full rounded-md px-2 py-1 focus:border-2 focus:border-dotted focus:outline-none"
              maxlength="1000"
              :placeholder="$t('modals.boardPhases.namePlaceholder')"
              @keypress.enter="addPhase"
            />
            <button
              class="bg-accent text-buttons shrink-0 rounded-md px-4 py-1"
              @click="addPhase"
            >
              {{ $t("general.addAction") }}
            </button>
          </div>
        </section>
      </main>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { XMarkIcon } from "@heroicons/vue/24/solid";
import type { BoardPhase, Column } from "@/types/kanban-types";

const props = defineProps<{
  phases: Array<BoardPhase>;
  columns: Array<Column>;
}>();

const emit = defineEmits<{
  (e: "closeModal"): void;
  (e: "setDefaultPhases", phases: Array<BoardPhase>): void;
}>();

const newPhaseName = ref("");

const copyPhases = () => props.phases.map((phase) => ({ ...phase }));

// Empty when the phase has no target or its column no longer exists
const targetValue = (phase: BoardPhase) => {
  if (!phase.targetColumnId) return "";

  return props.columns.some((column) => column.id === phase.targetColumnId)
    ? phase.targetColumnId
    : "";
};

const addPhase = () => {
  const name = newPhaseName.value.trim();
  if (!name) return;

  emit("setDefaultPhases", [...copyPhases(), { name, targetColumnId: null }]);
  newPhaseName.value = "";
};

const renamePhase = (index: number, event: Event) => {
  const name = (event.target as HTMLInputElement).value.trim();
  const next = copyPhases();
  const phase = next[index];
  if (!phase || !name) return;

  phase.name = name;
  emit("setDefaultPhases", next);
};

const setPhaseTarget = (index: number, event: Event) => {
  const value = (event.target as HTMLSelectElement).value;
  const next = copyPhases();
  const phase = next[index];
  if (!phase) return;

  phase.targetColumnId = value || null;
  emit("setDefaultPhases", next);
};

const removePhase = (index: number) => {
  emit(
    "setDefaultPhases",
    copyPhases().filter((_, phaseIndex) => phaseIndex !== index)
  );
};
</script>
