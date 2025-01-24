<script lang="ts">
  import Dexie from 'dexie'
  import { db } from '@/db'
  import type { IRecipe } from '@/db'
  import type { IIngredientInRecipeItem } from '@/types/IIngredientInRecipeItem'
  import saveRecipe from '@/helpers/saveRecipe'

  let oldHashtagNamesSet = new Set<string>()
  let oldIngredientIdSet = new Set<number>()
</script>
<script lang="ts" setup>
  const props = defineProps<{ recipe?: IRecipe }>()

  // TODO: сделать инициализацию oldHashtagNamesSet

  const loading = ref(false)
  const isNew = computed(() => !props.recipe?.id)
  const submitted = ref(false)

  const hashtagNames = ref([] as string[])
  const hashtagError = computed(() => !hashtagNames.value.length)

  const recipeName = ref('')
  const recipeNameError = computed(() => !recipeName.value)
  const ingredientList = ref([] as IIngredientInRecipeItem[])
  const oldIngredientList = ref([] as IIngredientInRecipeItem[])

  const content = ref('')
  const contentError = computed(() => !content.value)

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
      const updatedOldSets = saveRecipe({
        recipeId: props.recipe?.id,
        recipeName: recipeName.value,
        content: content.value,
        hashtagNames: hashtagNames.value,
        ingredientList: ingredientList.value,
        oldHashtagNamesSet,
        oldIngredientIdSet,
      })

      oldHashtagNamesSet = updatedOldSets.oldHashtagNamesSet
      oldIngredientIdSet = updatedOldSets.oldIngredientIdSet
    } catch (err) {
      console.error(err)
    }
  }

  onMounted(async () => {
    if (!isNew.value) {
      const recipe = props.recipe as IRecipe
      recipeName.value = recipe.name as string
      content.value = recipe.content as string

      const result = await Dexie.Promise.all([
        db.recipe_hashtag.where({ recipeId: recipe.id }).toArray(),
        db.recipe_ingredient.where({ recipeId: recipe.id }).toArray(),
      ])

      hashtagNames.value =
        result[0]?.map((item) => item.hashtagName).sort() ?? []

      ingredientList.value =
        result[1]?.map((item) => item.hashtagName).sort() ?? []

      // TODO:
      // Здесь нужно вставить запрос на названия ингредиентов и единиц изм.
      // по их ID, и сформировать полноценный ingredientList.
      oldHashtagNamesSet = new Set(hashtagNames.value)
      oldIngredientIdSet = new Set(
        ingredientList.value.map((item) => item.ingredient.id),
      )
    }
  })
</script>
<template>
  <div>
    <van-field
      v-model="recipeName"
      placeholder="Название"
      :error="recipeNameError && submitted"
    />
    <HashtagListEditor
      v-model="hashtagNames"
      :error="hashtagError && submitted"
    />
    <IngredientListEditor
      v-model="ingredientList"
      :recipeId="props.recipe?.id"
      :showError="submitted"
      @ingredientListInit="oldIngredientList = $event"
    />
    <h2 class="van-padding text-primary font-bold mt-4">Как готовить</h2>
    <van-field
      v-model="content"
      type="textarea"
      autosize
      placeholder="Текст рецепта"
      class="pt-0"
      :error="contentError && submitted"
    />
    <van-button
      plain
      size="small"
      type="primary"
      class="w-280 mt-28"
      @click="onSaveRecipeClick"
    >
      {{ isNew ? 'Сохранить рецепт' : 'Сохранить изменения' }}
    </van-button>
  </div>
</template>
