<script lang="ts">
  import { db, observableQuery } from '@/db'
  import { Themes } from '@/types/Themes'
</script>
<script lang="ts" setup>
  const theme = observableQuery(async () => {
    return (await db.settings.get({ id: 1 }))?.theme ?? Themes.light
  })

  const changeTheme = async (value) => {
    await db.settings.put({ id: 1, theme: theme.value })
  }
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
          <Icon name="light_m" class="text-22"/>
          <span>Светлая</span>
        </div>
      </van-radio>
      <van-radio name="dark">
        <div class="w-full flex gap-4 items-center pl-10">
          <Icon name="dark_m" class="text-22"/>
          <span>Тёмная</span>
        </div>
      </van-radio>
    </van-radio-group>
  </div>
</template>
