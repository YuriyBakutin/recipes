<script lang="ts">
  import { Themes } from '@/types/Themes'
  import { Colors } from '@/data/Colors'
  import SearchQueriesTab from '@/components/tabs/SearchQueriesTab.vue'
  import RecipeTab from '@/components/tabs/SearchQueriesTab.vue'
  import SettingsTab from '@/components/tabs/SettingsTab.vue'
  import AboutTab from '@/components/tabs/AboutTab.vue'

  const tabOptions = {
    searchQueries: {
      component: SearchQueriesTab,
      title: 'Поиск',
    },
    recipe: {
      component: RecipeTab,
      title: 'Рецепт',
    },
    settings: {
      component: SettingsTab,
      title: 'Настройки'
    },
    about: {
      component: AboutTab,
      title: 'О программе',
    },
  }
</script>
<script setup lang="ts">
  const currentTabName = ref('searchQueries')
  const activeColor = ref(Colors.primary)

  const currentTab = computed(
    () => tabOptions[currentTabName.value].component
  )

  const currentTitle = computed(
    () => tabOptions[currentTabName.value].title
  )

  const theme = ref(Themes.light)

  const changeTheme = (newTheme?: Themes) => {
    if (newTheme) {
      theme.value = newTheme
    }
  }
</script>
<template>
  <van-config-provider class="h-screen" :theme="theme">
    <van-tabbar v-model="currentTabName" :fixed="false" class="mb-0" :active-color="activeColor">
      <van-tabbar-item name="searchQueries">
        <strong>Поиск</strong>
        <template #icon>
          <Icon name="search-queries" class="text-22" />
        </template>
      </van-tabbar-item>
      <van-tabbar-item name="recipe">
        <strong>Рецепт</strong>
        <template #icon>
          <Icon name="pot" />
        </template>
      </van-tabbar-item>
      <van-tabbar-item name="settings">
        <strong>Настройки</strong>
        <template #icon>
          <Icon name="settings" class="text-22" />
        </template>
      </van-tabbar-item>
      <van-tabbar-item name="about">
        <strong>О программе</strong>
        <template #icon>
          <Icon name="about" />
        </template>
      </van-tabbar-item>
    </van-tabbar>
    <KeepAlive>
      <div class="main-block overflow-y-auto">
          <h1 class="w-full text-center font-bold text-18 text-primary my-10">
            {{ currentTitle }}
          </h1>
          <component
            :is="currentTab"
            @changeTheme="changeTheme"
          />
      </div>
    </KeepAlive>
  </van-config-provider>
</template>
<style>
.main-block {
  height: calc(100% - var(--van-tabbar-height));
}
</style>
