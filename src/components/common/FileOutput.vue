<script lang="ts" setup>
  const emit = defineEmits(['saveDialogLinkClicked', 'click'])

  const props = withDefaults(
    defineProps<{
      iconName?: string
      iconSize?: number | string
      label?: string
      disabled?: boolean
      fontBold?: boolean
      labelFirst?: boolean
      urlToSave?: string
      fileName?: string
      preparationReady?: boolean
    }>(),
    {
      iconName: '',
      iconSize: 24,
      label: 'Сохранить',
      disabled: false,
      fontBold: true,
      labelFirst: false,
      preparationReady: false,
    },
  )

  const onPrepareProps = ref(false)
  const saveFileLinkElem = ref(null)

  watch(
    () => props.preparationReady,
    async () => {
      if (props.preparationReady) {
        onPrepareProps.value = false
        saveFileLinkElem.value.click()
        emit('saveDialogLinkClicked')
      }
    },
  )

  const emitPreparePropsToSaveFile = () => {
    if (onPrepareProps.value || props.preparationReady) {
      return
    }

    onPrepareProps.value = true
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
    @click="emit('click')"
  />
  <a
    ref="saveFileLinkElem"
    :href="props.urlToSave"
    :download="props.fileName"
    class="hidden"
  ></a>
</template>
