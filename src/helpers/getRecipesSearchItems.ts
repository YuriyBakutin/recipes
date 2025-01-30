import Dexie from 'dexie'
import { db, dbsp } from '@/db'
import type { IRecipe, IRecipe_hashtag, IRecipe_Ingredient } from '@/db'

import type {
  IRecipesSearchItem,
} from '@/types/IRecipesSearchItem'
import type { INameWithId } from '@/types/IIngredientInRecipeItem'

const DEFAULT_PAGE_SIZE = 10

const fastForward = (lastItem: IRecipe, filters: (i: IRecipe) => boolean) => {
  let fastForwardComplete = false

  return (item: IRecipe) => {
    if (fastForwardComplete) {
      return filters(item)
    }

    if (item.id === lastItem.id) {
      fastForwardComplete = true
    }

    return false
  }
}

let endOfPages = false
let lastEntries = [] as IRecipe[]
let hashtagIds = [] as number[]
let searchInTrash = false
let pageSize = DEFAULT_PAGE_SIZE


export default async () => {
  const searchParams = await dbsp.searchParams.get({ id: 1 })
  let pageNumber = searchParams?.pageNumber ?? 1

  let lastEntry = lastEntries[pageNumber]

  if (endOfPages && pageNumber > 1) {
    pageNumber--
  }

  if (
    JSON.stringify(hashtagIds) !== JSON.stringify(searchParams?.hashtagIds ?? [])
    || searchInTrash !== !!searchParams?.searchInTrash
    || pageSize !== (searchParams?.pageSize ?? DEFAULT_PAGE_SIZE)
  ) {
    lastEntries = []
    pageNumber = 1
  }

  hashtagIds = searchParams?.hashtagIds ?? []
  searchInTrash = !!searchParams?.searchInTrash
  pageSize = searchParams?.pageSize ?? DEFAULT_PAGE_SIZE

  let stepRecipeIds = [] as number[]

  for (const hashtagId of hashtagIds) {
    const recipeHashtags = await db.recipe_hashtag
      .where('hashtagId')
      .equals(hashtagId)
      // Ищем среди уже отобранных на прошлом шаге
      .and((item) => !stepRecipeIds.length || stepRecipeIds.includes(item.recipeId))
      .toArray()

    if (!recipeHashtags?.length) {
      return { endOfPages, recipesSearchItems: [] as IRecipesSearchItem[] } // []
    }

    stepRecipeIds = recipeHashtags.map((item) => item.recipeId)
  }

  let hashtagFilter = (_: IRecipe) => true

  if (stepRecipeIds.length) {
    hashtagFilter = (item) => stepRecipeIds.includes(item.id as number)
  }

  let trashFilter = (item: IRecipe) => !!item.deletionDate === searchInTrash
  let filter = (item: IRecipe) => trashFilter(item) && hashtagFilter(item)

  let recipes = [] as IRecipe[]

  if (pageNumber === 1) {
    recipes = await db.recipes.orderBy('name')
      .filter((item) => filter(item))
      .limit(pageSize)
      .toArray()
  } else {
    recipes = await db.recipes
      .where('name').aboveOrEqual((lastEntry as IRecipe).name)
      .filter(fastForward((lastEntry as IRecipe), filter))
      .limit(pageSize)
      .toArray()
  }

  lastEntries[pageNumber + 1] = recipes[recipes.length - 1]
  // await dbsp.searchParams.update(1, { lastEntry })

  endOfPages = recipes.length < pageSize

  // if (recipes.length < pageSize) {
  //   await dbsp.searchParams.update(1, { endOfPages: true })
  // }

  const recipesSearchItems = [] as IRecipesSearchItem[]

  for (const recipe of recipes) {
    const response = await Dexie.Promise.all([
      db.recipe_hashtag.where('recipeId').equals(recipe.id as number).toArray(),
      db.recipe_ingredient.where('recipeId').equals(recipe.id as number).toArray(),
    ])

    const recipeHashtags = response[0] ?? [] as IRecipe_hashtag[]
    const recipeIngredients = response[1] ?? [] as IRecipe_Ingredient[]

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

  return { endOfPages, recipesSearchItems }
}
