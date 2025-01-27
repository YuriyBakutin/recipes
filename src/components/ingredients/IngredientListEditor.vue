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
      modelValue: IIngredientInRecipeItem[]
      editing: boolean
      showError?: boolean
    }>(),
    {
      showError: false,
    },
  )

  const loading = ref(false)
  const ingredientList = ref([] as IIngredientInRecipeItem[])

  watch(
    () => props.modelValue,
    () => {
      ingredientList.value = props.modelValue
    },
  )

  const ingredientHiddenItemList = computed(() =>
    ingredientList.value.map((ingredient) => ingredient.ingredient.name),
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
    class="grid relative"
    :class="
      editing ?
        'grid-cols-[4fr_1fr_4fr_minmax(48px,48px)]'
      : 'grid-cols-[4fr_1fr_4fr]'
    "
  >
    <div class="contents text-primary font-bold">
      <div class="pr-5 py-5 van-padding-left">Ингредиент</div>
      <div class="p-5">Кол-во</div>
      <div class="p-5">Ед. изм.</div>
    </div>
    <div v-if="editing" class="w-24 van-padding-right"></div>
    <template v-if="ingredientList?.length">
      <IngredientListItem
        v-for="(ingredient, index) in ingredientList ?? []"
        :key="ingredient.ingredientName"
        :ingredient="ingredient"
        :index="index"
        :editing="editing"
        @edit="editIngredient"
      />
    </template>
    <IngredientDataInput
      v-if="editing"
      :ingredientItem="editedIngredient"
      :ingredientHiddenItemList="ingredientHiddenItemList"
      @add="addIngredient"
    />
    <div
      v-if="props.showError && !ingredientList.length && editing"
      class="absolute left-0 top-0 mt-23 van-padding-left text-error"
    >
      Добавьте ингредиенты.
    </div>
  </div>
</template>
