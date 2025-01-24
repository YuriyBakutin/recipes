export interface INameWithId {
  id?: number
  name: string
}

export interface IIngredientInRecipeItem {
  ingredient: INameWithId
  quantity: number | null
  unit: INameWithId
}
