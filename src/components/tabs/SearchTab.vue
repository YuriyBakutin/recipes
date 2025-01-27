<script lang="ts">
  import Dexie from 'dexie'
  import { dbs, observableQuery } from '@/db'
  import type {
    IHashtagAndIngredientNames,
    IRecipesSearchItem,
  } from '@/types/IRecipesSearchItem'
  import type { INameWithId } from '@/types/IIngredientInRecipeItem'
  import getRecipesSearchItems from '@/helpers/getRecipesSearchItems'
</script>
<script lang="ts" setup>
  const inTrash = ref(false)

  const updateDbSearchInTrash = async () => {
    await dbs.settings.update(1, { searchInTrash: !!inTrash.value })
  }

  watch(() => inTrash.value, updateDbSearchInTrash)

  const recipesSearchItems = observableQuery(getRecipesSearchItems)

  const onOpenRecipe = async (recipeId) => {
    await dbs.settings.update(1, { openedRecipeId: recipeId })
  }

  onMounted(updateDbSearchInTrash)
</script>
<template>
  <h1 class="w-full text-center font-bold text-18 text-primary mt-10 mb-14">
    Поиск
  </h1>
  <div class="van-padding">
    <van-checkbox v-model="inTrash" shape="square">
      Поиск в корзине
    </van-checkbox>
  </div>
  <RecipesSearchItem
    v-for="(recipesSearchItem, index) in recipesSearchItems"
    :key="recipesSearchItem.id"
    :recipesSearchItem="recipesSearchItem"
    :index="index"
    @openRecipe="onOpenRecipe"
  />
</template>
