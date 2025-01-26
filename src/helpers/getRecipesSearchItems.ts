import Dexie from 'dexie'
import { db, dbs } from '@/db'
import type {
  IRecipesSearchItem,
} from '@/types/IRecipesSearchItem'
import type { INameWithId } from '@/types/IIngredientInRecipeItem'

export default async () => {
  const settings = await dbs.settings.get({ id: 1 })

  const recipes = (
    await db.recipes
      .filter((item) => !!item.deletionDate === !!settings?.searchInTrash)
      .toArray()
  ) ?? []

  const recipesSearchItems = [] as IRecipesSearchItem[]

  for (const recipe of recipes) {
    const response = await Dexie.Promise.all([
      db.recipe_hashtag.where('recipeId').equals(recipe.id as number).toArray(),
      db.recipe_ingredient.where('recipeId').equals(recipe.id as number).toArray(),
    ])

    const hashtags = response[0] ?? []
    const ingredients = response[1] ?? []

    const hashtagNames = hashtags.map((item) => {
      return item.hashtagName
    })

    const ingredientNames = [] as string[]

    for (const ingredient of ingredients) {
      const ingredientItem = (await db.ingredients.get({
        id: ingredient.ingredientId,
      })) as INameWithId

      ingredientNames.push(ingredientItem?.name)
    }

    recipesSearchItems.push({
      ...recipe,
      hashtagNames,
      ingredientNames,
    })
  }

  return recipesSearchItems
}
