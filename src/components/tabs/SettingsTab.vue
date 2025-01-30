<script lang="ts">
  import { exportDB, importInto } from 'dexie-export-import'

  import type { ExportProgress } from 'dexie-export-import'
  import { db, dbs, observableQuery } from '@/db'
  import { Themes } from '@/types/Themes'
  import getDateTimeStringForFilename from '@/helpers/getDateTimeStringForFilename'

  const progressCallback: (progress: ExportProgress) => boolean = (progress) =>
    progress.done
</script>
<script lang="ts" setup>
  const theme = observableQuery(async () => {
    return (await dbs.settings.get({ id: 1 }))?.theme ?? Themes.light
  })

  const changeTheme = async () => {
    await dbs.settings.update(1, { theme: theme.value })
  }

  const backupUrl = ref('')
  const backupName = ref('')
  const preparationReady = ref(false)

  const preparePropsToSaveFile = async () => {
    const timestamp = getDateTimeStringForFilename()
    backupName.value = `dbRecipes-${timestamp}v${db.verno}.json`

    const backupBlob = await exportDB(db, {
      prettyJson: true,
      progressCallback,
    })

    backupUrl.value = URL.createObjectURL(backupBlob)

    await nextTick()
    preparationReady.value = true
  }

  const restoreFromBackup = async (backupFileContent: string) => {
    const backupBlob = new Blob([backupFileContent], {
      type: 'application/json',
    })

    const options = {
      acceptMissingTables: false,
      acceptVersionDiff: false,
      acceptNameDiff: false,
      acceptChangedPrimaryKey: false,
      overwriteValues: true,
      clearTablesBeforeImport: true,
      noTransaction: true,
      progressCallback,
    }

    await importInto(db, backupBlob, options)
  }
</script>
<template>
  <h1 class="w-full text-center font-bold text-18 text-primary mt-10 mb-14">
    Настройки
  </h1>
  <div class="van-hairline--bottom pt-10 pb-20">
    <h1 class="text-14 text-primary font-bold van-padding-left">Тема</h1>
    <van-radio-group
      v-model="theme"
      direction="horizontal"
      shape="dot"
      class="w-full mt-20 pl-80 gap-40"
      @change="changeTheme"
    >
      <van-radio name="light">
        <div class="w-full flex gap-4 items-center pl-10">
          <Icon name="light_m" class="text-22" />
          <span>Светлая</span>
        </div>
      </van-radio>
      <van-radio name="dark">
        <div class="w-full flex gap-4 items-center pl-10">
          <Icon name="dark_m" class="text-22" />
          <span>Тёмная</span>
        </div>
      </van-radio>
    </van-radio-group>
  </div>
  <div class="van-hairline--bottom pt-20 pb-20">
    <h1 class="text-14 text-primary font-bold van-padding-left">
      Резервные копии
    </h1>
    <div class="van-padding flex justify-between mt-20 px-80">
      <FileOutput
        iconName="db-save"
        label="Создать резервную копию"
        :urlToSave="backupUrl"
        :fileName="backupName"
        :preparationReady="preparationReady"
        @click="preparePropsToSaveFile"
        @saveDialogLinkClicked="preparationReady = false"
      />
      <FileInput
        iconName="db-restore"
        label="Восстановить из резервной копии"
        @afterRead="restoreFromBackup"
      />
    </div>
  </div>
</template>
