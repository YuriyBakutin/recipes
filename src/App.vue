<script lang="ts">
  import { db, dbs, observableQuery } from '@/db'
  import { Themes } from '@/types/Themes'
  import { Colors, colorsInit } from '@/data/Colors'
  import SearchTab from '@/components/tabs/SearchTab.vue'
  import RecipeTab from '@/components/tabs/RecipeTab.vue'
  import SettingsTab from '@/components/tabs/SettingsTab.vue'
  import AboutTab from '@/components/tabs/AboutTab.vue'

  const tabOptions = {
    search: {
      component: SearchTab,
      title: 'Поиск',
    },
    recipe: {
      component: RecipeTab,
      title: 'Рецепт',
    },
    settings: {
      component: SettingsTab,
      title: 'Настройки',
    },
    about: {
      component: AboutTab,
      title: 'О программе',
    },
  }
</script>
<script setup lang="ts">
  const currentTabName = ref('search' as keyof typeof tabOptions)
  const activeColor = ref(Colors.primary)

  const currentTabComponent = computed(
    () => tabOptions[currentTabName.value].component,
  )

  const currentTitle = computed(() => tabOptions[currentTabName.value].title)

  const theme = observableQuery(async () => {
    return (await dbs.settings.get({ id: 1 }))?.theme ?? Themes.light
  })

  const recipeId = observableQuery(async () => {
    return (await dbs.settings.get({ id: 1 }))?.openedRecipeId
  })

  watch(
    () => recipeId.value,
    () => {
      if (recipeId.value) {
        currentTabName.value = 'recipe'
      }
    },
  )

  onMounted(() => {
    colorsInit()
  })
</script>
<template>
  <van-config-provider class="h-screen" :theme="theme">
    <van-tabbar
      v-model="currentTabName"
      :fixed="false"
      class="mb-0"
      :active-color="activeColor"
    >
      <van-tabbar-item name="search">
        <strong>Поиск</strong>
        <template #icon>
          <Icon name="search_m" class="text-24" />
        </template>
      </van-tabbar-item>
      <van-tabbar-item name="recipe">
        <strong>Рецепт</strong>
        <template #icon>
          <Icon name="pot" class="text-24" />
        </template>
      </van-tabbar-item>
      <van-tabbar-item name="settings">
        <strong>Настройки</strong>
        <template #icon>
          <Icon name="options" class="text-24" />
        </template>
      </van-tabbar-item>
      <van-tabbar-item name="about">
        <strong>О программе</strong>
        <template #icon>
          <Icon name="about" class="text-24" />
        </template>
      </van-tabbar-item>
    </van-tabbar>
    <KeepAlive>
      <div class="main-block overflow-y-auto">
        <component :is="currentTabComponent" />
      </div>
    </KeepAlive>
  </van-config-provider>
</template>
<style>
  .main-block {
    height: calc(100vh - var(--van-tabbar-height));
  }
</style>
