<script lang="ts">
  import { db, dbs } from '@/db'
  import type { IRecipesSearchItem } from '@/types/IRecipesSearchItem'
</script>
<script lang="ts" setup>
  const emit = defineEmits(['openRecipe'])

  const props = defineProps<{
    recipesSearchItem: IRecipesSearchItem
  }>()

  const inTrash = computed(() => !!props.recipesSearchItem.deletionDate)

  const deleteRecipe = async () => {
    const settings = await dbs.settings.get({ id: 1 })

    if (settings.openedRecipeId === props.recipesSearchItem.id) {
      await dbs.settings.update(1, { openedRecipeId: null })
    }

    const result = await db.recipes.update(props.recipesSearchItem.id, {
      deletionDate: new Date().getTime(),
    })
  }

  const restoreRecipe = async () => {
    const result = await db.recipes.update(props.recipesSearchItem.id, {
      deletionDate: null,
    })
  }
</script>
<template>
  <div class="w-full flex flex-col mb-30">
    <div>{{ `№ ${recipesSearchItem.id} ${recipesSearchItem.name}` }}</div>
    <div>{{ recipesSearchItem.note }}</div>
    <div>
      <span
        v-for="hashtagName in recipesSearchItem.hashtagNames"
        :key="hashtagName"
        class="text-gray-8"
      >
        #{{ hashtagName }}&nbsp;
      </span>
    </div>
    <div>
      <span
        v-for="ingredientName in recipesSearchItem.ingredientNames"
        :key="ingredientName"
        class="text-gray-8"
      >
        {{ ingredientName }},&nbsp;
      </span>
    </div>
    <div v-if="!inTrash">
      <Icon
        name="open"
        :clickable="true"
        class="text-24"
        @click="emit('openRecipe', recipesSearchItem.id)"
      />
    </div>
    <div>
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
        name="restore"
        class="text-24"
        @click="restoreRecipe"
      />
    </div>
  </div>
</template>
