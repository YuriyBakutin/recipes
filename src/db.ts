import Dexie, { liveQuery } from 'dexie';
import type { Table, Observable } from 'dexie';
import type { Ref } from 'vue'
import { Themes } from '@/types/Themes'
import { useObservable } from '@vueuse/rxjs'

export interface ISettings { // Здесь пока только один параметр
  id?: number, // Всегда используется строка с id === 1
  theme?: Themes,
  dbInitCompleted?: boolean,
}

export interface IRecipe {
  id?: number,
  name: string,
  content: string,
  deletionDate?: number | null,
}

export interface IHashtag {
  name: string,
}

export interface IRecipe_hashtag {
  hashtagName: string,
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

const schema = {
  settings: '++id, theme',
  recipes: '++id, name, content, deletionDate',
  hashtags: '&name',
  recipe_hashtag: '&[recipeId+hashtagName], recipeId, hashtagName',
  hashtagExps: '++id, name, hashtagExp',
  ingredients: '++id, name',
  ingredientUnits: '++id, name',
  recipe_ingredient: '&[recipeId+ingredientId],'
    + ' recipeId, ingredientId, unitId',
}

export class RecipesDatabase extends Dexie {
  settings!: Table<ISettings>
  recipes!: Table<IRecipe>
  hashtags!: Table<IHashtag>
  recipe_hashtag!: Table<IRecipe_hashtag>
  hashtagExps!: Table<IHashtagExp>
  ingredients!: Table<IIngredient>
  ingredientUnits!: Table<IIngredientUnit>
  recipe_ingredient!: Table<IRecipe_Ingredient>

  constructor() {
    super('RecipesDatabase')

    this.version(1).stores(schema)
  }
}

export const db = new RecipesDatabase()

export const observableQuery = <T>(query: () => Promise<T>): Ref<T> => {
  return (useObservable(liveQuery(query) as any) as T) as Ref<T>
}


const loadStaticData = async () => {
  const settingsData = (await db.settings.where({ id: 1 }).first())
  console.log('settingsData: ', settingsData);
  const dbInitCompleted = settingsData?.dbInitCompleted
  console.log('dbInitCompleted: ', dbInitCompleted);

  if (!dbInitCompleted) {
    try {
      await db.transaction(
        'rw',
        [
          'settings',
          'ingredients',
          'ingredientUnits',
        ],
        async () => {
          await db.ingredients.bulkPut([
            { name: 'творог' },
            { name: 'творожная масса' },
            { name: 'тесто слоёное' },
            { name: 'сметана' },
            { name: 'сыр' },
            { name: 'яйца' },
            { name: 'кефир' },
          ])

          await db.ingredientUnits.bulkPut([
            { name: 'г' },
            { name: 'кг' },
            { name: 'л' },
            { name: 'ст. лож.' },
            { name: 'ч. лож.' },
            { name: 'на вкус' },
            { name: 'для смазывания' },
            { name: 'шт.' },
            { name: 'щепотка' },
          ])

          const payload = { ...settingsData, id: 1, dbInitCompleted: true }
          console.log('payload: ', payload);
          await db.settings.put(payload)
        }
      )

      console.log('База успешно инициирована')
    } catch (err) {
      console.error(err)
    }
  }
}

loadStaticData()
