<script lang="ts">
  import Dexie from 'dexie'
  import { db, dbs, dbsp, observableQuery } from '@/db'
  import type {
    IHashtagAndIngredientNames,
    IRecipesSearchItem,
  } from '@/types/IRecipesSearchItem'
  import type { INameWithId } from '@/types/IIngredientInRecipeItem'
  import getRecipesSearchItems from '@/helpers/getRecipesSearchItems'
</script>
<script lang="ts" setup>
  const inTrash = ref(false)
  const hashtags = ref([] as INameWithId[])
  const cleaning = ref(false)

  watch(
    () => hashtags.value,
    async () => {
      const hashtagNames = hashtags.value.map((item) => item.name)

      const hashtagsWithIds = await db.hashtags
        .where('name')
        .anyOf(hashtagNames)
        .toArray()

      const ids = hashtagsWithIds.map((item) => item.id)
      await dbsp.searchParams.update(1, { hashtagIds: ids })
    },
    { immediate: true },
  )

  const onCleared = async () => {
    await nextTick()

    cleaning.value = false
  }

  const updateDbSearchInTrash = async () => {
    await dbsp.searchParams.update(1, { searchInTrash: !!inTrash.value })
  }

  watch(
    () => inTrash.value,
    async () => {
      await updateDbSearchInTrash()
    },
    { immediate: true },
  )

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
  <div class="van-padding-x mt-20 mb-20">
    <van-checkbox v-model="inTrash" shape="square" label-position="left">
      <span class="text-primary font-bold">Поиск в корзине</span>
    </van-checkbox>
  </div>
  <HashtagListEditor
    v-model="hashtags"
    title="Поиск по хештегам"
    placeholder="— введите хештеги"
    :editing="true"
    :error="false"
    :availableOnly="true"
    :cleaning="cleaning"
    class="mb-20"
    @cleared="onCleared"
  />

  <RecipesSearchItem
    v-for="(recipesSearchItem, index) in recipesSearchItems"
    :key="recipesSearchItem.id"
    :recipesSearchItem="recipesSearchItem"
    :index="index"
    @openRecipe="onOpenRecipe"
  />
</template>
