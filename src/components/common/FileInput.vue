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

  const inputFileElem = ref<HTMLInputElement>()

  const getFile = async (event: Event) => {
    const file = (inputFileElem.value as HTMLInputElement).files?.[0]

    if (!file) {
      return
    }

    const reader = new FileReader()

    interface IOnloadFileReaderEventTarget extends EventTarget {
      result: string
      error: string
    }

    reader.onload = (event: Event) => {
      emit('afterRead', (event.target as IOnloadFileReaderEventTarget).result)
    }

    reader.onerror = (event: Event) => {
      const error = (event.target as IOnloadFileReaderEventTarget).error
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
    @click="(inputFileElem as HTMLInputElement).click()"
  />
  <input
    ref="inputFileElem"
    type="file"
    accept="application/json"
    class="hidden"
    @change="getFile"
  />
</template>
