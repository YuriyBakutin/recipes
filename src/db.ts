import Dexie, { liveQuery } from 'dexie';
import type { Table, Observable } from 'dexie';
import type { Ref } from 'vue'
import { Themes } from '@/types/Themes'
import { useObservable } from '@vueuse/rxjs'
import differenceBetweenSets from '@/helpers/differenceBetweenSets'

export interface ISettings {
  id?: number, // Всегда используется строка с id === 1
  theme?: Themes,
  openedRecipeId?: number | null,
  dbInitCompleted?: boolean,
  searchInTrash?: boolean,
}

export class SettingsDatabase extends Dexie {
  settings!: Table<ISettings>

  constructor() {
    super('SettingsDatabase')

    this.version(1).stores({
      settings: '&id, theme, openedRecipeId, searchInTrash',
    })
  }
}

export const dbs = new SettingsDatabase()

export interface ISearchParam {
  id?: number,
  searchInTrash?: boolean,
  hashtagIds?: number[],
}

export class SearchParamDatabase extends Dexie {
  searchParams!: Table<ISearchParam>

  constructor() {
    super('SearchParamDatabase')

    this.version(1).stores({
      searchParams: '&id, searchInTrash, hashtagIds',
    })
  }
}

export const dbsp = new SearchParamDatabase()

export interface IRecipe {
  id?: number,
  name: string,
  content: string,
  note: string,
  deletionDate?: number | null,
}

export interface IHashtag {
  id?: number,
  name: string,
}

export interface IRecipe_hashtag {
  hashtagId: number,
  recipeId: number,
}

export interface IHashtagExp {
  id?: number,
  name: string,
  hashtagExp: string,
}

export interface IIngredient {
  id?: number,
  name: string,
}

export interface IIngredientUnit {
  id?: number,
  name: string,
}

export interface IRecipe_Ingredient {
  ingredientId: number,
  recipeId: number,
  unitId: number,
  quantity: number,
}

const scheme = {
  recipes: '++id, name, content, note, deletionDate',
  hashtags: '++id, name',
  recipe_hashtag: '&[recipeId+hashtagId], recipeId, hashtagId',
  hashtagExps: '++id, name, hashtagExp',
  ingredients: '++id, name',
  ingredientUnits: '++id, name',
  recipe_ingredient: '&[recipeId+ingredientId],'
    + ' recipeId, ingredientId, unitId',
}

export type AnyDbTable = keyof typeof scheme

export type IdNameTable = 'hashtags' | 'ingredients' | 'ingredientUnits'

export type AnyDbTableType =
  IRecipe | IHashtag | IRecipe_hashtag | IHashtagExp |
  IIngredient | IIngredientUnit | IRecipe_Ingredient

export class RecipesDatabase extends Dexie {
  recipes!: Table<IRecipe>
  hashtags!: Table<IHashtag>
  recipe_hashtag!: Table<IRecipe_hashtag>
  hashtagExps!: Table<IHashtagExp>
  ingredients!: Table<IIngredient>
  ingredientUnits!: Table<IIngredientUnit>
  recipe_ingredient!: Table<IRecipe_Ingredient>

  constructor() {
    super('RecipesDatabase')
    this.version(1).stores(scheme)
  }
}

export const db = new RecipesDatabase()

export const observableQuery = <T>(query: () => Promise<T>): Ref<T> => {
  return (useObservable(liveQuery(query) as any) as T) as Ref<T>
}


const loadStaticData = async () => {
  const settingsData = await dbs.settings.where({ id: 1 }).first()
  const dbInitCompleted = settingsData?.dbInitCompleted
  await dbsp.searchParams.put({ id: 1, searchInTrash: false, hashtagIds: [] })

  if (!dbInitCompleted) {
    try {
      await db.transaction(
        'rw',
        [
          'ingredients',
          'ingredientUnits',
        ],
        async () => {
          const baseIngredientsSet = new Set([
            'творог',
            'творожная масса',
            'тесто слоёное',
            'сметана',
            'сыр',
            'яйца',
            'кефир',
          ])

          const ingredientsPresentSet = new Set(((
            await db.ingredients.toArray()
          ) ?? []).map((item) => item.name))

          const savedIngredients = [...differenceBetweenSets(
            baseIngredientsSet,
            ingredientsPresentSet
          )].map((item) => ({ name: item }))

          await db.ingredients.bulkPut(savedIngredients)

          const baseIngredientsUnitsSet = new Set([
            'г',
            'кг',
            'л',
            'ст. лож.',
            'ч. лож.',
            'на вкус',
            'для смазывания',
            'шт.',
            'щепотка',
          ])

          const ingredientsUnitsPresentSet = new Set(((
            await db.ingredientUnits.toArray()
          ) ?? []).map((item) => item.name))

          const savedIngredientUnits = [...differenceBetweenSets(
            baseIngredientsUnitsSet,
            ingredientsUnitsPresentSet
          )].map((item) => ({ name: item }))

          await db.ingredientUnits.bulkPut(savedIngredientUnits)
        }
      )

      const payload = { ...settingsData, id: 1, dbInitCompleted: true }
      await dbs.settings.put(payload)

      console.log('RecipesDatabase успешно инициализирована')
    } catch (err) {
      console.error(err)
    }
  }
}

loadStaticData()
