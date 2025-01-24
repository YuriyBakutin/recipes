<script lang="ts">
  import { IIngredientInRecipeItem } from '@/types/IIngredientInRecipeItem'
</script>
<script lang="ts" setup>
  const emit = defineEmits(['edit'])

  const props = defineProps<{
    ingredient: IIngredientInRecipeItem
    index: number
  }>()
</script>
<template>
  <div>{{ props.ingredient.ingredient.name }}</div>
  <div>{{ props.ingredient.quantity }}</div>
  <div>{{ props.ingredient.unit.name }}</div>
  <Icon
    name="edit"
    class="text-16 text-primary cursor-pointer"
    @click="emit('edit', props.index)"
  />
</template>
