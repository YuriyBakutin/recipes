<script lang="ts" setup>
  const emit = defineEmits(['afterRead'])

  const props = withDefaults(
    defineProps<{
      iconName?: string
      iconSize?: number | string
      label?: string
      disabled?: boolean
      fontBold?: boolean
      labelFirst?: boolean
    }>(),
    {
      iconName: '',
      iconSize: 24,
      label: 'Загрузить',
      disabled: false,
      fontBold: true,
      labelFirst: false,
    },
  )

  const inputFileElem = ref(null)

  const getFile = async (event: Event) => {
    const file = inputFileElem.value.files[0]

    if (!file) {
      return
    }

    const reader = new FileReader()

    reader.onload = (event: Event) => {
      emit('afterRead', event.target.result)
    }

    reader.onerror = (event: Event) => {
      const error = event.target.error
      console.error(`При чтении ${file.name} произошла ошибка`, error)
    }

    reader.readAsText(file)
  }
</script>
<template>
  <SimpleButton
    :iconName="props.iconName"
    :iconSize="props.iconSize"
    :label="props.label"
    :disabled="props.disabled"
    :fontBold="props.fontBold"
    :labelFirst="props.labelFirst"
    @click="inputFileElem.click()"
  />
  <input
    ref="inputFileElem"
    type="file"
    accept="application/json"
    class="hidden"
    @change="getFile"
  />
</template>
