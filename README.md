# lg-utils

兼容 **Vue2 / Vue3 / uni-app / 微信小程序原生** 的常用校验 / 脱敏工具插件：身份证校验与信息读取、手机号校验、身份证 / 手机号 / 姓名脱敏。

核心能力：

- 一套代码同时兼容 Vue2 / Vue3 / uni-app / 微信小程序原生（纯函数，无平台依赖，任何 JS 环境可用）
- 身份证校验（15 / 18 位长度 + 字符集）、身份证信息读取（出生年月日、性别）
- 手机号校验（1 开头、11 位数字）
- 身份证脱敏（默认前 5 后 4）、手机号脱敏（默认前 3 后 3）、姓名脱敏（2 字脱尾、3 字脱中、4 字及以上脱后两位）
- 手机号 3-4-4 分段格式化、金额千分位格式化、金额转中文大写
- TypeScript 编写，输出 ESM / CJS / `.d.ts` 三种产物

## 安装

```bash
npm install lg-utils-js
```

## 快速上手

### Vue3

```js
import { createApp } from 'vue'
import LgUtilsPlugin from 'lg-utils'

const app = createApp(App)
app.use(LgUtilsPlugin)

// 组件内
app.component('MyComponent', {
  template: `<div>{{ $lgUtils.maskPhone('17612345210') }}</div>` // 176*****210
})
```

```vue
<script setup>
import { useLgUtils } from 'lg-utils'

const { isIdCard, maskIdCard } = useLgUtils()
maskIdCard('411321199005122433') // 41132*********2433
</script>
```

### Vue2

```js
import Vue from 'vue'
import LgUtilsPlugin from 'lg-utils'

Vue.use(LgUtilsPlugin)

// 任意组件内
this.$lgUtils.maskName('张三丰') // 张*丰
```

### uni-app / 微信小程序原生 / Node（非 Vue 环境）

纯函数，无需 `app.use()`，直接引入使用：

```js
import { isPhoneNumber, maskName } from 'lg-utils'

isPhoneNumber('17612345210') // true
maskName('诸葛孔明') // 诸葛**
```

## API

### 身份证

| 方法 | 说明 | 示例 |
| --- | --- | --- |
| `isIdCard(id)` | 校验身份证号码：18 位（前 17 位数字 + 末位数字或 X/x）或 15 位（全数字） | `isIdCard('411321199005122433')` → `true` |
| `getIdCardInfo(id)` | 读取出生日期与性别；15 位年份按 19xx 处理，出生日期不合法（如 2 月 30 日）返回 `null` | 见下 |
| `maskIdCard(id, options?)` | 脱敏，默认前 5 后 4，中间掩码按实际位数等长替换；支持字符串 / 数字入参（18 位数字超 JS 安全整数范围会丢精度，建议传字符串） | `maskIdCard('411321199005122433')` → `41132*********2433` |

`getIdCardInfo` 返回值（`IdCardInfo`）：

```ts
{
  birthYear: 1990,      // 出生年份
  birthMonth: 5,        // 出生月份
  birthDay: 12,         // 出生日
  birthDate: '1990-05-12', // 出生日期 YYYY-MM-DD
  gender: 1,            // 1 = 男，2 = 女
  genderText: '男'       // '男' | '女'
}
```

```js
getIdCardInfo('11010519491231002X')
// { birthYear: 1949, birthMonth: 12, birthDay: 31, birthDate: '1949-12-31', gender: 2, genderText: '女' }
```

`maskIdCard` 选项（`MaskOptions`）：

| 选项 | 默认值 | 说明 |
| --- | --- | --- |
| `front` | `5` | 保留前几位 |
| `back` | `4` | 保留后几位 |
| `maskChar` | `'*'` | 掩码字符 |

长度小于等于「前保留 + 后保留」时整体脱敏；空串 / 非字符串返回空串。

### 手机号

| 方法 | 说明 | 示例 |
| --- | --- | --- |
| `isPhoneNumber(phone)` | 校验手机号：1 开头、11 位数字 | `isPhoneNumber('17612345210')` → `true` |
| `maskPhone(phone, options?)` | 脱敏，默认前 3 后 3，中间掩码按实际位数等长替换；支持字符串 / 数字入参 | `maskPhone('17612345210')` → `176*****210` |

`maskPhone` 选项同 `maskIdCard`（`front` / `back` 默认均为 `3`）。

### 格式化

| 方法 | 说明 | 示例 |
| --- | --- | --- |
| `formatPhone(phone, options?)` | 手机号 3-4-4 分段（先校验合法性，非法返回空串） | `formatPhone('17612345210')` → `176 1234 5210` |
| `formatAmount(amount, options?)` | 金额千分位格式化 | `formatAmount(1234567.89)` → `1,234,567.89` |
| `toChineseAmount(amount)` | 金额转中文大写（报销 / 合同场景） | `toChineseAmount(1234.56)` → `壹仟贰佰叁拾肆元伍角陆分` |

`formatPhone` 选项：`separator`（分段分隔符，默认空格）。

`formatAmount` 选项（`FormatAmountOptions`）：

| 选项 | 默认值 | 说明 |
| --- | --- | --- |
| `separator` | `','` | 千分位分隔符 |
| `precision` | 不填保留原值 | 小数位数（四舍五入） |

`toChineseAmount`：

- 支持到千亿级（`0 <= amount < 1e12`），以「分」为单位的整数运算避免浮点误差
- 整角规则：`0.5` → `伍角整`，`1.05` → `壹元零伍分`，无小数 → `壹仟零贰拾肆元整`
- 负数 / 超出范围 / 非法输入返回空串

### 姓名

| 方法 | 说明 | 示例 |
| --- | --- | --- |
| `maskName(name, options?)` | 按字数脱敏 | 见下 |

默认规则（`maskChar` 默认 `'*'`）：

- 1 字：整体脱敏，`李` → `*`
- 2 字：脱敏尾数，`李白` → `李*`
- 3 字：脱敏中间，`张三丰` → `张*丰`
- 4 字及以上：脱敏后两位，`诸葛孔明` → `诸葛**`

## 开发

```bash
npm install          # 安装依赖
npm run build        # 类型检查(vue-tsc) + Vite 库模式构建 + terser 混淆 → dist/index.js (ESM) / dist/index.cjs (CJS) / dist/index.d.ts
npm test             # vitest + jsdom 运行 tests/ 下所有 *.test.ts（watch 模式）
npm run typecheck    # 仅类型检查
```
