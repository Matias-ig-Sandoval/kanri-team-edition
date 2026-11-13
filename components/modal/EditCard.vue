<!-- SPDX-FileCopyrightText: Copyright (c) 2022-2026 trobonox <hello@trobo.dev>, Khusyasy, gitoak -->
<!-- -->
<!-- SPDX-License-Identifier: Apache-2.0 -->
<!--
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

<template>
  <Modal
    :blur-background="false"
    @closeModal="
      $emit('closeModal', columnID);
      titleEditing = false;
      taskAddMode = false;
      showCustomColorPopup = false;
      emitter.emit('columnDraggingOn');
    "
  >
    <template #content>
      <div class="flex h-[40rem] w-[36rem] flex-col pl-2">
        <div class="mb-4">
          <div class="flex flex-row items-start justify-between gap-12">
            <div
              class="relative -left-8 top-0 flex flex-row items-center gap-2"
            >
              <div @blur="showCustomColorPopup = false">
                <Tooltip direction="top" :label="$t('modals.editCard.tooltip')">
                  <template #trigger>
                    <button
                      class="size-7 rounded-full flex items-center justify-center"
                      :class="[isCustomColor ? '' : selectedColor]"
                      :style="{
                        'background-color': isCustomColor ? customColor : '',
                      }"
                      @click="showCustomColorPopup = !showCustomColorPopup"
                    >
                      <SwatchIcon
                        :class="[
                          'stroke-2',
                          'size-3.5',
                          isCustomColor ? getContrast(customColor) : '',
                        ]"
                      />
                    </button>
                  </template>
                </Tooltip>
                <div
                  v-if="showCustomColorPopup"
                  v-on-click-outside="() => (showCustomColorPopup = false)"
                >
                  <div
                    class="border-b-bg-primary absolute left-0 top-4 z-10 size-0 border-x-[12px] border-b-[20px] border-x-transparent"
                    @click="showCustomColorPopup = false"
                  />
                  <div
                    class="bg-primary border-elevation-1 absolute -left-4 top-8 z-20 flex flex-col gap-1 rounded-md border p-3"
                  >
                    <h2 class="mb-1 text-lg font-semibold">
                      {{ $t("modals.editCard.colorTitle") }}
                    </h2>
                    <div class="flex w-full flex-row gap-3">
                      <button
                        class="size-7 rounded-full bg-pink-600 py-1 pl-1.5 pr-1 hover:bg-pink-700"
                        @click="setCardColor(columnID, card?.id, 'bg-pink-600')"
                      >
                        <CheckIcon
                          v-if="selectedColor === 'bg-pink-600'"
                          class="size-4"
                        />
                      </button>
                      <button
                        class="size-7 rounded-full bg-red-600 py-1 pl-1.5 pr-1 hover:bg-red-700"
                        @click="setCardColor(columnID, card?.id, 'bg-red-600')"
                      >
                        <CheckIcon
                          v-if="selectedColor === 'bg-red-600'"
                          class="size-4"
                        />
                      </button>
                      <button
                        class="size-7 rounded-full bg-orange-600 py-1 pl-1.5 pr-1 hover:bg-orange-700"
                        @click="
                          setCardColor(columnID, card?.id, 'bg-orange-600')
                        "
                      >
                        <CheckIcon
                          v-if="selectedColor === 'bg-orange-600'"
                          class="size-4"
                        />
                      </button>
                      <button
                        class="size-7 rounded-full bg-yellow-600 py-1 pl-1.5 pr-1 hover:bg-yellow-700"
                        @click="
                          setCardColor(columnID, card?.id, 'bg-yellow-600')
                        "
                      >
                        <CheckIcon
                          v-if="selectedColor === 'bg-yellow-600'"
                          class="size-4"
                        />
                      </button>
                      <button
                        class="size-7 rounded-full bg-green-600 py-1 pl-1.5 pr-1 hover:bg-green-700"
                        @click="
                          setCardColor(columnID, card?.id, 'bg-green-600')
                        "
                      >
                        <CheckIcon
                          v-if="selectedColor === 'bg-green-600'"
                          class="size-4"
                        />
                      </button>
                      <button
                        class="size-7 rounded-full bg-teal-600 py-1 pl-1.5 pr-1 hover:bg-teal-700"
                        @click="setCardColor(columnID, card?.id, 'bg-teal-600')"
                      >
                        <CheckIcon
                          v-if="selectedColor === 'bg-teal-600'"
                          class="size-4"
                        />
                      </button>
                      <button
                        class="size-7 rounded-full bg-blue-600 py-1 pl-1.5 pr-1 hover:bg-blue-700"
                        @click="setCardColor(columnID, card?.id, 'bg-blue-600')"
                      >
                        <CheckIcon
                          v-if="selectedColor === 'bg-blue-600'"
                          class="size-4"
                        />
                      </button>
                      <button
                        class="size-7 rounded-full bg-purple-600 py-1 pl-1.5 pr-1 hover:bg-purple-700"
                        @click="
                          setCardColor(columnID, card?.id, 'bg-purple-600')
                        "
                      >
                        <CheckIcon
                          v-if="selectedColor === 'bg-purple-600'"
                          class="size-4"
                        />
                      </button>
                      <button
                        class="bg-elevation-2 bg-elevation-3-hover size-7 rounded-full py-1 pl-1.5 pr-1"
                        @click="
                          setCardColor(columnID, card?.id, 'bg-elevation-2')
                        "
                      >
                        <CheckIcon
                          v-if="selectedColor === 'bg-elevation-2'"
                          class="size-4"
                        />
                      </button>
                      <button
                        :class="`h-7 w-7 rounded-full py-1 pl-1.5 pr-1`"
                        :style="{ 'background-color': customColor }"
                        @click="setCardColor(columnID, card?.id, customColor)"
                      >
                        <CheckIcon
                          v-if="isCustomColor"
                          :class="['h-4', 'w-4', getContrast(customColor)]"
                        />
                        <SwatchIcon
                          v-else
                          :class="[
                            'stroke-2',
                            'h-4',
                            'w-4',
                            getContrast(customColor),
                          ]"
                        />
                      </button>
                    </div>
                    <div v-if="isCustomColor">
                      <h3 class="mb-1 mt-2 font-semibold">
                        {{ $t("modals.editCard.colorCustom") }}
                      </h3>
                      <div class="flex w-full flex-row gap-4">
                        <input
                          v-model="customColor"
                          class="w-20"
                          type="color"
                        />
                        <HexColorInput v-model="customColor" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <h1
                v-if="!titleEditing"
                :v-model="title"
                class="text-no-overflow pointer-events-auto min-w-[64px] max-w-[475px] pr-5 text-2xl font-bold"
                @click="enableTitleEditing()"
              >
                {{ title }}
              </h1>
              <textarea
                v-if="titleEditing"
                ref="titleTextArea"
                v-model="title"
                v-focus
                class="bg-elevation-2 text-normal border-accent-focus pointer-events-auto w-[450px] text-xl focus:border-2 focus:border-dotted focus:outline-none"
                maxlength="1000"
                type="text"
                @blur="updateTitle"
                @keypress.enter="updateTitle"
              />
            </div>
            <XMarkIcon
              class="text-accent-hover size-6 shrink-0 cursor-pointer"
              @click="
                $emit('closeModal', columnID);
                titleEditing = false;
                taskAddMode = false;
                showCustomColorPopup = false;
                emitter.emit('columnDraggingOn');
              "
            />
          </div>
          <div class="flex flex-row items-center gap-2">
            <VDatePicker
              v-model="dueDate"
              mode="dateTime"
              is24hr
              @update:modelValue="updateDueDate"
            >
              <template #default="{ togglePopover }">
                <button
                  class="bg-elevation-2 bg-elevation-3-hover mt-1 flex items-center justify-center gap-2 rounded-md px-2 py-1"
                  @click="() => togglePopover()"
                >
                  <PhCalendar class="size-5" />
                  <span v-if="dueDate"
                    >{{ $t("modals.editCard.dueDate")
                    }}{{ dateToLocalFormat(dueDate) }}</span
                  >
                  <span v-else>{{ $t("modals.editCard.dateSet") }}</span>
                </button>
              </template>
              <template #footer>
                <div class="w-full px-4 pb-3">
                  <div class="mt-2 flex flex-col gap-2">
                    <div class="flex flex-row items-center gap-6 mb-2">
                      <SwitchRoot
                        v-model:checked="isDueDateCounterRelative"
                        class="bg-elevation-2 bg-accent-checked relative flex h-[24px] w-[42px] cursor-pointer rounded-full shadow-sm focus-within:outline focus-within:outline-black"
                        @update:checked="updateDueDate"
                      >
                        <SwitchThumb
                          class="bg-button-text my-auto block size-[18px] translate-x-0.5 rounded-full shadow-sm transition-transform duration-100 will-change-transform data-[state=checked]:translate-x-[19px]"
                        />
                      </SwitchRoot>
                      <p>{{ $t("modals.editCard.countdown") }}</p>
                    </div>

                    <button
                      class="bg-elevation-1 bg-elevation-2-hover flex flex-row items-center justify-center gap-2 rounded-md px-2 py-1"
                      @click="resetDueDate"
                    >
                      <PhTrash class="mt-0.5 size-5" />
                      {{ $t("modals.editCard.dateRemove") }}
                    </button>
                    <button
                      class="bg-accent flex flex-row items-center justify-center gap-2 rounded-md px-2 py-1"
                      @click="isDueDateCompleted = !isDueDateCompleted; markDueDateCompleted()"
                    >
                      <PhCheck v-if="!isDueDateCompleted" class="mt-0.5 size-5" />
                      <PhX v-else class="mt-0.5 size-5" />
                      {{ isDueDateCompleted ? 'Mark Not Completed' : 'Set as Completed' }}
                    </button>
                  </div>
                </div>
              </template>
            </VDatePicker>
          </div>
        </div>

        <div class="overflow-auto">
          <div class="flex flex-col pr-6">
            <h2 class="text-lg font-semibold">
              {{ $t("modals.editCard.descriptionTitle") }}
            </h2>
            <KanbanDescriptionEditor
              v-model="description"
              @editorBlurred="updateDescription"
            />
          </div>
          <div class="mt-4 flex flex-col pr-6">
            <h2 class="text-lg font-semibold">
              {{ $t("modals.editCard.assigneeTitle") }}
            </h2>
            <p v-if="cardAssignments.length === 0" class="text-dim-3 mt-1 text-sm">
              {{ $t("modals.editCard.assigneeNone") }}
            </p>
            <div v-else class="mt-1 flex flex-col gap-2">
              <div
                v-for="assignment in cardAssignments"
                :key="assignment.member.id"
                class="flex flex-row items-center gap-2"
              >
                <span
                  class="size-3 shrink-0 rounded-full"
                  :class="assignment.member.color ? '' : 'bg-elevation-4'"
                  :style="
                    assignment.member.color
                      ? { 'background-color': assignment.member.color }
                      : {}
                  "
                />
                <span
                  class="w-full truncate"
                  :class="assignment.role === LEAD_ROLE ? 'font-semibold' : ''"
                  >{{
                    assignment.member.role
                      ? `${assignment.member.name} (${assignment.member.role})`
                      : assignment.member.name
                  }}</span
                >
                <select
                  class="bg-elevation-2 text-normal w-44 shrink-0 cursor-pointer rounded-md px-1 py-1 text-sm outline-none"
                  :value="assignment.role"
                  @change="updateAssignmentRole(assignment.member.id, $event)"
                >
                  <option
                    v-for="role in roleOptions(assignment.role)"
                    :key="role"
                    :value="role"
                  >
                    {{ roleLabel(role) }}
                  </option>
                </select>
                <button
                  class="shrink-0"
                  @click="removeCardAssignment(assignment.member.id)"
                >
                  <XMarkIcon class="text-dim-2 text-accent-hover size-4" />
                </button>
              </div>
            </div>
            <select
              v-if="unassignedMembers.length > 0"
              class="bg-elevation-1 border-elevation-3 text-normal mt-2 w-full cursor-pointer rounded-md border px-2 py-1.5 outline-none"
              :value="''"
              @change="addCardAssignment"
            >
              <option value="" disabled>
                {{ $t("modals.editCard.assignmentAdd") }}
              </option>
              <option
                v-for="member in unassignedMembers"
                :key="member.id"
                :value="member.id"
              >
                {{ member.role ? `${member.name} (${member.role})` : member.name }}
              </option>
            </select>
            <button
              class="bg-elevation-3 mt-2 w-fit rounded-md px-2 py-0.5 text-sm"
              @click="memberManageMode = !memberManageMode"
            >
              {{ $t("modals.editCard.membersEdit") }}
            </button>
            <div v-if="memberManageMode" class="mt-2 flex flex-col gap-2">
              <div
                v-for="member in members"
                :key="member.id"
                class="flex flex-row items-center gap-2"
              >
                <input
                  type="color"
                  class="size-7 shrink-0 cursor-pointer rounded-md border-none bg-transparent p-0"
                  :value="member.color || defaultMemberColor"
                  @change="updateMemberField(member.id, 'color', $event)"
                />
                <input
                  type="text"
                  class="bg-elevation-2 text-normal w-full rounded-md px-2 py-1 outline-none"
                  maxlength="100"
                  :value="member.name"
                  :placeholder="$t('modals.editCard.memberNamePlaceholder')"
                  @change="updateMemberField(member.id, 'name', $event)"
                />
                <input
                  type="text"
                  class="bg-elevation-2 text-normal w-full rounded-md px-2 py-1 outline-none"
                  maxlength="100"
                  :value="member.role ?? ''"
                  :placeholder="$t('modals.editCard.memberRolePlaceholder')"
                  @change="updateMemberField(member.id, 'role', $event)"
                />
                <button class="shrink-0" @click="$emit('removeMember', member.id)">
                  <XMarkIcon class="text-dim-2 text-accent-hover size-4" />
                </button>
              </div>
              <div class="flex flex-row items-center gap-2">
                <input
                  v-model="newMemberName"
                  type="text"
                  class="bg-elevation-2 text-normal border-accent-focus w-full rounded-md px-2 py-1 focus:border-2 focus:border-dotted focus:outline-none"
                  maxlength="100"
                  :placeholder="$t('modals.editCard.memberNamePlaceholder')"
                  @keypress.enter="createMember"
                />
                <button
                  class="bg-accent text-buttons shrink-0 rounded-md px-4 py-1"
                  @click="createMember"
                >
                  {{ $t("general.addAction") }}
                </button>
              </div>
            </div>
          </div>
          <div>
            <div class="mb-1 mt-4 flex flex-row items-center gap-2">
              <h2 class="text-lg font-semibold">
                {{ $t("modals.editCard.taskTitle") }}
              </h2>
              <span v-if="tasks.length !== 0" class="text-dim-1 text-sm"
                >({{
                  $t("modals.editCard.milestones", {
                    finished: getCheckedTaskNumber,
                    total: tasks.length,
                  })
                }})</span
              >
            </div>
            <ProgressRoot
              v-if="tasks"
              v-model="getTaskPercentage"
              class="bg-elevation-2 relative mb-4 h-2 w-[96%] overflow-hidden rounded-full"
              style="transform: translateZ(0)"
            >
              <ProgressIndicator
                class="ease-[cubic-bezier(0.65, 0, 0.35, 1)] bg-accent-no-hover size-full rounded-full transition-transform duration-[660ms]"
                :style="`transform: translateX(-${100 - getTaskPercentage}%)`"
              />
            </ProgressRoot>
            <div
              v-if="tasks.length === 0"
              class="mb-4 flex w-[96%] flex-row items-center gap-3"
            >
              <span class="text-dim-1 shrink-0 text-sm">{{
                $t("modals.editCard.progressManual")
              }}</span>
              <input
                v-model.number="manualProgress"
                type="range"
                min="0"
                max="100"
                step="5"
                class="w-full cursor-pointer"
                @change="updateProgress"
              />
              <span class="text-dim-1 w-10 shrink-0 text-right text-sm"
                >{{ manualProgress }}%</span
              >
            </div>
            <div class="flex w-full flex-col gap-1">
              <div
                v-if="tasks && tasks.length !== 0"
                class="flex max-h-[250px] w-[calc(100%-17px)] flex-col gap-4 overflow-auto pl-1 pr-4 resize-y"
              >
                <Container
                  drag-class="cursor-grabbing"
                  drag-handle-selector=".task-drag"
                  lock-axis="y"
                  orientation="vertical"
                  @drop="onTaskDrop"
                  :get-child-payload="(index: number) => tasks[index]"
                >
                  <Draggable
                    v-for="(task, index) in tasks"
                    :key="task.id"
                    :class="draggingEnabled ? 'task-drag' : 'nomoredragging'"
                    :index="index"
                  >
                    <div
                      class="mb-1 flex w-full flex-row items-center justify-between gap-4"
                    >
                      <div
                        class="flex w-full flex-row items-center justify-start gap-4"
                      >
                        <CheckboxRoot
                          v-model:checked="task.finished"
                          class="bg-elevation-4 bg-elevation-2-hover border-elevation-5 flex size-5 shrink-0 appearance-none items-center justify-center rounded-[4px] border outline-none"
                          @update:checked="
                            (checked: boolean) => onTaskChecked(task, checked)
                          "
                        >
                          <CheckboxIndicator
                            class="flex size-full items-center justify-center rounded"
                          >
                            <PhCheck
                              weight="bold"
                              class="text-accent-lighter size-4"
                            />
                          </CheckboxIndicator>
                        </CheckboxRoot>
                        <input
                          v-if="
                            taskEditMode && index === currentlyEditingTaskIndex
                          "
                          v-model="currentlyEditingTaskName"
                          v-focus
                          class="bg-elevation-2 border-accent -mx-1.5 w-full rounded-md border-b-2 border-dotted px-1.5 py-0.5 outline-none"
                          type="text"
                          @blur="updateTask(index)"
                          @keypress.enter="updateTask(index)"
                        />
                        <ClickCounter
                          v-else
                          @double-click="enableTaskEditMode(index, task)"
                        >
                          <span class="text-no-overflow-task w-full">{{
                            task.name
                          }}</span>
                        </ClickCounter>
                      </div>
                      <div
                        class="ml-1 flex h-full shrink-0 flex-row items-end gap-1 self-center"
                      >
                        <select
                          class="bg-elevation-2 text-dim-1 mr-1 max-w-[150px] shrink-0 cursor-pointer rounded-md px-1 py-0.5 text-xs outline-none"
                          :value="taskTargetValue(task)"
                          :title="$t('modals.editCard.taskTargetTooltip')"
                          @change="updateTaskTarget(task, $event)"
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
                        <button
                          v-if="!taskEditMode"
                          class="shrink-0"
                          @click="enableTaskEditMode(index, task)"
                        >
                          <PhPencilSimple
                            class="text-dim-2 text-accent-hover size-4"
                          />
                        </button>
                        <button
                          v-if="
                            taskEditMode && currentlyEditingTaskIndex === index
                          "
                          class="shrink-0"
                          @click="updateTask(index)"
                        >
                          <PhCheck
                            class="text-dim-2 text-accent-hover size-4"
                          />
                        </button>
                        <button
                          v-if="
                            !(
                              taskEditMode &&
                              currentlyEditingTaskIndex === index
                            )
                          "
                          class="shrink-0"
                          @click="deleteTask(index)"
                        >
                          <XMarkIcon
                            class="text-dim-2 text-accent-hover size-4"
                          />
                        </button>
                      </div>
                    </div>
                  </Draggable>
                </Container>
              </div>
              <input
                v-if="taskAddMode"
                ref="newTaskInput"
                v-model="newTaskName"
                v-focus
                class="bg-elevation-2 text-normal border-accent-focus pointer-events-auto w-[96%] rounded-md p-1 text-base focus:border-2 focus:border-dotted focus:outline-none"
                maxlength="1000"
                :placeholder="$t('modals.editCard.newTaskPlaceholder')"
                type="text"
                @keypress.enter="createTask"
              />
              <div v-if="taskAddMode" class="ml-0.5 mt-0.5 flex flex-row gap-4">
                <button
                  class="bg-accent text-buttons rounded-md px-4 py-1"
                  @click="createTask"
                >
                  {{ $t("general.addAction") }}
                </button>
                <button
                  @click="
                    taskAddMode = false;
                    newTaskName = '';
                  "
                >
                  {{ $t("general.cancelAction") }}
                </button>
              </div>
              <button
                v-if="!taskAddMode"
                class="bg-elevation-1 bg-elevation-2-hover mr-8 mt-1 flex h-min w-[96%] cursor-pointer flex-row items-center gap-2 rounded-md py-1 pl-0.5 pr-2"
                @click="enableTaskAddMode"
              >
                <PlusIcon class="text-accent size-6" />
                <span>{{ $t("modals.editCard.taskAdd") }}</span>
              </button>
              <div class="mt-1 flex flex-row flex-wrap gap-2">
                <button
                  v-if="defaultPhases.length > 0"
                  class="bg-elevation-3 w-fit rounded-md px-2 py-0.5 text-sm"
                  @click="loadDefaultPhases"
                >
                  {{ $t("modals.editCard.phasesLoad") }}
                </button>
                <button
                  class="bg-elevation-3 w-fit rounded-md px-2 py-0.5 text-sm"
                  @click="closeModalAndOpenPhaseEdit"
                >
                  {{ $t("modals.editCard.phasesEdit") }}
                </button>
              </div>
            </div>
          </div>
          <div class="mt-4 flex flex-col pr-6">
            <h2 class="text-lg font-semibold">
              {{ $t("modals.editCard.tagsTitle") }}
            </h2>
            <vue-tags-input
              v-model="tag"
              :tags="tags"
              :autocomplete-items="filteredItems"
              placeholder="Add tag..."
              @tags-changed="updateTags"
              @before-adding-tag="beforeTagAdd"
            />
            <button
              class="bg-elevation-3 mt-2 w-fit rounded-md px-2 py-0.5 text-sm"
              @click="closeModalAndOpenTagEdit"
            >
              {{ $t("modals.editCard.tagsEdit") }}
            </button>
          </div>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import type {
  BoardMember,
  BoardPhase,
  Card,
  CardAssignment,
  Column,
  Task,
  Tag,
} from "@/types/kanban-types";
import {
  ASSIGNMENT_ROLES,
  LEAD_ROLE,
  addAssignment,
  assignmentRoleKey,
  getCardAssignments,
  removeAssignment,
  resolveCardAssignments,
  setAssignmentRole,
} from "@/utils/cardAssignments";
import { buildTasksFromPhases, clampProgress } from "@/utils/cardProgress";
import type { Ref } from "vue";

