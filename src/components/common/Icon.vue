<script setup lang="ts">
  const props = withDefaults(
    defineProps<{
      name: string
      clickable?: boolean
    }>(),
    {
      clickable: false,
    },
  )

  const content = ref('' as any)

  const getContent = async () => {
    content.value =
      (await import(`../../icons/${props.name}.svg?raw`))?.default ?? ''
  }

  watch(() => props.name, getContent)

  onMounted(async () => {
    await getContent()
  })
</script>
<template>
  <button
    :disabled="!props.clickable"
    class="icon-button inline-flex justify-center items-center text-center"
    :class="{ 'clickable cursor-pointer': props.clickable }"
    v-html="content"
  />
</template>

<style scoped>
  .size-full svg {
    width: 100%;
    height: 100%;
  }

  .clickable.icon-button:focus,
  .clickable.icon-button:hover {
    opacity: 0.6;
  }
</style>
