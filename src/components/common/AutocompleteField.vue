<script lang="ts">
  import type { Collection, IndexableType } from 'dexie'
  import { db } from '@/db'
  import type { IdNameTable, IdNameTableType } from '@/db'

  // const movingKeys = ['ArrowRight', 'ArrowLeft', 'Home', 'End']

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
  const emit = defineEmits(['focused', 'select', 'setUnaccepted', 'cleared'])

  const props = withDefaults(
    defineProps<{
      text?: string
      placeholder?: string
      error?: boolean
      dbTableName: IdNameTable
      align?: 'left' | 'right'
      margin?: boolean
      showPopupOnFocus?: boolean

      // Массив уже введённых значений, которые не должны быть показаны
      // в списке выбора
      hiddenItemList?: string[]

      // При переходе в true переключает фокус страницы на поле ввода
      focusRequest?: boolean
      cleaning?: boolean
    }>(),
    {
      placeholder: '',
      error: false,
      align: 'left',
      margin: false,
      showPopupOnFocus: false,
      hiddenItemList: () => [],
      focusRequest: false,
      cleaning: false,
    },
  )

  const text = ref('')
  const fieldComponent = ref<ComponentPublicInstance<HTMLInputElement>>()
  const inputElem = ref<HTMLInputElement>()

  watch(
    () => props.cleaning,
    () => {
      if (props.cleaning) {
        text.value = ''
        emit('cleared')
      }
    },
  )

  watch(
    () => props.text,
    () => {
      text.value = props.text ?? ''
    },
  )

  watch(
    () => props.focusRequest,
    (newFocusRequest, oldFocusRequest) => {
      if (newFocusRequest && newFocusRequest !== oldFocusRequest) {
        emit('focused')
        fieldComponent.value?.focus()
      }
    },
  )

  const itemList = ref([] as { id?: number; name: string }[])
  const selectedItemIndex = ref(0)
  const focused = ref(false)

  const fieldEventHandler = async () => {
    let request = db[props.dbTableName]

    let collectionRequest = null as Collection<
      IdNameTableType,
      IndexableType,
      IdNameTableType
    > | null

    if (!props.showPopupOnFocus || text.value.length) {
      collectionRequest = request.where('name').startsWithIgnoreCase(text.value)
    }

    itemList.value = (
      (await (collectionRequest ?? request).toArray()) ?? []
    ).filter((item) => !props.hiddenItemList.includes(item.name))
  }

  watch(() => text.value, fieldEventHandler)

  const itemByTexFromItemList = computed(() => {
    return (itemList.value ?? []).find(
      (itemListItem) => itemListItem['name'] === text.value,
    )
  })

  const acceptItem = async (item?: { id?: number; name: string }) => {
    if (props.hiddenItemList.includes(text.value)) {
      return
    }

    if (item) {
      emit('select', item)

      await nextTick()

      const textLength = item['name'].length
      inputElem.value?.setSelectionRange(textLength, textLength)

      onFocus()
      return
    }

    const payload = itemByTexFromItemList.value ?? {
      ['name']: text.value,
    }

    emit('select', payload)
  }

  const onFocus = async () => {
    focused.value = true
    await fieldEventHandler()
  }

  const onBlur = async () => {
    const itemListLocale = itemList.value.reduce((result, item) => {
      result.push(item['name'])

      return result
    }, [] as string[])

    if (itemListLocale.includes(text.value)) {
      acceptItem()
    }

    setTimeout(() => {
      focused.value = false
    }, 200)
  }

  const onKeydown = (event: KeyboardEvent) => {
    const code = event.code

    if (listItemControlKeys.includes(code)) {
      event.preventDefault()

      switch (code) {
        case 'Escape':
          text.value = props.text ?? ''
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
            itemList.value?.length &&
            selectedItemIndex.value < itemList.value.length - 1
          ) {
            selectedItemIndex.value++
          }

          break
        case 'Enter':
          if (selectedItemIndex.value >= 0) {
            acceptItem(itemList.value[selectedItemIndex.value])
          } else {
            acceptItem()
          }
      }
    }
  }

  const accepted = computed(
    () => !!text.value.length && text.value === props.text,
  )

  watch(
    () => accepted.value,
    (newAcceptedValue, oldAcceptedValue) => {
      if (oldAcceptedValue && !newAcceptedValue) {
        emit('setUnaccepted')
      }
    },
  )

  const popupClass = computed(() => {
    let popupClass =
      'absolute top-0 mt-40 max-h-300 min-w-200 ' +
      'border-solid border-1 border-inactive rounded-4 bg-white ' +
      'flex flex-col z-10 text-14 px-10 py-4 overflow-y-scroll '

    popupClass += props.align + '-0'
    popupClass += !!props.margin ? ' van-margin-' + props.align : ''

    return popupClass
  })

  onMounted(() => {
    inputElem.value = fieldComponent.value?.$el.querySelector('input')
  })
</script>
<template>
  <div class="relative">
    <div class="relative">
      <van-field
        ref="fieldComponent"
        v-model="text"
        :placeholder="props.placeholder"
        :error="!accepted && !focused && !!text"
        class="p-0 relative"
        @focus="onFocus"
        @blur="onBlur"
        @keydown="onKeydown"
      />
      <Icon
        v-if="accepted"
        name="ok"
        class="text-24 text-primary absolute right-2 top-0"
      />
      <div
        v-if="
          itemList.length &&
          (text || props.showPopupOnFocus) &&
          focused &&
          !accepted
        "
        class="absolute top-0 mt-28 z-10 p-6 popup-card"
        :class="props.align === 'left' ? 'left-0' : 'right-0'"
      >
        <div
          v-for="(item, index) in itemList ?? []"
          class="w-full cursor-pointer popup"
          :class="{ 'popup-line-select': index === selectedItemIndex }"
          @click="acceptItem(item)"
        >
          {{ item['name'] }}
        </div>
      </div>
    </div>
  </div>
</template>
<style>
  .popup-card {
    background-color: var(--van-white);
    border: 1px solid var(--van-gray-6);
    border-radius: 4px;
  }

  .van-theme-dark .popup-card {
    background-color: var(--van-dark);
    border: 1px solid var(--van-gray-6);
  }

  .popup:hover {
    background-color: var(--van-gray-3);
  }

  .van-theme-dark .popup:hover {
    background-color: var(--van-gray-8);
  }

  .popup-line-select {
    background-color: var(--van-gray-4);
  }

  .van-theme-dark .popup-line-select {
    background-color: var(--van-gray-10);
  }
</style>
