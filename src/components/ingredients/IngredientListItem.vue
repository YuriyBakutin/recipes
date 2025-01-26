<script lang="ts">
  import { IIngredientInRecipeItem } from '@/types/IIngredientInRecipeItem'
</script>
<script lang="ts" setup>
  const emit = defineEmits(['edit'])

  const props = defineProps<{
    ingredient: IIngredientInRecipeItem
    editing: boolean
    index: number
  }>()

  const odd = computed(() => !(props.index % 2))
</script>
<template>
  <div class="pr-5 py-5 van-padding-left" :class="{ 'odd-bg': odd }">
    {{ props.ingredient.ingredient.name }}
  </div>
  <div class="p-5" :class="{ 'odd-bg': odd }">
    {{ props.ingredient.quantity }}
  </div>
  <div class="p-5" :class="{ 'odd-bg': odd }">
    {{ props.ingredient.unit.name }}
  </div>
  <Icon
    v-if="editing"
    name="edit"
    :clickable="true"
    class="text-16 text-primary cursor-pointer pl-5 van-padding-right"
    :class="{ 'odd-bg': odd }"
    @click="emit('edit', props.index)"
  />
</template>
