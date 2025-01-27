<script lang="ts">
  import type { Collection, IndexableType } from 'dexie'
  import { db } from '@/db'
  import type { AnyDbTable, AnyDbTableType } from '@/db'

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
  const emit = defineEmits(['focused', 'select', 'setUnaccepted'])

  const props = withDefaults(
    defineProps<{
      text?: string
      placeholder?: string
      error?: boolean
      dbTableName: AnyDbTable
      align?: 'left' | 'right'
      margin?: boolean
      keyName?: string
      showPopupOnFocus?: boolean

      // Массив уже введённых значений, которые не должны быть показаны
      // в списке выбора
      hiddenItemList?: string[]

      // При переходе в true переключает фокус страницы на поле ввода
      focusRequest?: boolean
    }>(),
    {
      placeholder: '',
      error: false,
      align: 'left',
      margin: false,
      keyName: 'name',
      showPopupOnFocus: false,
      hiddenItemList: [],
      focusRequest: false,
    },
  )

  const text = ref('')
  const fieldComponent = ref(null)
  const inputElem = ref(null)

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
        fieldComponent.value.focus()
      }
    },
  )

  const itemList = ref([] as { id?: number; name: string }[])
  const showPopupSelect = ref(false)
  const selectedItemIndex = ref(0)
  const focused = ref(false)

  const fieldEventHandler = async () => {
    let collection = db[props.dbTableName] as unknown as Collection<
      AnyDbTableType,
      IndexableType,
      AnyDbTableType
    >

    if (!props.showPopupOnFocus || text.value.length) {
      collection = collection
        .where(props.keyName)
        .startsWithIgnoreCase(text.value)
    }

    itemList.value = ((await collection.toArray()) ?? []).filter(
      (item) => !props.hiddenItemList.includes(item.name),
    )
  }

  watch(() => text.value, fieldEventHandler)

  const itemByTexFromItemList = computed(() => {
    return (itemList.value ?? []).find(
      (itemListItem) => itemListItem[props.keyName] === text.value,
    )
  })

  const acceptItem = async (item?: { id?: number; [key: string]: string }) => {
    if (props.hiddenItemList.includes(text.value)) {
      return
    }

    if (item) {
      emit('select', item)

      await nextTick()

      const textLength = item[props.keyName].length
      inputElem.value?.setSelectionRange(textLength, textLength)

      onFocus()
      return
    }

    const payload = itemByTexFromItemList.value ?? {
      [props.keyName]: text.value,
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
    }, [])

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
          text.value = props.text
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
    inputElem.value = fieldComponent.value.$el.querySelector('input')
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
    </div>

    <div
      v-if="
        itemList.length &&
        (text || props.showPopupOnFocus) &&
        focused &&
        !accepted
      "
      :class="popupClass"
    >
      <div
        v-for="(item, index) in itemList ?? []"
        class="w-full cursor-pointer hover:bg-gray-3"
        :class="{ 'bg-gray-4': index === selectedItemIndex }"
        @click="acceptItem(item)"
      >
        {{ item[props.keyName] }}
      </div>
    </div>
  </div>
</template>
