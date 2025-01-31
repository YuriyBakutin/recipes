export enum Colors {

  black = '#000000',
  white = '#ffffff',
  'gray-1' = '#f7f8fa',
  'gray-2' = '#f2f3f5',
  'gray-3' = '#ebedf0',
  'gray-4' = '#dcdee0',
  'gray-5' = '#c8c9cc',
  'gray-6' = '#969799',
  'gray-7' = '#646566',
  'gray-8' = '#323233',
  'gray-9' = '#1c1c1c',
  'gray-10' = '#4b4b4b',
  'red-1' = '#ee0a24',
  'red-2' = '#960617',
  'brown-1' = '#850000',
  'orange-1' = '#fffbe8',
  'orange-2' = '#ff976a',
  'orange-3' = '#ed6a0c',
  'orange-4' = '#ffe5cc',
  'yellow-1' = '#ffd01e',
  'yellow-2' = '#bc9700',
  'yellow-3' = '#e59b4f',
  'green-1' = '#4e9a06',
  'green-2' = '#07c160',
  'blue-1' = '#1989fa',

  dark = Colors['gray-9'],
  light = Colors.white,

  orange = Colors['orange-2'],
  'orange-light' = Colors['orange-1'],
  'orange-dark' = Colors['orange-3'],
  green = Colors['green-2'],
  blue = Colors['blue-1'],

  primary = Colors['brown-1'],
  'primary-light' = Colors['yellow-3'],
  attention = Colors['red-1'],
  error = Colors['red-1'],
  warning = Colors['yellow-2'],
  approval = Colors['green-1'],
  inactive = Colors['gray-7'],

  'primary-color' = Colors['brown-1'],
  'attention-color' = Colors['red-1'],
  'warning-color' = Colors['yellow-2'],
  'approval-color' = Colors['green-1'],
  'inactive-color' = Colors['gray-7'],
}

/* Colors from node_modules/vant/lib/index.css
  --van-black: #000;
  --van-white: #fff;
  --van-gray-1: #f7f8fa;
  --van-gray-2: #f2f3f5;
  --van-gray-3: #ebedf0;
  --van-gray-4: #dcdee0;
  --van-gray-5: #c8c9cc;
  --van-gray-6: #969799;
  --van-gray-7: #646566;
  --van-gray-8: #323233;
  --van-red: #ee0a24;
  --van-blue: #1989fa;
  --van-orange: #ff976a;
  --van-orange-dark: #ed6a0c;
  --van-orange-light: #fffbe8;
  --van-green: #07c160;
  --van-gradient-red: linear-gradient(to right, #ff6034, #ee0a24);
  --van-gradient-orange: linear-gradient(to right, #ffd01e, #ff8917);
  --van-primary-color: var(--van-blue);
  --van-success-color: var(--van-green);
  --van-danger-color: var(--van-red);
  --van-warning-color: var(--van-orange);
  --van-text-color: var(--van-gray-8);
  --van-text-color-2: var(--van-gray-6);
  --van-text-color-3: var(--van-gray-5);
  --van-active-color: var(--van-gray-2);
  --van-active-opacity: .6;
  --van-disabled-opacity: .5;
  --van-background: var(--van-gray-1);
  --van-background-2: var(--van-white);
  --van-background-3: var(--van-white);

*/

export const colorsInit = () => {
  for (const colorName in Colors) {
    const colorNameTsKey = colorName as keyof typeof Colors
    const cssConstName = `--van-${colorName}`
    document.documentElement.style.setProperty(cssConstName, Colors[colorNameTsKey])
  }
}
