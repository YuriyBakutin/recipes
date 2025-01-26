import Dexie from 'dexie'
import { db } from '@/db'
import type { IRecipe, IRecipe_Ingredient } from '@/db'
import type { IIngredientInRecipeItem } from '@/types/IIngredientInRecipeItem'
import differenceBetweenSets from '@/helpers/differenceBetweenSets'

export default async (
  params: {
    recipeId?: number,
    recipeName: string,
    content: string,
    note: string,
    hashtagNames: string[],
    oldHashtagNamesSet: Set<string>,
    oldIngredientIdSet: Set<number>,
    ingredientList: IIngredientInRecipeItem[],
  }
) => {
  const {
    recipeId,
    recipeName,
    content,
    note,
    hashtagNames,
    oldHashtagNamesSet,
    oldIngredientIdSet,
    ingredientList,
  } = params

  const recipe = {
    name: recipeName,
    content,
    note,
  } as IRecipe

  if (recipeId) {
    recipe.id = recipeId
  }

  const hashtagNamesSet = new Set(hashtagNames)

  const newIngredientIdSet = new Set(
    ingredientList
      .map((item) => item.ingredient.id)
      .filter((item) => item) as number[],
  )

  await db.transaction(
    'rw',
    [
      'recipes',
      'hashtags',
      'recipe_hashtag',
      'ingredients',
      'ingredientUnits',
      'recipe_ingredient',
    ],
    async () => {
      // --- Название, Текст ---
      recipe.id = (await db.recipes.put(recipe))

      // --- Хештеги ---
      // Хештеги во время работы не удаляются. Возможно, нужна
      // отдельная операция по инициализации таблицы хештегов теми хештегами,
      // которые используются в других таблицах (запускать её при старте).

      // Скинуть в базу все хештеги. Старые просто перепишутся такими же.
      await db.hashtags.bulkPut(hashtagNames.map((name) => ({ name })))

      //  Удалить из таблицы связи все, которые исчезли из списка хештегов
      if (recipeId) {
        const hashtagNamesToDelete = [...differenceBetweenSets(
          oldHashtagNamesSet,
          hashtagNamesSet
        )]

        const RecipeHashtagKeysToDelete = hashtagNamesToDelete.map((name) => [
          recipe.id,
          name,
        ])

        await db.recipe_hashtag.bulkDelete(RecipeHashtagKeysToDelete)
      }

      //  Добавить в таблицу связи все новые хештеги

      const recipeHashtagToSave = hashtagNames.map((name) => ({
        hashtagName: name,
        recipeId: recipe.id as number,
      }))

      if (recipeHashtagToSave.length) {
        await db.recipe_hashtag.bulkPut(recipeHashtagToSave)
      }

      // --- Ингредиенты ---
      // Удалить из таблицы связи все ингридиенты,
      // которые исчезли из ingredientList
      if (recipeId) {
        const IdsToDelete = [...differenceBetweenSets(
          oldIngredientIdSet,
          newIngredientIdSet
        )]

        if (IdsToDelete.length) {
          const recipeIngredientKeysToDelete = IdsToDelete.map(
            (ingredientId) => [recipe.id, ingredientId]
          )

          await db.recipe_ingredient.bulkDelete(recipeIngredientKeysToDelete)
        }
      }

      // Заполняем пустые ID для новых ингредиентов и их единиц измерения
      const ingredientsWithoutIdList = [...ingredientList]
        .map((item) => ({
          id: item.ingredient.id,
          name: item.ingredient.name,
        }))
        .filter((item) => !item.id)

      const unitsWithoutIdList = [...ingredientList]
        .map((item) => ({ id: item.unit.id, name: item.unit.name }))
        .filter((item) => !item.id)

      const tasks = []

      let ingredientTaskIndex = 0
      let unitTaskIndex = 0
      let taskIndex = 0

      if (ingredientsWithoutIdList.length) {
        ingredientTaskIndex = taskIndex++

        tasks.push(
          db.ingredients.bulkPut(ingredientsWithoutIdList, { allKeys: true }),
        )
      }

      if (unitsWithoutIdList.length) {
        unitTaskIndex = taskIndex

        tasks.push(
          db.ingredientUnits.bulkPut(unitsWithoutIdList, { allKeys: true }),
        )
      }

      const result = await Dexie.Promise.all(tasks)

      if (ingredientsWithoutIdList.length) {
        ingredientsWithoutIdList.forEach(
          (item, index) => (item.id = result[ingredientTaskIndex][index]),
        )
      }

      if (unitsWithoutIdList.length) {
        unitsWithoutIdList.forEach(
          (item, index) => (item.id = result[unitTaskIndex][index]),
        )
      }

      //  Добавляем в таблицу связи новые ингредиенты.
      const recipeIngredientPayload = ingredientList.reduce(
        (result, item) => {
          const resultItem = {
            recipeId: recipe.id,
            quantity: item.quantity,
            ingredientId: item.ingredient.id,
            unitId: item.unit.id,
          }

          if (!resultItem.ingredientId) {
            resultItem.ingredientId = (ingredientsWithoutIdList ?? []).find(
              (ingredient) => ingredient.name === item.ingredient.name,
            )?.id
          }

          if (!resultItem.unitId) {
            resultItem.unitId = (unitsWithoutIdList ?? []).find(
              (unit) => unit.name === item.unit.name,
            )?.id
          }

          result.push(resultItem as IRecipe_Ingredient)

          return result
        },
        [] as IRecipe_Ingredient[],
      )

      await db.recipe_ingredient.bulkPut(recipeIngredientPayload)
    },
  )

  return {
    oldHashtagNamesSet: hashtagNamesSet,
    oldIngredientIdSet: newIngredientIdSet,
    recipeId: recipe.id,
  }
}
