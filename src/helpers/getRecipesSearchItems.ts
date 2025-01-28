import Dexie from 'dexie'
import type { Table, Collection, IndexableType } from 'dexie'
import { db, dbsp } from '@/db'
import type { IRecipe } from '@/db'
import localeCompareNames from '@/helpers/localeCompareNames'

import type {
  IRecipesSearchItem,
} from '@/types/IRecipesSearchItem'
import type { INameWithId } from '@/types/IIngredientInRecipeItem'

export default async () => {
  const searchParams = await dbsp.searchParams.get({ id: 1 })
  const hashtagIds = searchParams?.hashtagIds ?? []

  let stepRecipeIds = [] as number[]

  for (const hashtagId of hashtagIds) {
    const recipeHashtags = await db.recipe_hashtag
      .where('hashtagId')
      .equals(hashtagId)
      // Ищем среди уже отобранных на прошлом шаге
      .and((item) => !stepRecipeIds.length || stepRecipeIds.includes(item.recipeId))
      .toArray()

    if (!recipeHashtags?.length) {
      return []
    }

    stepRecipeIds = recipeHashtags.map((item) => item.recipeId)
  }

  type tableType = Table<IRecipe, IndexableType, IRecipe>
  type collectionType = Collection<IRecipe, IndexableType, IRecipe>

  let collection = db.recipes as tableType | collectionType

  if (stepRecipeIds.length) {
    collection = (collection as tableType)
      .where('id')
      .anyOf(stepRecipeIds)
  }

  const recipes = (
    await collection
      .filter((item) => !!item.deletionDate === !!searchParams?.searchInTrash)
      .toArray()
  ) ?? []

  const recipesSearchItems = [] as IRecipesSearchItem[]

  for (const recipe of recipes) {
    const response = await Dexie.Promise.all([
      db.recipe_hashtag.where('recipeId').equals(recipe.id as number).toArray(),
      db.recipe_ingredient.where('recipeId').equals(recipe.id as number).toArray(),
    ])

    const recipeHashtags = response[0] ?? []
    const recipeIngredients = response[1] ?? []

    const hashtagIds = recipeHashtags.map((item) => {
      return item.hashtagId
    })

    const hashtags = await db.hashtags
      .where('id')
      .anyOf(hashtagIds)
      .toArray()

    const hashtagNames = hashtags.map((item) => {
      return item.name
    })

    const ingredientNames = [] as string[]

    for (const recipeIngredient of recipeIngredients) {
      const ingredientItem = (await db.ingredients.get({
        id: recipeIngredient.ingredientId,
      })) as INameWithId

      ingredientNames.push(ingredientItem?.name)
    }

    recipesSearchItems.push({
      ...recipe,
      hashtagNames,
      ingredientNames,
    })
  }

  recipesSearchItems.sort(localeCompareNames)

  return recipesSearchItems
}
