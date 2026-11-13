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
  <main id="team" class="overflow-auto px-8 pb-8 pt-6">
    <header class="flex flex-row flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-4xl font-bold">{{ $t("pages.team.heading") }}</h1>
        <span class="text-dim-3">{{ $t("pages.team.headingSubtext") }}</span>
      </div>
      <div class="flex flex-row flex-wrap gap-2">
        <button
          class="bg-elevation-1 bg-elevation-2-hover transition-button flex flex-row items-center gap-2 rounded-md px-4 py-1.5 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="rows.length === 0"
          @click="copyMarkdown"
        >
          <PhCheck v-if="markdownCopied" class="size-5" />
          <PhClipboardText v-else class="size-5" />
          <span>{{
            markdownCopied
              ? $t("pages.team.markdownCopied")
              : $t("pages.team.copyMarkdown")
          }}</span>
        </button>
        <button
          class="bg-accent text-buttons transition-button flex flex-row items-center gap-2 rounded-md px-4 py-1.5 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="rows.length === 0"
          @click="exportCsv"
        >
          <PhExport class="size-5" />
          <span>{{ $t("pages.team.exportCsv") }}</span>
        </button>
      </div>
    </header>

    <section
      id="team-kpis"
      class="mt-6 grid grid-cols-2 gap-4 xl:grid-cols-4"
    >
      <div
        v-for="kpi in kpis"
        :key="kpi.label"
        class="bg-elevation-1 flex flex-col gap-1 rounded-md p-4"
      >
        <span class="text-dim-2 text-sm">{{ kpi.label }}</span>
        <span
          class="text-3xl font-bold"
          :class="kpi.alert ? 'text-red-500' : ''"
          >{{ kpi.value }}</span
        >
      </div>
    </section>

    <section
      id="team-filters"
      class="mt-6 flex flex-row flex-wrap items-end gap-4"
    >
      <label class="flex flex-col gap-1">
        <span class="text-dim-2 text-sm">{{
          $t("pages.team.filterBoard")
        }}</span>
        <select
          v-model="boardFilter"
          class="bg-elevation-1 border-elevation-3 text-normal min-w-56 rounded-md border px-2 py-1.5 outline-none"
        >
          <option value="">{{ $t("pages.team.allBoards") }}</option>
          <option
            v-for="board in boardOptions"
            :key="board.id"
            :value="board.id"
          >
            {{ board.title }}
          </option>
        </select>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-dim-2 text-sm">{{
          $t("pages.team.filterMember")
        }}</span>
        <select
          v-model="memberFilter"
          class="bg-elevation-1 border-elevation-3 text-normal min-w-56 rounded-md border px-2 py-1.5 outline-none"
        >
          <option value="">{{ $t("pages.team.allMembers") }}</option>
          <option
            v-for="member in memberOptions"
            :key="member.key"
            :value="member.key"
          >
            {{ member.name }}
          </option>
          <option :value="UNASSIGNED_KEY">
            {{ $t("pages.team.unassigned") }}
          </option>
        </select>
      </label>
    </section>

    <p v-if="members.length === 0" class="text-dim-3 mt-8">
      {{ $t("pages.team.empty") }}
    </p>

    <section id="team-members" class="mt-6 flex flex-col gap-3">
      <article
        v-for="member in members"
        :key="member.key"
        class="bg-elevation-1 rounded-md"
      >
        <button
          class="bg-elevation-2-hover flex w-full flex-row flex-wrap items-center gap-x-6 gap-y-2 rounded-md p-4 text-left"
          :aria-expanded="isExpanded(member.key)"
          @click="toggleExpanded(member.key)"
        >
          <div class="flex min-w-48 flex-row items-center gap-3">
            <PhCaretDown v-if="isExpanded(member.key)" class="size-4 shrink-0" />
            <PhCaretRight v-else class="size-4 shrink-0" />
            <span
              class="size-3 shrink-0 rounded-full"
              :class="member.color ? '' : 'bg-elevation-4'"
              :style="member.color ? { 'background-color': member.color } : {}"
            />
            <div class="flex flex-col">
              <span class="font-semibold">{{ memberLabel(member) }}</span>
              <span v-if="member.role" class="text-dim-3 text-sm">{{
                member.role
              }}</span>
            </div>
          </div>

          <div class="flex min-w-48 flex-1 flex-row items-center gap-3">
            <div
              class="bg-elevation-3 relative h-2 w-full overflow-hidden rounded-full"
            >
              <div
                class="bg-accent-no-hover h-full rounded-full transition-[width] duration-300"
                :style="{ width: `${member.averageProgress}%` }"
              />
            </div>
            <span class="text-dim-1 w-12 shrink-0 text-right text-sm"
              >{{ member.averageProgress }}%</span
            >
          </div>

          <div class="text-dim-1 flex flex-row flex-wrap items-center gap-2 text-sm">
            <span class="bg-elevation-3 rounded-sm px-2 py-0.5">{{
              $t("pages.team.cardCount", { count: member.total })
            }}</span>
            <template v-if="member.key !== UNASSIGNED_KEY">
              <span class="bg-elevation-3 rounded-sm px-2 py-0.5">{{
                $t("pages.team.leadCount", { count: member.leading })
              }}</span>
              <span class="bg-elevation-3 rounded-sm px-2 py-0.5">{{
                $t("pages.team.supportCount", { count: member.supporting })
              }}</span>
            </template>
            <span
              v-for="status in CARD_STATUSES"
              :key="status"
              class="bg-elevation-2 rounded-sm px-2 py-0.5"
              >{{ statusLabels[status] }}: {{ member.byStatus[status] }}</span
            >
            <span
              v-if="member.overdue > 0"
              class="rounded-sm bg-red-600 px-2 py-0.5 text-gray-50"
              >{{ $t("pages.team.overdueCount", { count: member.overdue }) }}</span
            >
          </div>
        </button>

        <div v-if="isExpanded(member.key)" class="overflow-x-auto px-4 pb-4">
          <table class="w-full text-left text-sm">
            <thead class="text-dim-2">
              <tr>
                <th class="py-2 pr-4 font-medium">
                  {{ $t("pages.team.columnTask") }}
                </th>
                <th class="py-2 pr-4 font-medium">
                  {{ $t("pages.team.columnTaskRole") }}
                </th>
                <th class="py-2 pr-4 font-medium">
                  {{ $t("pages.team.columnBoard") }}
                </th>
                <th class="py-2 pr-4 font-medium">
                  {{ $t("pages.team.columnColumn") }}
                </th>
                <th class="py-2 pr-4 font-medium">
                  {{ $t("pages.team.columnPhases") }}
                </th>
                <th class="py-2 pr-4 font-medium">
                  {{ $t("pages.team.columnProgress") }}
                </th>
                <th class="py-2 font-medium">
                  {{ $t("pages.team.columnDueDate") }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="card in member.cards"
                :key="`${card.cardKey}/${card.memberKey}`"
                class="border-elevation-3 bg-elevation-2-hover cursor-pointer border-t"
                :title="$t('pages.team.openBoard', { board: card.boardTitle })"
                @click="openBoard(card.boardId)"
              >
                <td class="max-w-72 truncate py-2 pr-4">{{ card.cardName }}</td>
                <td
                  class="whitespace-nowrap py-2 pr-4"
                  :class="card.assignmentRole === LEAD_ROLE ? 'font-semibold' : ''"
                >
                  {{ card.assignmentRole ? formatRole(card.assignmentRole) : "–" }}
                </td>
                <td class="text-accent max-w-48 truncate py-2 pr-4 underline">
                  {{ card.boardTitle }}
                </td>
                <td class="py-2 pr-4">
                  <span class="max-w-40 truncate">{{ card.columnTitle }}</span>
                  <span class="text-dim-3"> · {{ statusLabels[card.status] }}</span>
                </td>
                <td class="whitespace-nowrap py-2 pr-4">
                  {{
                    card.milestonesTotal > 0
                      ? $t("modals.editCard.milestones", {
                          finished: card.milestonesFinished,
                          total: card.milestonesTotal,
                        })
                      : "–"
                  }}
                </td>
                <td class="py-2 pr-4">
                  <div class="flex flex-row items-center gap-2">
                    <div
                      class="bg-elevation-3 relative h-1.5 w-20 overflow-hidden rounded-full"
                    >
                      <div
                        class="bg-accent-no-hover h-full rounded-full"
                        :style="{ width: `${card.progress}%` }"
                      />
                    </div>
                    <span class="text-dim-1">{{ card.progress }}%</span>
                  </div>
                </td>
                <td class="whitespace-nowrap py-2">
                  <span
                    v-if="card.dueDate"
                    :class="
                      card.overdue
                        ? 'rounded-sm bg-red-600 px-1.5 py-0.5 text-gray-50'
                        : ''
                    "
                    >{{ formatDate(card.dueDate) }}</span
                  >
                  <span v-else class="text-dim-3">–</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>
    </section>
  </main>
</template>

<script setup lang="ts">
import {
  PhCaretDown,
  PhCaretRight,
  PhCheck,
  PhClipboardText,
  PhExport,
} from "@phosphor-icons/vue";
import { save } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";

import { useTeamMetrics } from "@/composables/useTeamMetrics";
import { LEAD_ROLE, assignmentRoleKey } from "@/utils/cardAssignments";
import {
  CARD_STATUSES,
  UNASSIGNED_KEY,
  teamRowsToCsv,
  teamRowsToMarkdown,
} from "@/utils/teamMetrics";
import type {
  CardStatus,
  TeamMemberSummary,
  TeamReportLabels,
} from "@/utils/teamMetrics";

const { t, locale } = useI18n();
const router = useRouter();

const {
  boardFilter,
  memberFilter,
  boardOptions,
  memberOptions,
  rows,
  totals,
  members,
  init,
} = useTeamMetrics();

const expandedMembers = ref<Array<string>>([]);
const markdownCopied = ref(false);

onMounted(async () => {
  await init();
});

// A member that is not part of the newly selected board cannot stay selected
watch(boardFilter, () => {
  const stillAvailable =
    memberFilter.value === "" ||
    memberFilter.value === UNASSIGNED_KEY ||
    memberOptions.value.some((member) => member.key === memberFilter.value);

  if (!stillAvailable) memberFilter.value = "";
});

const statusLabels = computed<Record<CardStatus, string>>(() => ({
  initial: t("pages.team.statusInitial"),
  inProgress: t("pages.team.statusInProgress"),
  review: t("pages.team.statusReview"),
  done: t("pages.team.statusDone"),
}));

const kpis = computed(() => [
  { label: t("pages.team.kpiTotal"), value: `${totals.value.total}`, alert: false },
  {
    label: t("pages.team.kpiAverageProgress"),
    value: `${totals.value.averageProgress}%`,
    alert: false,
  },
  {
    label: t("pages.team.kpiFinished"),
    value: `${totals.value.finished}`,
    alert: false,
  },
  {
    label: t("pages.team.kpiOverdue"),
    value: `${totals.value.overdue}`,
    alert: totals.value.overdue > 0,
  },
]);

const memberLabel = (member: TeamMemberSummary) =>
  member.key === UNASSIGNED_KEY ? t("pages.team.unassigned") : member.name;

const isExpanded = (key: string) => expandedMembers.value.includes(key);

const toggleExpanded = (key: string) => {
  expandedMembers.value = isExpanded(key)
    ? expandedMembers.value.filter((expandedKey) => expandedKey !== key)
    : [...expandedMembers.value, key];
};

const formatDate = (isoDate: string) =>
  new Date(isoDate).toLocaleDateString(locale.value.replace("_", "-"));

// Label of a member's role on a card; custom roles are shown as typed
const formatRole = (role: string) => {
  const key = assignmentRoleKey(role);

  return key ? t(key) : role;
};

const openBoard = (boardId: string) => {
  router.push(`/kanban/${boardId}`);
};

const reportLabels = computed<TeamReportLabels>(() => ({
  headers: [
    t("pages.team.columnMember"),
    t("pages.team.columnRole"),
    t("pages.team.columnTaskRole"),
    t("pages.team.columnBoard"),
    t("pages.team.columnTask"),
    t("pages.team.columnColumn"),
    t("pages.team.columnStatus"),
    t("pages.team.columnPhases"),
    t("pages.team.columnProgress"),
    t("pages.team.columnDueDate"),
  ],
  unassigned: t("pages.team.unassigned"),
  statuses: statusLabels.value,
  formatRole,
  formatDate,
}));

// Same order as the page: grouped by member, unassigned last
const reportRows = computed(() => members.value.flatMap((member) => member.cards));

const exportCsv = async () => {
  if (rows.value.length === 0) return;

  const filePath = await save({
    defaultPath: `./${new Date().toISOString().slice(0, 10)}_kanri_team_report.csv`,
    filters: [{ extensions: ["csv"], name: "CSV" }],
    title: t("pages.team.exportCsv"),
  });
  if (filePath == null) return;

  await writeTextFile(
    filePath,
    teamRowsToCsv(reportRows.value, reportLabels.value)
  );
};

const copyMarkdown = async () => {
  if (rows.value.length === 0) return;

  const summaryLine = t("pages.team.markdownSummary", {
    total: totals.value.total,
    progress: totals.value.averageProgress,
    finished: totals.value.finished,
    overdue: totals.value.overdue,
  });

  await navigator.clipboard.writeText(
    teamRowsToMarkdown(
      reportRows.value,
      reportLabels.value,
      t("pages.team.heading"),
      summaryLine
    )
  );

  markdownCopied.value = true;
  setTimeout(() => {
    markdownCopied.value = false;
  }, 2000);
};
</script>
