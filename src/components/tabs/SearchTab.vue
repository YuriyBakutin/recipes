<script lang="ts">
  import { db, dbs, dbsp, observableQuery } from '@/db'
  import type { IRecipesSearchItem } from '@/types/IRecipesSearchItem'
  import type { INameWithId } from '@/types/IIngredientInRecipeItem'
  import getRecipesSearchItems from '@/helpers/getRecipesSearchItems'
</script>
<script lang="ts" setup>
  const inTrash = ref(false)
  const hashtags = ref([] as INameWithId[])
  const cleaning = ref(false)

  const searchParams = observableQuery(async () => {
    return await dbsp.searchParams.get({ id: 1 })
  })

  const pageNumber = computed(() => searchParams.value?.pageNumber ?? 1)

  const nextPage = async () => {
    if (endOfPages.value) {
      return
    }

    await dbsp.searchParams.update(1, {
      pageNumber: pageNumber.value + 1,
    })
  }

  const previousPage = async () => {
    if (pageNumber.value === 1) {
      return
    }

    await dbsp.searchParams.update(1, {
      pageNumber: Math.max(pageNumber.value - 1, 1),
    })
  }

  watch(
    () => hashtags.value,
    async () => {
      const hashtagNames = hashtags.value.map((item) => item.name)

      const hashtagsWithIds =
        (await db.hashtags.where('name').anyOf(hashtagNames).toArray()) ?? []

      const ids = hashtagsWithIds.map((item) => item.id) as number[]

      await dbsp.searchParams.update(1, {
        hashtagIds: ids,
        pageNumber: 1,
      })
    },
    { immediate: true },
  )

  const onCleared = async () => {
    await nextTick()

    cleaning.value = false
  }

  const updateDbSearchInTrash = async () => {
    await dbsp.searchParams.update(1, {
      searchInTrash: !!inTrash.value,
      pageNumber: 1,
    })
  }

  watch(
    () => inTrash.value,
    async () => {
      await updateDbSearchInTrash()
    },
    { immediate: true },
  )

  const searchObj = observableQuery(getRecipesSearchItems)

  type searchObjType =
    | {
        endOfPages: boolean
        recipesSearchItems: IRecipesSearchItem[]
      }
    | undefined

  const recipesSearchItems = ref([] as IRecipesSearchItem[])
  const endOfPages = ref(false)

  watchEffect(async () => {
    const searchObjTypeOk = searchObj.value as searchObjType

    recipesSearchItems.value = searchObjTypeOk?.recipesSearchItems ?? []

    endOfPages.value = !!(
      (searchObj.value ?? []) as {
        endOfPages: boolean
        recipesSearchItems: IRecipesSearchItem[]
      }
    ).endOfPages
  })

  const onOpenRecipe = async (recipeId: number) => {
    await dbs.settings.update(1, { openedRecipeId: recipeId })
  }

  onMounted(async () => {
    await updateDbSearchInTrash()
  })
</script>
<template>
  <h1 class="w-full text-center font-bold text-18 text-primary mt-10 mb-14">
    Поиск
  </h1>
  <div class="van-padding-x mt-20 mb-20">
    <SimpleCheckbox
      v-model="inTrash"
      label="Поиск в корзине"
      :labelFirst="true"
    />
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
  <div class="search-list overflow-y-scroll">
    <RecipesSearchItem
      v-for="(recipesSearchItem, index) in recipesSearchItems"
      :key="recipesSearchItem.id"
      :recipesSearchItem="recipesSearchItem"
      :index="index"
      @openRecipe="onOpenRecipe"
    />
  </div>
  <div class="van-padding flex justify-between mt-20">
    <SimpleButton
      iconName="left"
      label="Назад"
      :disabled="pageNumber === 1"
      @click="previousPage"
    />
    <SimpleButton
      iconName="right"
      label="Вперёд"
      :labelFirst="true"
      :disabled="endOfPages"
      @click="nextPage"
    />
  </div>
</template>
<style>
  .search-list {
    height: calc(100vh - 352px);
  }
</style>