import emitter from "@/utils/emitter";
import { generateUniqueID } from "@/utils/idGenerator";
import { SwatchIcon } from "@heroicons/vue/24/outline";
import { CheckIcon, PlusIcon, XMarkIcon } from "@heroicons/vue/24/solid";
import {
  PhCalendar,
  PhCheck,
  PhPencilSimple,
  PhTrash,
  PhX,
} from "@phosphor-icons/vue";
import { vOnClickOutside } from "@vueuse/components";
//@ts-expect-error library has no types
import { Container, Draggable } from "vue3-smooth-dnd";
//@ts-expect-error library has no types
import { VueTagsInput } from "@vojtechlanka/vue-tags-input";
import { useSettingsStore } from "@/stores/settings";

const props = defineProps<{
  card: Card | null;
  columnId: string;
  globalTags: Array<Tag>;
  members: Array<BoardMember>;
  columns: Array<Column>;
  defaultPhases: Array<BoardPhase>;
}>();

const emit = defineEmits<{
  (e: "closeModal", columnID: string): void;
  (
    e: "setCardColor",
    columnID: string,
    cardId: string | undefined,
    color: string
  ): void;
  (
    e: "setCardDescription",
    columnID: string,
    cardId: string | undefined,
    description: string
  ): void;
  (
    e: "setCardDueDate",
    columnID: string,
    cardId: string | undefined,
    dueDate: Date | null,
    isCounterRelative: boolean,
    isCompleted: boolean
  ): void;
  (
    e: "setCardTags",
    columnID: string,
    cardId: string | undefined,
    tags: Array<Tag>
  ): void;
  (
    e: "setCardTasks",
    columnID: string,
    cardId: string | undefined,
    tasks: Array<Task>
  ): void;
  (
    e: "setCardTitle",
    columnID: string,
    cardId: string | undefined,
    title: string
  ): void;
  (e: "addGlobalTag", tag: Tag): void;
  (e: "openTagEdit"): void;
  (
    e: "setCardAssignments",
    columnID: string,
    cardId: string | undefined,
    assignments: Array<CardAssignment>
  ): void;
  (
    e: "setCardProgress",
    columnID: string,
    cardId: string | undefined,
    progress: number
  ): void;
  (e: "addMember", name: string, color?: string): void;
  (
    e: "updateMember",
    memberId: string,
    changes: Partial<Omit<BoardMember, "id">>
  ): void;
  (e: "removeMember", memberId: string): void;
  (
    e: "taskFinished",
    columnID: string,
    cardId: string | undefined,
    taskId: string | undefined
  ): void;
  (e: "openPhaseEdit"): void;
}>();

