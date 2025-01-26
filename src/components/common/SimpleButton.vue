<script lang="ts" setup>
  const props = withDefaults(
    defineProps<{
      iconName?: string
      iconSize?: number | string
      label: string
      disabled?: boolean
      fontBold?: boolean
    }>(),
    {
      iconSize: 24,
      disabled: false,
      fontBold: true,
    },
  )
</script>
<template>
  <div
    tabindex="0"
    class="flex justify-end items-center gap-10"
    :class="props.disabled ? 'text-inactive' : 'text-primary cursor-pointer'"
  >
    <Icon
      :name="iconName"
      :clickable="!props.disabled"
      :style="{ 'font-size': props.iconSize + 'px' }"
    />
    <span
      class="underline hover:opacity-60"
      :class="{ 'font-bold': props.fontBold }"
    >
      {{ props.label }}
    </span>
  </div>
</template>
