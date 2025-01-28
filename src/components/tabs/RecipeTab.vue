<script lang="ts">
  import Dexie from 'dexie'
  import { db, dbs, observableQuery } from '@/db'
  import type { IRecipe } from '@/db'
  import type {
    IIngredientInRecipeItem,
    INameWithId,
  } from '@/types/IIngredientInRecipeItem'
  import saveRecipe from '@/helpers/saveRecipe'

  let oldHashtagNamesSet = new Set<string>()
  let oldIngredientIdSet = new Set<number>()
</script>
<script lang="ts" setup>
  const loading = ref(false)
  const submitted = ref(false)
  const editing = ref(false)
  const cleaning = ref(false)

  const onCleared = async () => {
    await nextTick()

    cleaning.value = false
  }

  const hashtags = ref([] as INameWithId[])
  const hashtagError = computed(() => !hashtags.value.length)

  const recipeName = ref('')
  const recipeNameError = computed(() => !recipeName.value)
  const ingredientList = ref([] as IIngredientInRecipeItem[])
  const oldIngredientList = ref([] as IIngredientInRecipeItem[])

  const content = ref('')
  const note = ref('')
  const contentError = computed(() => !content.value)

  const recipeId = ref(null as null | number)

  const recipe = observableQuery(async () => {
    const recipeId = (await dbs.settings.get({ id: 1 }))?.openedRecipeId

    if (!recipeId) {
      return null
    }

    return await db.recipes.get({ id: recipeId })
  })

  const getRecipeData = async () => {
    if (!recipe.value) {
      return
    }

    recipeId.value = recipe.value.id as number
    recipeName.value = recipe.value.name as string
    content.value = recipe.value.content as string
    note.value = recipe.value.note as string

    const result = await Dexie.Promise.all([
      db.recipe_hashtag.where({ recipeId: recipeId.value }).toArray(),
      db.recipe_ingredient.where({ recipeId: recipeId.value }).toArray(),
    ])

    const hashtagIds = result[0]?.map((item) => item.hashtagId)
    hashtags.value = (await db.hashtags.bulkGet(hashtagIds)) ?? []

    const tasks = [] as Promise<INameWithId>[]
    const result1Length = result[1]?.length ?? 0

    for (let index = 0; index < result1Length; index++) {
      const item = result[1][index]
      tasks.push(db.ingredients.get({ id: item.ingredientId }))
      tasks.push(db.ingredientUnits.get({ id: item.unitId }))
    }

    const ingredientsAndUnits = await Dexie.Promise.all(tasks)
    const unsortedIngredientList = []

    for (let index = 0; index < result1Length; index++) {
      unsortedIngredientList.push({
        ingredient: ingredientsAndUnits[index * 2],
        quantity: result[1][index].quantity,
        unit: ingredientsAndUnits[index * 2 + 1],
      })
    }

    ingredientList.value = unsortedIngredientList.sort((a, b) =>
      a.ingredient.name.localeCompare(b.ingredient.name),
    )

    oldHashtagNamesSet = new Set(hashtags.value.map((item) => item.name))

    oldIngredientIdSet = new Set(
      ingredientList.value.map((item) => item.ingredient.id),
    )
  }

  watch(
    () => recipe.value,
    async () => {
      if (recipe.value) {
        editing.value = false
      }
      await getRecipeData()
    },
  )

  const onSaveRecipeClick = async () => {
    submitted.value = true

    if (
      hashtagError.value ||
      recipeNameError.value ||
      contentError.value ||
      !ingredientList.value.length
    ) {
      return
    }

    submitted.value = false

    try {
      const updateObject = await saveRecipe({
        recipeId: recipeId.value,
        recipeName: recipeName.value,
        content: content.value,
        note: note.value,
        hashtags: hashtags.value,
        ingredientList: ingredientList.value,
        oldHashtagNamesSet,
        oldIngredientIdSet,
      })

      oldHashtagNamesSet = updateObject.oldHashtagNamesSet
      oldIngredientIdSet = updateObject.oldIngredientIdSet
      recipeId.value = updateObject.recipeId

      await dbs.settings.update(1, { openedRecipeId: recipeId.value })

      editing.value = false
    } catch (err) {
      console.error(err)
    }
  }

  const setNewRecipe = async () => {
    await dbs.settings.update(1, { openedRecipeId: null })
    recipeId.value = null
    oldHashtagNamesSet = new Set()
    oldIngredientIdSet = new Set()
  }

  const clearRecipe = async () => {
    await setNewRecipe()

    recipeName.value = ''
    hashtags.value = []
    ingredientList.value = []
    content.value = ''
    note.value = ''
    oldHashtagNamesSet = new Set()
    oldIngredientIdSet = new Set()
    cleaning.value = true
  }
</script>
<template>
  <div class="relative">
    <h1 class="w-full text-center font-bold text-18 text-primary mt-10 mb-14">
      Рецепт {{ !!recipe ? '№ ' + recipeId : '(новый)' }}
    </h1>
    <div
      v-if="!editing && !!recipe"
      class="absolute right-0 top-0 bottom-0 van-padding-right flex items-center gap-10 text-primary cursor-pointer"
    >
      <SimpleButton
        iconName="edit"
        iconSize="16"
        label="Редактировать"
        @click="editing = true"
      />
    </div>
  </div>
  <div class="w-full flex flex-col gap-20">
    <div>
      <h2 v-if="!editing && !!recipe" class="van-padding-x text-16 font-bold">
        {{ recipeName }}
      </h2>
      <van-field
        v-else
        v-model="recipeName"
        placeholder="Название"
        :error="recipeNameError && submitted"
      />
    </div>
    <HashtagListEditor
      v-model="hashtags"
      :editing="editing || !recipe"
      :error="hashtagError && submitted"
      :cleaning="cleaning"
      @cleared="onCleared"
    />
    <IngredientListEditor
      v-model="ingredientList"
      :editing="editing || !recipe"
      :recipeId="recipeId"
      :showError="submitted"
      :cleaning="cleaning"
      @cleared="onCleared"
      @ingredientListInit="oldIngredientList = $event"
    />
    <div>
      <h2 class="van-padding-x text-primary font-bold mt-4 mb-10">
        Как готовить
      </h2>
      <p v-if="!editing && !!recipe" class="van-padding-x">{{ content }}</p>
      <van-field
        v-else
        v-model="content"
        type="textarea"
        autosize
        placeholder="Текст рецепта"
        class="pt-0"
        :error="contentError && submitted"
      />
    </div>
    <div>
      <h2 class="van-padding-x text-primary font-bold mt-4 mb-10">
        Примечания
      </h2>
      <p v-if="!editing && !!recipe" class="van-padding-x">{{ note }}</p>
      <van-field
        v-else
        v-model="note"
        type="textarea"
        autosize
        placeholder="Примечания"
        class="pt-0"
      />
    </div>
    <div
      v-if="editing || !recipe"
      class="w-full flex justify-between van-padding-x"
    >
      <SimpleButton
        iconName="db-save"
        :label="!!recipe ? 'Сохранить изменения' : 'Сохранить рецепт'"
        :disabled="false"
        @click="onSaveRecipeClick"
      />
      <SimpleButton
        v-if="recipe"
        iconName="clone"
        label="Копировать в новый рецепт"
        @click="setNewRecipe"
      />
      <SimpleButton iconName="clear" label="Очистить" @click="clearRecipe" />
    </div>
    <div v-else class="w-full flex justify-end van-padding-x">
      <SimpleButton iconName="new" label="Новый рецепт" @click="clearRecipe" />
    </div>
  </div>
</template>
