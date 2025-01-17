<script lang="ts">
  import { db, observableQuery, IRecipe,  } from '@/db'

  let oldHashtagNamesSet = new Set<string>()
</script>
<script lang="ts" setup>
  const props = defineProps<{ recipe?: IRecipe }>()

  const loading = ref(false)
  const isNew = computed(() => !props.recipe.id)
  const submitted = ref(false)

  const hashtagNames = ref([] as string[])
  const hashtagError = computed(() => !hashtagNames.value.length)

  const recipeName = ref('')
  const recipeNameError = computed(() => !recipeName.value)

  const content = ref('')
  const contentError = computed(() => !content.value)


  const saveRecipe = async () => {
    submitted.value = true

    if (hashtagError.value || recipeNameError.value || contentError.value) {
      return
    }

    await db.transaction(
      'rw',
      ['recipes', 'hashtags', 'hashtag_recipe'],
      async () => {
        const recipe = {
          name: recipeName.value,
          content: content.value,
        } as IRecipe

        if (!isNew){
          recipe.id = props.recipe.id
        }

        recipe.id = await db.recipes.put(recipe)

        // Хештеги во время работы не удаляются. Нужна (или не нужна ?)
        // отдельная операция по инициализации таблицы хештегов, хештегами,
        // используемыми в других таблицах, возможно, при старте.
        await db.hashtags.bulkPut(hashtagNames.value.map((name) => ({ name })))

        const hashtagNamesSet = new Set(hashtagNames.value)

        //  Добавить в базу новые
        const addedHashtagNames = [
          ...hashtagNamesSet.difference(oldHashtagNamesSet)
        ]

        const dataToSave = addedHashtagNames.map(
          (name) => ({ hashtagName: name, recipeId: recipe.id })
        )

        await db.hashtag_recipe.bulkPut(dataToSave)

        //  Удалить из базы все, которые были удалены
        const deletedHashtagNames = [
          ...oldHashtagNamesSet.difference(hashtagNamesSet)
        ]

        const dataToDelete = deletedHashtagNames.map(
          (name) => ([name, recipe.id])
        )

        await db.hashtag_recipe.bulkDelete(dataToDelete)

        oldHashtagNamesSet = hashtagNamesSet
      }
    )
  }

  onMounted(
    async () => {
      if (!isNew) {
        hashtagNames.value = (
          await db.hashtag_recipe.get({ recipeId: props.recipe.id })
        )?.map((item) => item.hashtagName).sort() ?? []

        oldHashtagNamesSet = new Set(hashtagNames.value)
        recipeName.value = props.recipe.name
        content.value = props.recipe.content
      }
    }
  )
</script>
<template>
  <div>
    <HashtagListEditor
      v-model="hashtagNames"
      :error="hashtagError && submitted"
    />
    <van-field
      v-model="recipeName"
      placeholder="Название"
      :error="recipeNameError && submitted"
    />
    <van-field
      v-model="content"
      type="textarea"
      autosize
      placeholder="Текст рецепта"
      :error="contentError && submitted"
    />
    <van-button
      plain
      size="small"
      type="primary"
      class="w-280"
      @click="saveRecipe"
    >
      Сохранить рецепт
    </van-button>
  </div>
</template>
