<script lang="ts">
  import textToNumber from '@/helpers/textToNumber'
  import numberToText from '@/helpers/numberToText'
  import {
    INameWithId,
    IIngredientInRecipeItem,
  } from '@/types/IIngredientInRecipeItem'

  const getEmptyItem = () =>
    ({
      ingredient: { name: '' },
      unit: { name: '' },
      quantity: 1,
    }) as IIngredientInRecipeItem

  const initUnacceptedFieldsObj = () => ({ ingredient: false, unit: false })
  const DEFAULT_QUANTITY = 1
</script>
<script lang="ts" setup>
  const emit = defineEmits(['add'])

  const props = withDefaults(
    defineProps<{
      ingredientItem: IIngredientInRecipeItem
      ingredientHiddenItemList?: string[]
    }>(),
    {
      ingredientHiddenItemList: [],
    },
  )

  const newIngredientItem = ref(getEmptyItem())
  const unacceptedFields = ref(initUnacceptedFieldsObj())

  watch(
    () => props.ingredientItem,
    () => {
      newIngredientItem.value.ingredient = {
        ...props.ingredientItem.ingredient,
      }

      newIngredientItem.value.unit = { ...props.ingredientItem.unit }
      newIngredientItem.value.quantity = props.ingredientItem.quantity
      focusRequest.value = true

      if (
        !!newIngredientItem.value.ingredient.name &&
        !!newIngredientItem.value.unit.name
      ) {
        unacceptedFields.value = initUnacceptedFieldsObj()
      }
    },
  )

  type FieldName = 'ingredient' | 'unit'

  const quantityIsInvalid = computed(() =>
    isNaN(newIngredientItem.value.quantity),
  )

  const readyAddToList = computed(
    () =>
      !!newIngredientItem.value.ingredient.name &&
      !!newIngredientItem.value.unit.name &&
      !unacceptedFields.value.ingredient &&
      !unacceptedFields.value.unit &&
      !quantityIsInvalid.value,
  )

  const onNewIngredientFieldSelect = (
    payload: INameWithId,
    fieldName: FieldName,
  ) => {
    newIngredientItem.value[fieldName] = payload
    unacceptedFields.value[fieldName] = false
  }

  const onSetUnaccepted = (fieldName: FieldName) => {
    unacceptedFields.value[fieldName] = true
  }

  const focusRequest = ref(false)

  const onFocused = () => {
    focusRequest.value = false
  }

  const addIngredient = () => {
    const payload = {
      ingredient: { ...newIngredientItem.value.ingredient },
      quantity: newIngredientItem.value.quantity,
      unit: { ...newIngredientItem.value.unit },
    }

    emit('add', payload)
    focusRequest.value = true
    newIngredientItem.value = getEmptyItem()
  }
</script>
<template>
  <AutocompleteField
    placeholder="Ингредиент"
    :text="newIngredientItem.ingredient.name"
    :error="false"
    dbTableName="ingredients"
    :accepted="unacceptedFields.ingredient"
    :hiddenItemList="ingredientHiddenItemList"
    :focusRequest="focusRequest"
    class="mt-16 mr-5 van-padding-left"
    @focused="onFocused"
    @select="onNewIngredientFieldSelect($event, 'ingredient')"
    @setUnaccepted="onSetUnaccepted('ingredient')"
  />
  <QuantityField
    v-model="newIngredientItem.quantity"
    :error="quantityIsInvalid"
    class="mt-16 mx-5"
  />
  <AutocompleteField
    placeholder="Ед. изм."
    :text="newIngredientItem.unit.name"
    :error="false"
    :showPopupOnFocus="true"
    dbTableName="ingredientUnits"
    :accepted="unacceptedFields.unit"
    class="mt-16 mx-5"
    @select="onNewIngredientFieldSelect($event, 'unit')"
    @setUnaccepted="onSetUnaccepted('unit')"
  />
  <Icon
    name="save-up"
    :clickable="readyAddToList"
    class="text-24 mt-16 van-padding-right"
    :class="!readyAddToList ? 'opacity-[0.5] text-inactive' : 'text-primary'"
    @click.prevent.stop="addIngredient"
  />
</template>
<style>
  .number-field .van-field__control {
    padding-left: 30px;
    padding-right: 30px;
    text-align: center;
  }
</style>