const { locale, t } = useI18n();

const columnID = ref("");
const { textarea: titleTextArea, input: title } = useTextareaAutosize();
const description = ref("");
const tasks: Ref<Array<Task>> = ref([]);
const selectedColor = ref("");

const dueDate: Ref<Date | null> = ref(null);
const isDueDateCounterRelative = ref(false);
const settingsStore = useSettingsStore();
const isDueDateCompleted = ref(false);

const tag = ref("");
const tags: Ref<Array<Tag>> = ref([]);
const autocompleteItems: Ref<Array<Tag>> = ref([]);

const assignments: Ref<Array<CardAssignment>> = ref([]);
const manualProgress = ref(0);
const memberManageMode = ref(false);
const newMemberName = ref("");
const defaultMemberColor = "#64748b";

const isCustomColor = computed(() => selectedColor.value.startsWith("#"));
const customColor = ref("#ffffff");
const showCustomColorPopup = ref(false);

const titleEditing = ref(false);

const newTaskName = ref("");
const taskAddMode = ref(false);
const newTaskInput: Ref<HTMLInputElement | null> = ref(null);

const currentlyEditingTaskIndex = ref(-1);
const currentlyEditingTaskName = ref("");
const taskEditMode = ref(false);

const draggingEnabled = ref(true);

