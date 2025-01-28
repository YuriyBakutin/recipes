/** @type {import("tailwindcss").Config} */
import { Colors } from './src/data/Colors'

const UNIT = 'px'

const SPACING_START = 0
const SPACING_END = 1000

const FONT_SIZES_START = 8
const FONT_SIZES_END = 40

const LINE_HEIGHT_SPACE = 4

const LINE_HEIGHT_START = 8
const LINE_HEIGHT_END = 60

const BORDER_RADIUSES_START = 1
const BORDER_RADIUSES_END = 60

const BORDER_WIDTH_START = 0
const BORDER_WIDTH_END = 10

const createRange = (start, end) => {
  const spacings = {}

  for (let i = start; i <= end; i++) {
    spacings[i] = i + UNIT
  }

  return spacings
}

function createFontSizes() {
  const sizes = {}

  for (let i = FONT_SIZES_START; i <= FONT_SIZES_END; i++) {
    const lineHeight = i + LINE_HEIGHT_SPACE + UNIT
    const fontSize = i + UNIT

    sizes[i] = [fontSize, lineHeight]
  }

  return sizes
}

export default {
  content: ['./src/**/*.vue'],
  theme: {
    extend: {
      spacing: { ...createRange(SPACING_START, SPACING_END) },

      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'mono': ['Roboto Mono', 'monospace']
      },
      colors: { ...Colors },
      boxShadow: {
        'normal': '0 0 12px rgba(118, 118, 118, 0.67)',
      },
    },
    fontSize: {
      0: [0, 0],
      ...createFontSizes(),
    },
    lineHeight: { ...createRange(LINE_HEIGHT_START, LINE_HEIGHT_END) },
    borderWidth: {
      default: '1px',
      ...createRange(BORDER_WIDTH_START, BORDER_WIDTH_END),
    },
    borderRadius: {
      0: '0',
      ...createRange(BORDER_RADIUSES_START, BORDER_RADIUSES_END),
      full: '1000px',
    },
  },
}

