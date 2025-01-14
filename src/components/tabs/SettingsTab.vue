<script lang="ts">
  import { Themes } from '@/types/Themes'
  import { db } from '@/db'
</script>
<script lang="ts" setup>
  const emit = defineEmits(['changeTheme'])

  const props = withDefaults(defineProps<{
    theme: Themes,
  }>(), {
    theme: Themes.light,
  })

  const theme = ref(Themes.light)

  const changeTheme = async (value) => {
    emit('changeTheme', theme.value)

    await db.settings.put({ id: 1, theme: theme.value })
  }

  onBeforeMount(
    async () => {
      theme.value = prop.theme
    }
  )
</script>
<template>
  <div class="van-hairline--bottom pt-10 pb-20">
    <h1 class="text-14 ml-40">Тема</h1>
    <van-radio-group
      v-model="theme"
      direction="horizontal"
      shape="dot"
      class="w-full mt-20 pl-80 gap-40"
      @change="changeTheme"
    >
      <van-radio name="light">
        <div class="w-full flex gap-4 items-center pl-10">
          <Icon name="light" class="text-22"/>
          <span>Светлая</span>
        </div>
      </van-radio>
      <van-radio name="dark">
        <div class="w-full flex gap-4 items-center pl-10">
          <Icon name="dark" class="text-22"/>
          <span>Тёмная</span>
        </div>
      </van-radio>
    </van-radio-group>
  </div>
</template>
