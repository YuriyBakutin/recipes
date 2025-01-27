<script lang="ts">
  import { INameWithId } from '@/types/IIngredientInRecipeItem'

  const hashtagInvalidRegExpString = '^_+|_(_)+|[^а-яёА-ЯЁ\\w_]'

  // NOTE: Здесь важна последовательность замен. Поэтому массив.
  const replacement = [
    [' ', '_'],
    ['_(_)+', '_'],
    [hashtagInvalidRegExpString, ''],
  ]

  let keypressEvent = false
  let watchEvent = false
</script>
<script lang="ts" setup>
  const emit = defineEmits(['update:modelValue'])

  const props = defineProps<{
    modelValue?: INameWithId[]
    editing: boolean
    error?: boolean
  }>()

  const newHashtagName = ref('')
  const cursorPosition = ref(0)
  const fieldComponent = ref(null)
  const inputElem = ref(null)
  const hashtags = computed(() => props.modelValue ?? [])
  const hashtagsLength = computed(() => hashtags.value.length)

  const getCursorPosition = () => inputElem.value?.selectionStart

  const setCursorPosition = (newPosition: number) => {
    inputElem.value?.setSelectionRange(newPosition, newPosition)
  }

  // Обработчик события вставки из буфера обмена
  watch(
    () => newHashtagName.value,
    async () => {
      await nextTick()

      if (keypressEvent) {
        // Если изменения newHashtagName вызваны вводом с клавиатуры, уходим
        keypressEvent = false

        return
      }

      if (watchEvent) {
        // Если этот обработчик запущен из-за изменений в newHashtagName, которые
        // он сам только что сделал, уходим.
        // Флаг watchEvent снимается только после всех изменений,
        // сделанных самим обработчиком, + ждём nextTick().
        return
      }

      watchEvent = true

      let replaced = newHashtagName.value

      for (const fromToCouple of replacement) {
        const partFrom = fromToCouple[0]
        const partTo = fromToCouple[1]
        replaced = replaced.replaceAll(new RegExp(partFrom, 'g'), partTo)
      }

      if (replaced === newHashtagName.value) {
        watchEvent = false

        return
      }

      newHashtagName.value = replaced
      await nextTick()
      setCursorPosition(newHashtagName.value.length)
      await nextTick()

      watchEvent = false
    },
    { immediate: true },
  )

  const insertCharToStringWithHashtag = (char: string) => {
    let cursorPosition = getCursorPosition()
    const textBefore = newHashtagName.value.substring(0, cursorPosition)
    const textAfter = newHashtagName.value.substring(cursorPosition)

    return textBefore + char + textAfter
  }

  const onKeypress = async (event: KeyboardEvent) => {
    if (!inputElem.value) {
      inputElem.value = fieldComponent.value.$el.querySelector('input')
    }

    keypressEvent = true // Признак для блокировки watch newHashtagName
    let char = event.key

    if (char === 'Enter') {
      addHashtag()

      return
    }

    if (char.length > 1) {
      return
    }

    if (char === ' ') {
      char = '_'
    }

    const newHashtagName = insertCharToStringWithHashtag(char)

    const isValid = !new RegExp(hashtagInvalidRegExpString, 'g').test(
      newHashtagName,
    )

    if (isValid) {
      await acceptChar(char)
    }
  }

  const acceptChar = async (char: string) => {
    let cursorPosition = getCursorPosition()
    const textBefore = newHashtagName.value.substring(0, cursorPosition)
    const textAfter = newHashtagName.value.substring(cursorPosition)
    newHashtagName.value = textBefore + char + textAfter
    await nextTick()
    setCursorPosition(++cursorPosition)
  }

  const editHashtag = (index: number) => {
    if (!props.editing) {
      return
    }

    keypressEvent = true
    newHashtagName.value = hashtags.value[index].name + ''

    const newHashtagList = [
      ...hashtags.value.slice(0, index),
      ...hashtags.value.slice(index + 1),
    ]

    emit('update:modelValue', newHashtagList)
  }

  const addHashtag = () => {
    if (!newHashtagName.value) {
      return
    }
    const preparedNewHashtagName = newHashtagName.value.replaceAll(/_$/g, '')

    const alreadyAvailable = new Set(
      hashtags.value.map((item) => item.name),
    ).has(preparedNewHashtagName)

    if (alreadyAvailable) {
      return
    }

    const newHashtags = [...hashtags.value]
    newHashtags.push({ name: preparedNewHashtagName })
    newHashtags.sort((a, b) => a.name.localeCompare(b.name))

    emit('update:modelValue', newHashtags)
    newHashtagName.value = ''
  }
</script>
<template>
  <div class="w-full flex flex-col">
    <div class="w-full min-h-20 flex flex-wrap van-padding-left">
      <span class="font-bold text-primary">Хештеги:&nbsp;</span>
      <div v-if="!!props.modelValue.length">
        <div
          v-for="(hashtag, index) in props.modelValue"
          :key="hashtag.name"
          class="italic"
          :class="{ 'cursor-pointer': props.editing }"
          @click.stop.prevent="editHashtag(index)"
        >
          #{{ hashtag.name }},
        </div>
      </div>
      <span v-else-if="props.error" class="text-error">
        — добавьте хештеги.
      </span>
      <span v-else class="text-inactive"
        >— добавьте хештеги, чтобы этот рецепт потом было легче найти.</span
      >
    </div>
    <div v-if="editing" class="w-full flex items-center van-padding-left">
      <Icon
        name="save-up"
        :clickable="!!newHashtagName"
        class="text-24"
        :class="!newHashtagName ? 'text-inactive' : 'text-primary'"
        @click="addHashtag"
      />
      <div class="relative w-full">
        <van-field
          ref="fieldComponent"
          v-model="newHashtagName"
          placeholder="#Добавить хештег"
          @keypress.prevent="onKeypress"
        />
        <Icon
          name="close"
          :clickable="!!newHashtagName"
          class="absolute right-0 top-0 bottom-0 text-24 align-middle van-padding-right"
          :class="!newHashtagName ? 'text-inactive' : 'text-primary'"
          @click="newHashtagName = ''"
        />
      </div>
    </div>
  </div>
</template>
