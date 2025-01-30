<script lang="ts">
  import { DEFAULT_QUANTITY } from '@/components/common/QuantityField.vue'
  import type {
    INameWithId,
    IIngredientInRecipeItem,
  } from '@/types/IIngredientInRecipeItem'

  const getEmptyItem = () =>
    ({
      ingredient: { name: '' },
      unit: { name: '' },
      quantity: DEFAULT_QUANTITY,
    }) as IIngredientInRecipeItem

  const initUnacceptedFieldsObj = () => ({ ingredient: false, unit: false })
</script>
<script lang="ts" setup>
  const emit = defineEmits(['add', 'cleared'])

  const props = withDefaults(
    defineProps<{
      ingredientItem: IIngredientInRecipeItem
      ingredientHiddenItemList?: string[]
      cleaning?: boolean
    }>(),
    {
      ingredientHiddenItemList: () => [],
      cleaning: false,
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
    Number.isNaN(newIngredientItem.value.quantity),
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
    :margin="true"
    :hiddenItemList="ingredientHiddenItemList"
    :focusRequest="focusRequest"
    class="mt-16 mr-5 van-padding-left"
    :cleaning="props.cleaning"
    @cleared="emit('cleared')"
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
    align="right"
    class="mt-16 mx-5"
    :cleaning="props.cleaning"
    @cleared="emit('cleared')"
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
