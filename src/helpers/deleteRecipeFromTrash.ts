import { db } from '@/db'

export default async (recipeId: number) => {
  await db.transaction(
    'rw',
    [
      'recipes',
      'recipe_hashtag',
      'recipe_ingredient',
    ],
    async () => {
      const hashtagsToDelete = await db.recipe_hashtag.where({ recipeId }).toArray()

      const RecipeHashtagKeysToDelete = hashtagsToDelete.map((item) => [
        item.recipeId,
        item.hashtagId,
      ])

      await db.recipe_hashtag.bulkDelete(RecipeHashtagKeysToDelete)
      const ingredientToDelete = await db.recipe_ingredient.where({ recipeId }).toArray()

      const RecipeIngredientKeysToDelete = ingredientToDelete.map((item) => [
        item.recipeId,
        item.ingredientId,
      ])

      await db.recipe_ingredient.bulkDelete(RecipeIngredientKeysToDelete)
      await db.recipes.delete(recipeId)
    }
  )
}
