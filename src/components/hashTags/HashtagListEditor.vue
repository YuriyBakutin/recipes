<script lang="ts">
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
    modelValue?: string[]
    editing: boolean
    error?: boolean
  }>()

  const newHashtag = ref('')
  const cursorPosition = ref(0)
  const fieldComponent = ref(null)
  const inputElem = ref(null)

  const getCursorPosition = () => inputElem.value?.selectionStart

  const setCursorPosition = (newPosition: number) => {
    inputElem.value?.setSelectionRange(newPosition, newPosition)
  }

  // Обработчик события вставки из буфера обмена
  watch(
    () => newHashtag.value,
    async () => {
      await nextTick()

      if (keypressEvent) {
        // Если изменения newHashtag вызваны вводом с клавиатуры, уходим
        keypressEvent = false

        return
      }

      if (watchEvent) {
        // Если этот обработчик запущен из-за изменений в newHashtag, которые
        // он сам только что сделал, уходим.
        // Флаг watchEvent снимается только после всех изменений,
        // сделанных самим обработчиком, + ждём nextTick().
        return
      }

      watchEvent = true

      let replaced = newHashtag.value

      for (const fromToCouple of replacement) {
        const partFrom = fromToCouple[0]
        const partTo = fromToCouple[1]
        replaced = replaced.replaceAll(new RegExp(partFrom, 'g'), partTo)
      }

      if (replaced === newHashtag.value) {
        watchEvent = false

        return
      }

      newHashtag.value = replaced
      await nextTick()
      setCursorPosition(newHashtag.value.length)
      await nextTick()

      watchEvent = false
    },
    { immediate: true },
  )

  const insertCharToStringWithHashtag = (char: string) => {
    let cursorPosition = getCursorPosition()
    const textBefore = newHashtag.value.substring(0, cursorPosition)
    const textAfter = newHashtag.value.substring(cursorPosition)

    return textBefore + char + textAfter
  }

  const onKeypress = async (event: KeyboardEvent) => {
    if (!inputElem.value) {
      inputElem.value = fieldComponent.value.$el.querySelector('input')
    }

    keypressEvent = true // Признак для блокировки watch newHashtag
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

    const newHashtag = insertCharToStringWithHashtag(char)
    const isValid = !new RegExp(hashtagInvalidRegExpString, 'g').test(
      newHashtag,
    )

    if (isValid) {
      await acceptChar(char)
    }
  }

  const acceptChar = async (char: string) => {
    let cursorPosition = getCursorPosition()
    const textBefore = newHashtag.value.substring(0, cursorPosition)
    const textAfter = newHashtag.value.substring(cursorPosition)
    newHashtag.value = textBefore + char + textAfter
    await nextTick()
    setCursorPosition(++cursorPosition)
  }

  const editHashtag = (index: number) => {
    const hashtagList = props.modelValue as string[]

    keypressEvent = true
    const selectedHashtag = hashtagList[index] + ''
    newHashtag.value = selectedHashtag

    const newHashtagList = [
      ...hashtagList.slice(0, index),
      ...hashtagList.slice(index + 1),
    ]

    emit('update:modelValue', newHashtagList)
  }

  const addHashtag = () => {
    if (!newHashtag.value) {
      return
    }
    const clearableNewHashtag = newHashtag.value.replaceAll(/_$/g, '')

    const newHashtags = [
      ...new Set(props.modelValue).add(clearableNewHashtag),
    ].sort()

    emit('update:modelValue', newHashtags)
    newHashtag.value = ''
  }
</script>
<template>
  <div class="w-full flex flex-col">
    <div class="w-full min-h-20 flex flex-wrap van-padding-left">
      <span class="font-bold text-primary">Хештеги:&nbsp;</span>
      <template v-if="props.modelValue?.length">
        <div
          v-for="(hashtag, index) in props.modelValue"
          :key="hashtag"
          class="italic cursor-pointer"
          @click.stop.prevent="editHashtag(index)"
        >
          #{{ hashtag }},
        </div>
      </template>
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
        :clickable="!!newHashtag"
        class="text-24"
        :class="!newHashtag ? 'opacity-[0.5] text-inactive' : 'text-primary'"
        @click="addHashtag"
      />
      <div class="relative w-full">
        <van-field
          v-model="newHashtag"
          ref="fieldComponent"
          placeholder="#Добавить хештег"
          @keypress.prevent="onKeypress"
        />
        <Icon
          name="close"
          :clickable="!!newHashtag"
          class="absolute right-0 top-0 bottom-0 text-24 align-middle van-padding-right"
          :class="!newHashtag ? 'opacity-[0.5] text-inactive' : 'text-primary'"
          @click="newHashtag = ''"
        />
      </div>
    </div>
  </div>
</template>