const enableTitleEditing = () => {
  emitter.emit("modalPreventClickOutsideClose");
  titleEditing.value = true;
};

const enableTaskAddMode = () => {
  taskAddMode.value = true;
};

const filteredItems = computed(() => {
  const currentInput = tag.value.trim().toLowerCase();
  return autocompleteItems.value.filter((item) =>
    item.text.toLowerCase().includes(currentInput)
  );
});

const getCheckedTaskNumber = computed(() => {
  return tasks.value.filter((task) => task.finished).length || 0;
});

// Derived from tasks when the card has any, otherwise the manual value
const getTaskPercentage = computed(() => {
  if (!tasks.value || tasks.value.length === 0) return manualProgress.value;

  return (getCheckedTaskNumber.value / tasks.value.length) * 100;
});

const updateProgress = () => {
  manualProgress.value = clampProgress(manualProgress.value);
  emit("setCardProgress", columnID.value, props.card?.id, manualProgress.value);
};

// Assignments joined with the board members, lead first
const cardAssignments = computed(() =>
  resolveCardAssignments({ assignments: assignments.value }, props.members)
);

const unassignedMembers = computed(() =>
  props.members.filter(
    (member) => !assignments.value.some((a) => a.memberId === member.id)
  )
);

// Built-in roles plus the current one, so a custom role stays selectable
const roleOptions = (currentRole: string) =>
  ASSIGNMENT_ROLES.includes(currentRole)
    ? ASSIGNMENT_ROLES
    : [...ASSIGNMENT_ROLES, currentRole];

