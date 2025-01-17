import Dexie, { liveQuery } from 'dexie';
import type { Table, Observable } from 'dexie';
import type { Ref } from 'vue'
import { Themes } from '@/types/Themes'
import { useObservable } from '@vueuse/rxjs'

export interface IRecipe {
  id?: number,
  name: string,
  content: string,
  deletionDate?: number | null,
}

export interface IHashtag {
  name: string,
}

export interface IHashtag_Recipe {
  hashtagName: string,
  recipeId: number,
}

export interface IHashtagExp {
  id?: number,
  name: string,
  hashtagExp: string,
}

export interface ISettings { // Здесь пока только один параметр
  id?: number, // Всегда используется строка с id === 1
  theme?: Themes,
}

export class RecipesDatabase extends Dexie {
  recipes!: Table<IRecipe>
  hashtags!: Table<IHashtag>
  hashtag_recipe!: Table<IHashtag_Recipe>
  hashtagExps!: Table<IHashtagExp>

  constructor() {
    super('RecipesDatabase')

    this.version(1).stores({
      recipes: '++id, name, content, deletionDate',
      hashtags: '&name',
      hashtag_recipe: '&[hashtagName+recipeId], hashtagName, recipeId',
      hashtagExps: '++id, name, hashtagExp',
      settings: '++id, theme',
    })
  }
}

export const db = new RecipesDatabase()

export const observableQuery = <T>(query: () => Promise<T>): Ref<T> => {
  return (useObservable(liveQuery(query) as any) as T) as Ref<T>
}
