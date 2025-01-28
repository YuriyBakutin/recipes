<script lang="ts">
  import { db } from '@/db'
  import { INameWithId } from '@/types/IIngredientInRecipeItem'
  import localeCompareNames from '@/helpers/localeCompareNames'

  const hashtagInvalidRegExpString = '^_+|_(_)+|[^а-яёА-ЯЁ\\w_]'

  // NOTE: Здесь важна последовательность замен. Поэтому массив.
  const replacement = [
    [' ', '_'],
    ['_(_)+', '_'],
    [hashtagInvalidRegExpString, ''],
  ]

  let keypressEvent = false
  let watchEvent = false

  const listItemControlKeys = [
    'ArrowUp',
    'ArrowDown',
    'PageUp',
    'PageDown',
    'Enter',
    'Escape',
  ]
</script>
<script lang="ts" setup>
  const emit = defineEmits(['update:modelValue', 'cleared'])

  const props = withDefaults(
    defineProps<{
      modelValue?: INameWithId[]
      title?: string
      placeholder?: string
      editing: boolean
      error?: boolean
      cleaning?: boolean
      availableOnly?: boolean
    }>(),
    {
      title: 'Хештеги:',
      placeholder:
        '— добавьте хештеги, чтобы этот рецепт потом было легче найти.',
      error: false,
      cleaning: false,
      availableOnly: false,
    },
  )

  const newHashtagName = ref('')

  watch(
    () => props.cleaning,
    () => {
      if (props.cleaning) {
        newHashtagName.value = ''
        emit('cleared')
      }
    },
  )

  const cursorPosition = ref(0)
  const fieldComponent = ref(null)
  const inputElem = ref(null)
  const hashtagsLength = computed(() => hashtags.value.length)
  const focused = ref(false)
  const hashtagPopupList = ref([] as string[])
  const selectedItemIndex = ref(0)
  const enablePopup = ref(true)

  const hashtags = computed(() => {
    const hashtags = [...props.modelValue]
    hashtags.sort(localeCompareNames)

    return hashtags
  })

  const error = computed(
    () =>
      props.availableOnly &&
      !hashtagPopupList.value.length &&
      !!newHashtagName.value,
  )

  const onBlur = async () => {
    setTimeout(() => {
      focused.value = false
      enablePopup.value = true
    }, 200)
  }

  const getCursorPosition = () => inputElem.value?.selectionStart

  const setCursorPosition = (newPosition: number) => {
    inputElem.value?.setSelectionRange(newPosition, newPosition)
  }

  // Обработчик события вставки из буфера обмена
  watch(
    () => newHashtagName.value,
    async () => {
      const result = await Promise.all([
        db.hashtags
          .where('name')
          .startsWithIgnoreCase(newHashtagName.value)
          .toArray(),
        nextTick(),
      ])
      // Заранее неясно, что раньше отработает — перестройка DOM
      // или обращение в базу. Поэтому оба под общим Promise.all

      const selectedHashtagNames = props.modelValue.map((item) => item.name)

      hashtagPopupList.value = (result[0] ?? [])
        .map((item) => item.name)
        .filter((item) => !selectedHashtagNames.includes(item))

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
      await addHashtag()

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

  const addHashtag = async () => {
    await nextTick()

    if (!newHashtagName.value || error.value) {
      return
    }

    enablePopup.value = true
    const preparedNewHashtagName = newHashtagName.value.replaceAll(/_$/g, '')

    const alreadyAvailable = new Set(
      hashtags.value.map((item) => item.name),
    ).has(preparedNewHashtagName)

    if (alreadyAvailable) {
      return
    }

    const newHashtags = [...hashtags.value]
    newHashtags.push({ name: preparedNewHashtagName })
    newHashtags.sort(localeCompareNames)

    emit('update:modelValue', newHashtags)
    newHashtagName.value = ''
  }

  const acceptItem = async (item) => {
    newHashtagName.value = item
    await addHashtag()
  }

  const onKeydown = async (event: KeyboardEvent) => {
    const code = event.code

    if (listItemControlKeys.includes(code)) {
      event.preventDefault()

      switch (code) {
        case 'Escape':
          enablePopup.value = !enablePopup.value
          break
        case 'PageUp':
        case 'PageDown':
          // TODO Здесь для выпадающего списка
          // должна быть перемотка на один вьюпорт
          break
        case 'ArrowUp':
          if (selectedItemIndex.value > 0) {
            selectedItemIndex.value--
          }

          break
        case 'ArrowDown':
          if (
            hashtagPopupList.value?.length &&
            selectedItemIndex.value < hashtagPopupList.value.length - 1
          ) {
            selectedItemIndex.value++
          }

          break
        case 'Enter':
          if (hashtagPopupList.value?.length && enablePopup.value) {
            newHashtagName.value =
              hashtagPopupList.value[selectedItemIndex.value]
            await addHashtag()
          } else {
            await addHashtag()
          }
      }
    }
  }
</script>
<template>
  <div class="w-full flex flex-col">
    <div class="w-full min-h-20 flex flex-wrap van-padding-left">
      <span class="font-bold text-primary">{{ props.title }}&nbsp;</span>
      <template v-if="!!hashtags.length">
        <div
          v-for="(hashtag, index) in hashtags"
          :key="hashtag.name"
          class="italic"
          :class="{ 'cursor-pointer': props.editing }"
          @click.stop.prevent="editHashtag(index)"
        >
          #{{ hashtag.name }},&nbsp;
        </div>
      </template>
      <span v-else-if="props.error" class="text-error">
        — добавьте хештеги.
      </span>
      <span v-else class="text-inactive">
        {{ placeholder }}
      </span>
    </div>
    <div v-if="editing" class="w-full flex items-center van-padding-left">
      <Icon
        name="save-up"
        :clickable="!!newHashtagName"
        class="text-24"
        :class="
          !newHashtagName ? 'opacity-[0.5] text-inactive' : 'text-primary'
        "
        @click="addHashtag"
      />
      <div class="relative w-full">
        <van-field
          ref="fieldComponent"
          v-model="newHashtagName"
          placeholder="#Добавить хештег"
          :error="error"
          @keypress.prevent="onKeypress"
          @keydown="onKeydown"
          @focus="focused = true"
          @blur="onBlur"
        />
        <Icon
          name="close"
          :clickable="!!newHashtagName"
          class="absolute right-0 top-0 bottom-0 text-24 align-middle van-padding-right"
          :class="
            !newHashtagName ? 'opacity-[0.5] text-inactive' : 'text-primary'
          "
          @click="newHashtagName = ''"
        />

        <div
          v-if="
            hashtagPopupList.length && newHashtagName && focused && enablePopup
          "
          :class="
            'absolute top-0 left-0 mt-40 max-h-300 min-w-200 ' +
            'border-solid border-1 border-inactive rounded-4 bg-white ' +
            'flex flex-col z-10 text-14 px-10 py-4 overflow-y-scroll van-margin-left'
          "
        >
          <div
            v-for="(item, index) in hashtagPopupList ?? []"
            class="w-full cursor-pointer hover:bg-gray-3"
            :class="{ 'bg-gray-4': index === selectedItemIndex }"
            @click="acceptItem(item)"
          >
            {{ item }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
