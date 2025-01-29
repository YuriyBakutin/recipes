<script lang="ts" setup>
  const props = withDefaults(
    defineProps<{
      iconName?: string
      iconSize?: number | string
      label: string
      disabled?: boolean
      fontBold?: boolean
      labelFirst?: boolean
    }>(),
    {
      iconSize: 24,
      disabled: false,
      fontBold: true,
      labelFirst: false,
    },
  )
</script>
<template>
  <div
    tabindex="0"
    class="flex items-center gap-10"
    :class="props.disabled ? 'text-inactive' : 'text-primary cursor-pointer'"
  >
    <span
      v-if="labelFirst"
      class="underline hover:opacity-60 select-none"
      :class="{ 'font-bold': props.fontBold, 'opacity-60': props.disabled }"
    >
      {{ props.label }}
    </span>
    <Icon
      :name="iconName"
      :clickable="!props.disabled"
      :class="props.disabled ? 'opacity-60' : 'hover:opacity-60'"
      :style="{ 'font-size': props.iconSize + 'px' }"
    />
    <span
      v-if="!labelFirst"
      class="underline hover:opacity-60 select-none"
      :class="{ 'font-bold': props.fontBold, 'opacity-60': props.disabled }"
    >
      {{ props.label }}
    </span>
  </div>
</template>
