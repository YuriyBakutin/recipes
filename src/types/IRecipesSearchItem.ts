import type { IRecipe } from '@/db'

export interface IHashtagAndIngredientNames {
  hashtagNames: string[],
  ingredientNames: string[],
}

export interface IRecipesSearchItem extends IRecipe, IHashtagAndIngredientNames { }
