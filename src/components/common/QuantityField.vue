<script lang="ts">
  import textToNumber from '@/helpers/textToNumber'
  import numberToText from '@/helpers/numberToText'
  import incrementOrDecrementQuantity from '@/helpers/incrementOrDecrementQuantity'

  export const DEFAULT_QUANTITY = 1
</script>
<script lang="ts" setup>
  const emit = defineEmits(['update:modelValue'])

  const props = withDefaults(
    defineProps<{
      modelValue?: number
      defaultQuantity?: number
      step?: number
      min?: number
      max?: number
      error?: boolean
    }>(),
    {
      defaultQuantity: DEFAULT_QUANTITY,
      step: 1,
      min: 0.01,
      max: 10_000,
    },
  )

  const quantity = ref(DEFAULT_QUANTITY as number | undefined)
  const quantityText = ref(String(DEFAULT_QUANTITY) as string | undefined)

  watch(
    () => props.modelValue,
    () => {
      if (quantity.value === props.modelValue) {
        return
      }

      quantity.value = props.modelValue
      quantityToText()
    },
  )

  const onNumberStep = (stepSign: 1 | -1) => {
    quantity.value = incrementOrDecrementQuantity(
      quantity.value,
      props.step * stepSign,
      props.min,
      props.max,
    )

    emit('update:modelValue', quantity.value)
    quantityToText()
  }

  const quantityToText = () => {
    if (Number.isNaN(quantity.value)) {
      return
    }

    quantityText.value = numberToText(quantity.value)
  }

  const textToQuantity = () => {
    quantity.value = textToNumber(quantityText.value)

    emit('update:modelValue', quantity.value)
  }

  const onQuantityFieldBlur = () => {
    if (Number.isNaN(quantity.value)) {
      return
    }

    quantityToText()
    textToQuantity()
  }
</script>
<template>
  <div class="relative p-0">
    <Icon
      name="down"
      :clickable="true"
      class="text-24 text-primary absolute left-2 top-1 z-10"
      @click="onNumberStep(-1)"
    />
    <van-field
      v-model="quantityText"
      placeholder="Кол-во"
      :error="props.error"
      class="number-field p-0 relative"
      @update:modelValue="textToQuantity"
      @blur="onQuantityFieldBlur"
    />
    <Icon
      name="up"
      :clickable="true"
      class="text-24 text-primary absolute right-2 top-1"
      @click="onNumberStep(1)"
    />
  </div>
</template>
<style>
  .number-field .van-field__control {
    padding-left: 30px;
    padding-right: 30px;
    text-align: center;
  }
</style>
