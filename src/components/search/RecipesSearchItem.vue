<script lang="ts">
  import { showConfirmDialog } from 'vant'
  import { db, dbs } from '@/db'
  import type { IRecipesSearchItem } from '@/types/IRecipesSearchItem'
  import deleteRecipeFromTrash from '@/helpers/deleteRecipeFromTrash'
</script>
<script lang="ts" setup>
  const emit = defineEmits(['openRecipe'])

  const props = defineProps<{
    recipesSearchItem: IRecipesSearchItem
    index: number
  }>()

  const odd = computed(() => !(props.index % 2))
  const inTrash = computed(() => !!props.recipesSearchItem.deletionDate)

  const hashtagNames = computed(() => {
    const hashtagNames = [...props.recipesSearchItem.hashtagNames]
    hashtagNames.sort((a, b) => a.localeCompare(b))

    return hashtagNames
  })

  const deleteRecipe = async () => {
    const settings = await dbs.settings.get({ id: 1 })

    if (settings?.openedRecipeId === props.recipesSearchItem.id) {
      await dbs.settings.update(1, { openedRecipeId: null })
    }

    const result = await db.recipes.update(props.recipesSearchItem.id, {
      deletionDate: new Date().getTime(),
    })
  }

  const onDeleteFromTrashClick = async () => {
    try {
      await showConfirmDialog({
        title: 'Подтверждение удаления рецепта',
        message: 'Эту операцию нельзя будет отменить.',
        cancelButtonText: 'Отмена',
        confirmButtonText: 'Удалить',
      })

      await deleteRecipeFromTrash(props.recipesSearchItem.id as number)
    } catch (_) {}
  }

  const restoreRecipe = async () => {
    await db.recipes.update(props.recipesSearchItem.id, {
      deletionDate: null,
    })
  }
</script>
<template>
  <div class="van-padding-x py-15 relative">
    <div class="absolute inset-0" :class="{ 'odd-bg': odd }"></div>
    <div class="pr-24 relative">
      <div class="w-full flex flex-col">
        <div class="w-full h-24 flex justify-between">
          <div class="flex gap-10 font-bold">
            <div class="text-primary">{{ '№ ' + recipesSearchItem.id }}</div>
            <div>{{ recipesSearchItem.name }}</div>
          </div>
        </div>
        <div>
          <span
            v-for="hashtagName in hashtagNames"
            :key="hashtagName"
            class="text-gray-7"
          >
            #{{ hashtagName }}&nbsp;
          </span>
        </div>
        <div>
          <span
            v-for="ingredientName in recipesSearchItem.ingredientNames"
            :key="ingredientName"
            class="text-gray-7"
          >
            {{ ingredientName }},&nbsp;
          </span>
        </div>
        <div class="italic mt-6">{{ recipesSearchItem.note }}</div>
      </div>

      <div
        class="absolute top-0 bottom-0 right-0 w-24 flex flex-col justify-between items-end text-right text-24 text-primary"
      >
        <div class="h-24">
          <Icon
            v-if="!inTrash"
            name="open"
            :clickable="true"
            @click="emit('openRecipe', recipesSearchItem.id)"
          />
          <Icon
            v-else
            :clickable="true"
            name="restore"
            @click="restoreRecipe"
          />
        </div>
        <div class="h-24">
          <Icon
            v-if="!inTrash"
            :clickable="true"
            name="delete"
            class="text-24"
            @click="deleteRecipe"
          />
          <Icon
            v-else
            :clickable="true"
            name="close"
            class="text-24"
            @click="onDeleteFromTrashClick"
          />
        </div>
      </div>
    </div>
  </div>
</template>
