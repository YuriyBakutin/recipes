<script setup lang="ts">
  const props = defineProps<{
    name: string,
  }>()

  const content = ref('' as any)

  const getContent = async () => {
    content.value = (await import(`../../icons/${props.name}.svg?raw`))?.default ?? ''
  }

  watch(
    () => props.name,
    getContent,
  )

  onMounted(getContent)
</script>
<template>
  <div class="inline" v-html="content" />
</template>

<style>
.size-full svg {
  width: 100%;
  height: 100%;
}
</style>
