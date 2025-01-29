<script lang="ts" setup>
  const emit = defineEmits(['update:modelValue'])

  const props = withDefaults(
    defineProps<{
      modelValue: boolean
      checkedIconName?: string
      uncheckedIconName?: string
      iconSize?: number | string
      label: string
      disabled?: boolean
      fontBold?: boolean
      labelFirst?: boolean
    }>(),
    {
      checkedIconName: 'checked',
      uncheckedIconName: 'unchecked',
      iconSize: 24,
      disabled: false,
      fontBold: true,
      underline: false,
      labelFirst: false,
    },
  )

  const toggleChecked = () => {
    if (props.disabled) {
      return
    }

    emit('update:modelValue', !props.modelValue)
  }
</script>
<template>
  <div
    tabindex="0"
    class="flex items-center gap-10"
    :class="props.disabled ? 'text-inactive' : 'text-primary cursor-pointer'"
    @click="toggleChecked"
  >
    <span
      v-if="labelFirst"
      class="select-none"
      :class="{ 'font-bold': props.fontBold, 'opacity-60': props.disabled }"
    >
      {{ props.label }}
    </span>
    <Icon
      :name="props.modelValue ? checkedIconName : uncheckedIconName"
      :clickable="!props.disabled"
      :class="props.disabled ? 'opacity-60' : ''"
      :style="{ 'font-size': props.iconSize + 'px' }"
    />
    <span
      v-if="!labelFirst"
      class="select-none"
      :class="{ 'font-bold': props.fontBold, 'opacity-60': props.disabled }"
    >
      {{ props.label }}
    </span>
  </div>
</template>