const roleLabel = (role: string) => {
  const key = assignmentRoleKey(role);

  return key ? t(key) : role;
};

const saveAssignments = (next: Array<CardAssignment>) => {
  assignments.value = next;
  emit("setCardAssignments", columnID.value, props.card?.id, next);
};

const addCardAssignment = (event: Event) => {
  const select = event.target as HTMLSelectElement;
  if (!select.value) return;

  saveAssignments(addAssignment(assignments.value, select.value));
  select.value = "";
};

const updateAssignmentRole = (memberId: string, event: Event) => {
  const role = (event.target as HTMLSelectElement).value;
  saveAssignments(setAssignmentRole(assignments.value, memberId, role));
};

const removeCardAssignment = (memberId: string) => {
  saveAssignments(removeAssignment(assignments.value, memberId));
};

const createMember = () => {
  const memberName = newMemberName.value.trim();
  if (!memberName) return;

  emit("addMember", memberName, defaultMemberColor);
  newMemberName.value = "";
};

const updateMemberField = (
  memberId: string,
  field: "name" | "role" | "color",
  event: Event
) => {
  const value = (event.target as HTMLInputElement).value;
  if (field === "name" && !/\S/.test(value)) return;

  emit("updateMember", memberId, { [field]: value.trim() });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const beforeTagAdd = ({ tag, addTag }: any) => {
  // get all matches from autocomplete items (starts with), if it is only one, select it
  const matches = autocompleteItems.value.filter((item) =>
    item.text.toLowerCase().startsWith(tag.text.toLowerCase())
  );

  // check if autocomplete items have a tag with the same name
  const existingTag = autocompleteItems.value.find(
    (item) => item.text === tag.text
  );

  if (!existingTag) {
    if (matches.length === 1 && matches[0]) {
      tag.text = matches[0].text;
      tag.id = matches[0].id;
      tag.color = matches[0].color;
      tag.style = matches[0].style;
    } else {
      tag.id = generateUniqueID();
    }
  } else {
    tag.text = existingTag.text;
    tag.id = existingTag.id;
    tag.color = existingTag.color;
    tag.style = existingTag.style;
  }

  addTag();

  emit("addGlobalTag", tag);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const updateTags = (newTags: any) => {
  tags.value = newTags;

  emit("setCardTags", columnID.value, props.card?.id, tags.value);
};

const closeModalAndOpenTagEdit = () => {
  emit("closeModal", columnID.value);
  titleEditing.value = false;
  taskAddMode.value = false;
  showCustomColorPopup.value = false;

  nextTick(() => {
    emit("openTagEdit");
  });
};

const createTask = () => {
  if (newTaskName.value == null || !/\S/.test(newTaskName.value)) return;

  tasks.value.push({
    finished: false,
    id: generateUniqueID(),
    name: newTaskName.value,
  });
  newTaskName.value = "";
  taskAddMode.value = false;

  updateCardTasks();
};

const deleteTask = (index: number) => {
  tasks.value.splice(index, 1);
  updateCardTasks();
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const onTaskDrop = (dropResult: any) => {
  tasks.value = applyDrag(tasks.value, dropResult);
  updateCardTasks();
};

const enableTaskEditMode = (
  index: number,
  task: { finished: boolean; name: string }
) => {
  taskEditMode.value = true;
  draggingEnabled.value = false;
  currentlyEditingTaskIndex.value = index;
  currentlyEditingTaskName.value = task.name;
};

const updateTask = (index: number) => {
  const taskNameEmpty =
    currentlyEditingTaskName.value == null ||
    !/\S/.test(currentlyEditingTaskName.value);
  if (taskNameEmpty || currentlyEditingTaskIndex.value === -1) return;

  if (tasks.value[index]) {
    tasks.value[index].name = currentlyEditingTaskName.value;
  }

  currentlyEditingTaskIndex.value = -1;
  currentlyEditingTaskName.value = "";
  taskEditMode.value = false;
  draggingEnabled.value = true;

  updateCardTasks();
};

const updateCardTasks = () => {
  emit("setCardTasks", columnID.value, props.card?.id, tasks.value);
};

// Saves the tasks; a finished task with a target column moves the card there
const onTaskChecked = (task: Task, checked: boolean) => {
  task.finished = checked;
  updateCardTasks();

  if (checked && task.targetColumnId) {
    emit("taskFinished", columnID.value, props.card?.id, task.id);
  }
};

// Empty when the task has no target or its column no longer exists
const taskTargetValue = (task: Task) => {
  if (!task.targetColumnId) return "";

  return props.columns.some((column) => column.id === task.targetColumnId)
    ? task.targetColumnId
    : "";
};

const updateTaskTarget = (task: Task, event: Event) => {
  const value = (event.target as HTMLSelectElement).value;
  task.targetColumnId = value || null;
  updateCardTasks();
};

// Appends the board's default phases that the card does not have yet
const loadDefaultPhases = () => {
  const newTasks = buildTasksFromPhases(
    props.defaultPhases,
    tasks.value,
    generateUniqueID
  );
  if (newTasks.length === 0) return;

  tasks.value.push(...newTasks);
  updateCardTasks();
};

const closeModalAndOpenPhaseEdit = () => {
  emit("closeModal", columnID.value);
  titleEditing.value = false;
  taskAddMode.value = false;
  showCustomColorPopup.value = false;

  nextTick(() => {
    emit("openPhaseEdit");
  });
};

const resetDueDate = () => {
  dueDate.value = null;
  emit(
    "setCardDueDate",
    columnID.value,
    props.card?.id,
    null,
    isDueDateCounterRelative.value,
    false
  );
};

const markDueDateCompleted = () => {
  emit(
    "setCardDueDate",
    columnID.value,
    props.card?.id,
    dueDate.value,
    isDueDateCounterRelative.value,
    isDueDateCompleted.value
  );
};

const updateDueDate = () => {
  emit(
    "setCardDueDate",
    columnID.value,
    props.card?.id,
    dueDate.value,
    isDueDateCounterRelative.value,
    isDueDateCompleted.value
  );
};

const updateDescription = () => {
  emit("setCardDescription", columnID.value, props.card?.id, description.value);
  emitter.emit("modalEnableClickOutsideClose");
};

const updateTitle = () => {
  emitter.emit("modalEnableClickOutsideClose");

  if (title.value == null || !/\S/.test(title.value)) return;

  titleEditing.value = false;
  emit("setCardTitle", columnID.value, props.card?.id, title.value);
};

const setCardColor = (
  columnID: string,
  cardId: string | undefined,
  color: string
) => {
  selectedColor.value = color;
  emit("setCardColor", columnID, props.card?.id, color);
};

const dateToLocalFormat = (date: Date | string) => {
  const jsLocaleIdentifier = locale.value.replace("_", "-")

  if (typeof date === "string") {
    return new Date(date).toLocaleDateString(jsLocaleIdentifier);
  }
  return date.toLocaleDateString(jsLocaleIdentifier);
};

watch(customColor, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    setCardColor(columnID.value, props.card?.id, newVal);
  }
});

watch(props, (newVal) => {
  if (newVal) {
    if (!newVal.card) return;

    newTaskName.value = "";

    columnID.value = newVal.columnId;

    title.value = newVal.card.name;
    description.value = newVal.card.description || "";

    //@ts-expect-error TODO: improve due date handling/types
    dueDate.value = newVal.card.dueDate || null;
    isDueDateCounterRelative.value =
      newVal.card.isDueDateCounterRelative !== undefined
        ? newVal.card.isDueDateCounterRelative
        : settingsStore.defaultRelativeDueDatesEnabled;
    isDueDateCompleted.value = newVal.card.isDueDateCompleted || false;

    assignments.value = getCardAssignments(newVal.card);
    manualProgress.value = clampProgress(newVal.card.progress ?? 0);

    tags.value = newVal.card.tags || [];
    tag.value = "";
    autocompleteItems.value = newVal.globalTags;

    /**
     * Enforce adding IDs to all card tasks
     * TODO: Potentially remove later on in a version with breaking change to make ID non-optional
     */
    const savedTasks = newVal.card.tasks || [];
    if (savedTasks.length > 0) {
      savedTasks.forEach((task) => {
        if (!task.id) {
          console.log("Generating ID for old task, this should not happen again");
          task.id = generateUniqueID();
        }
      });
    }
    tasks.value = savedTasks;

    selectedColor.value = newVal.card.color || "bg-elevation-2";
    if (newVal.card.color?.startsWith("#")) {
      customColor.value = newVal.card.color;
    }
  }
});
</script>

<style>
.v-popper__popper {
  z-index: 9999999999 !important;
}

.vue-tags-input {
  background-color: var(--elevation-1) !important;
  max-width: none !important;
}

.vue-tags-input .ti-new-tag-input {
  background: transparent;
  color: var(--text-dim-1);
}

.vue-tags-input .ti-input {
  padding: 8px 4px !important;
  background: var(--elevation-1);

  border: 1px solid var(--elevation-3) !important;
  border-radius: 8px;
}

.vue-tags-input ::-webkit-input-placeholder {
  color: var(--text-dim-3);
}

.vue-tags-input ::-moz-placeholder {
  color: var(--text-dim-3);
}

.vue-tags-input :-ms-input-placeholder {
  color: var(--text-dim-3);
}

.vue-tags-input :-moz-placeholder {
  color: var(--text-dim-3);
}

.vue-tags-input .ti-autocomplete {
  background: var(--elevation-2);
  border: 1px solid var(--elevation-3);
  border-top: none;
  border-radius: 0 0 8px 8px;

  z-index: 9999999999 !important;
  overflow: visible;

  position: unset !important;
}

.vue-tags-input .ti-tag {
  position: relative;
  background: var(--elevation-3);
}

.vc-light {
  /* Base */
  --vc-color: var(--text);
  --vc-bg: var(--bg-primary);
  --vc-border: var(--elevation-1);
  --vc-hover-bg: hsla(211, 25%, 84%, 0.3);
  --vc-focus-ring: 0 0 0 2px rgb(59, 131, 246, 0.4);
  /* Calendar header */
  --vc-header-arrow-color: var(--text-dim-2);
  --vc-header-arrow-hover-bg: var(--elevation-2);
  --vc-header-title-color: var(--accent);
  /* Calendar weekdays */
  --vc-weekday-color: var(--text-dim-3);
  /* Calendar weeknumbers */
  --vc-weeknumber-color: var(--vc-gray-400);
  /* Calendar nav */
  --vc-nav-hover-bg: var(--vc-gray-200);
  --vc-nav-title-color: var(--vc-gray-900);
  --vc-nav-item-hover-box-shadow: none;
  --vc-nav-item-active-color: var(--vc-white);
  --vc-nav-item-active-bg: var(--vc-accent-500);
  --vc-nav-item-active-box-shadow: var(--vc-shadow);
  --vc-nav-item-current-color: var(--vc-accent-600);
  /* Calendar day popover */
  --vc-day-popover-container-color: var(--vc-white);
  --vc-day-popover-container-bg: var(--vc-gray-800);
  --vc-day-popover-container-border: var(--vc-gray-700);
  --vc-day-popover-header-color: var(--vc-gray-700);
  /* Popover content */
  --vc-popover-content-color: var(--vc-gray-900);
  --vc-popover-content-bg: var(--vc-gray-50);
  --vc-popover-content-border: var(--elevation-2);
  /* Time picker */
  --vc-time-picker-border: var(--elevation-1);
  --vc-time-weekday-color: var(--text-dim-3);
  --vc-time-month-color: var(--accent);
  --vc-time-day-color: var(--accent);
  --vc-time-year-color: var(--text-dim-3);
  /* Time select group */
  --vc-time-select-group-bg: var(--elevation-1);
  --vc-time-select-group-border: var(--elevation-2);
  --vc-time-select-group-icon-color: var(--accent);
  /* Base select */
  --vc-select-color: var(--text);
  --vc-select-bg: var(--elevation-1);
  --vc-select-hover-bg: var(--elevation-2);
  /* Calendar day */
  --vc-day-content-hover-bg: var(--elevation-2);
  --vc-day-content-disabled-color: var(--vc-gray-400);
  /* Calendar attributes */
  &.vc-attr,
  & .vc-attr {
    --vc-content-color: var(--vc-accent-600);
    --vc-highlight-outline-bg: var(--vc-white);
    --vc-highlight-outline-border: var(--accent);
    --vc-highlight-outline-content-color: var(--vc-accent-700);
    --vc-highlight-light-bg: var(--vc-accent-200);
    --vc-highlight-light-content-color: var(--vc-accent-900);
    --vc-highlight-solid-bg: var(--accent);
    --vc-highlight-solid-content-color: var(--vc-white);
    --vc-dot-bg: var(--accent);
    --vc-bar-bg: var(--accent);
  }
}

.vc-day.is-today .vc-day-content {
  border: 1.5px solid var(--accent);
  border-radius: 100%;
}
</style>

<style scoped>
textarea {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

textarea::-webkit-scrollbar {
  display: none;
}

input[type="color"] {
  -webkit-appearance: none;
  appearance: none;
  border-radius: 8px;
  cursor: pointer;
}
input[type="color"]::-webkit-color-swatch-wrapper {
  padding: 0;
  border-radius: 8px;
}
input[type="color"]::-webkit-color-swatch {
  border-radius: 8px;
  border-width: 2px;
  border-style: solid;
  border-color: var(--text);
}
</style>
