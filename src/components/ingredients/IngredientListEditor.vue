<script lang="ts">
  import Dexie from 'dexie'
  import { db } from '@/db'
  import { IIngredientInRecipeItem } from '@/types/IIngredientInRecipeItem'

  const getEmptyIngredient = () =>
    ({
      ingredient: { name: '' },
      quantity: null,
      unit: { name: '' },
    }) as IIngredientInRecipeItem
</script>
<script lang="ts" setup>
  const emit = defineEmits(['update:modelValue', 'ingredientListInit'])

  const props = withDefaults(
    defineProps<{
      recipeId?: number
      showError?: boolean
    }>(),
    {
      showError: false,
    },
  )

  const loading = ref(false)
  const ingredientList = ref([] as IIngredientInRecipeItem[])

  const ingredientHiddenItemList = computed(() =>
    ingredientList.value.map((ingredient) => ingredient.ingredient.name),
  )

  watch(
    () => props.recipeId,
    async () => {
      if (!props.recipeId) {
        return
      }

      loading.value = true

      ingredientList.value = await db.recipe_ingredient
        .where({ recipeId: props.recipeId })
        .toArray(async (item) => {
          const result = await Dexie.Promise.all([
            db.ingredients.get({ id: item.ingredientId }),
            db.ingredientUnits.get({ id: item.unitId }),
          ])

          return {
            ingredient: { id: item.ingredientId, name: result[0].name },
            quantity: item.quantity,
            unit: { id: item.unitId, name: result[1].name },
          }
        })

      emit('ingredientListInit', ingredientList.value)
      loading.value = false
    },
  )

  const editedIngredient = ref(getEmptyIngredient())

  const addIngredient = (payload: IIngredientInRecipeItem) => {
    ingredientList.value.push(payload)
    emit('update:modelValue', ingredientList.value)
  }

  const editIngredient = (index: number) => {
    editedIngredient.value = ingredientList.value[index]

    ingredientList.value = [
      ...ingredientList.value.slice(0, index),
      ...ingredientList.value.slice(index + 1),
    ]

    emit('update:modelValue', ingredientList.value)
  }
</script>
<template>
  <div
    class="van-padding grid grid-cols-[5fr_1fr_5fr_24px] gap-x-16 gap-y-14 relative"
  >
    <div class="contents text-primary font-bold">
      <div>Ингредиент</div>
      <div>Кол-во</div>
      <div>Ед. изм.</div>
    </div>
    <div class="w-24"></div>
    <template v-if="ingredientList?.length">
      <IngredientListItem
        v-for="(ingredient, index) in ingredientList ?? []"
        :key="ingredient.ingredientName"
        :ingredient="ingredient"
        :index="index"
        @edit="editIngredient"
      />
    </template>
    <IngredientDataInput
      :ingredientItem="editedIngredient"
      :ingredientHiddenItemList="ingredientHiddenItemList"
      @add="addIngredient"
    />
    <div
      v-if="props.showError && !ingredientList.length"
      class="absolute left-0 bottom-0 -mb-12 van-padding-left text-error"
    >
      Добавьте ингредиенты.
    </div>
  </div>
</template>
