<script lang="ts">
  const hashtagInvalidRegExpString = '^_+|_(_)+|[^а-яёА-ЯЁ\\w_]'

  // Здесь важна последовательность замен. Поэтому массив.
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
    modelValue?: string[],
    error?: boolean,
  }>()

  const newHashtag = ref('')
  const cursorPosition = ref(0)
  const fieldElem = ref(null)
  const inputElem = ref(null)

  const getCursorPosition = () => inputElem.value.selectionStart

  const setCursorPosition = (newPosition: number) => {
    inputElem.value.setSelectionRange(newPosition, newPosition)
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
    }
  )

  const insertCharToStringWithHashtag = (char: string) => {
    let cursorPosition = getCursorPosition()
    const textBefore = newHashtag.value.substring(0, cursorPosition)
    const textAfter = newHashtag.value.substring(cursorPosition)

    return textBefore + char + textAfter
  }

  const onKeypress = async (event: KeyboardEvent) => {
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
    const isValid = !(new RegExp(hashtagInvalidRegExpString, 'g')).test(newHashtag)

    if(isValid) {
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

  const editHashtag = (index) => {
    newHashtag.value = props.modelValue[index]

    emit(
      'update:modelValue',
      [...props.modelValue.slice(0,index), ...props.modelValue.slice(index + 1)],
    )
  }

  const addHashtag = () => {
    const clearableNewHashtag = newHashtag.value.replaceAll(/_$/g, '')

    const newHashtags = [
      ...new Set(props.modelValue).add(clearableNewHashtag)
    ].sort()

    emit('update:modelValue', newHashtags)
    newHashtag.value = ''
  }

  onMounted(
    () => {
      inputElem.value = fieldElem.value.$el.querySelector('input')
    }
  )
</script>
<template>
  <div class="w-full flex flex-col">
    <div class="w-full min-h-20 flex flex-wrap van-padding-left">
      Хештеги:&nbsp;
      <template v-if="props.modelValue.length">
        <div
          v-for="hashtag, index in props.modelValue"
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
      <span v-else class="text-inactive">— добавьте хештеги, чтобы этот рецепт было легче искать.</span>
    </div>
    <div
      class="w-full flex items-center van-padding-left"
    >
      <Icon
        name="add-button"
        class="text-24 text-primary"
        :class="!newHashtag ? 'opacity-[0.5]' : 'cursor-pointer'"
        @click="addHashtag"
      />
      <van-field v-model="newHashtag" placeholder="#Добавить хештег"
        ref="fieldElem"
        @keypress.prevent="onKeypress"
      >
        <template #button>
          <Icon
            name="close-button"
            class="cursor-pointer text-24 text-primary"
            :class="!newHashtag ? 'opacity-[0.5]' : 'cursor-pointer'"
            @click="newHashtag = ''"
          />
        </template>
      </van-field>
    </div>
  </div>
</template>
