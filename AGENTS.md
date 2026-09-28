# AGENTS.md — lg-utils

## 项目简介

`lg-utils` 是一个兼容 **Vue2 / Vue3 / uni-app / 微信小程序原生** 的常用校验 / 脱敏工具插件。核心能力：

- 一套代码同时兼容 Vue2 / Vue3 / uni-app / 微信小程序原生（纯函数，无平台依赖，任何 JS 环境可直接引入）
- 身份证校验（15 / 18 位长度 + 字符集）、身份证信息读取（出生年月日、性别）
- 手机号校验（1 开头、11 位数字）
- 身份证脱敏（默认前 5 后 4）、手机号脱敏（默认前 3 后 3）、姓名脱敏（2 字脱尾、3 字脱中、4 字及以上脱后两位）
- 手机号 3-4-4 分段格式化、金额千分位格式化、金额转中文大写
- TypeScript 编写，输出 ESM / CJS / `.d.ts` 三种产物

## 常用命令

```bash
npm install          # 安装依赖
npm run build        # 类型检查(vue-tsc) + Vite 库模式构建 + terser 混淆 → dist/index.js (ESM) / dist/index.cjs (CJS) / dist/index.d.ts
npm test             # vitest + jsdom 运行 tests/ 下所有 *.test.ts（watch 模式）
npm run typecheck    # 仅类型检查
```

## 项目结构

```
src/
├── index.ts    # 入口：lgUtils 工具集合（冻结）+ LgUtilsPlugin 插件（install 兼容 Vue2/Vue3）+ useLgUtils() + 默认导出
├── idcard.ts   # isIdCard() / getIdCardInfo() / maskIdCard()（纯函数，不依赖 Vue）
├── phone.ts    # isPhoneNumber() / maskPhone()（纯函数，不依赖 Vue）
├── name.ts     # maskName()（纯函数，不依赖 Vue）
├── format.ts   # formatPhone() / formatAmount() / toChineseAmount()（纯函数，不依赖 Vue）
└── types.ts    # Gender / IdCardInfo / MaskOptions / NameMaskOptions / FormatPhoneOptions / FormatAmountOptions 类型定义
tests/
├── idcard.test.ts   # 身份证校验、信息读取、脱敏测试
├── phone.test.ts    # 手机号校验、脱敏测试
├── name.test.ts     # 姓名脱敏测试
└── format.test.ts   # 手机号 / 金额格式化、中文大写测试
```

## 关键设计约定（改动时必须遵守）

### 校验规则

- `isIdCard`：18 位 `/^\d{17}[\dXx]$/` 或 15 位 `/^\d{15}$/`（仅校验长度与字符集，**不校验 18 位校验位**）
- `isPhoneNumber`：`/^1\d{10}$/`（1 开头、11 位数字，不校验号段）
- 校验类函数入参为 `unknown`，非字符串一律返回 `false`

### 信息读取规则（getIdCardInfo）

- 18 位：第 7-14 位出生日期（YYYYMMDD），第 17 位奇数男、偶数女
- 15 位：第 7-12 位出生日期（YYMMDD），年份按 19xx 处理，末位奇数男、偶数女
- `gender` 返回数字：`1` = 男，`2` = 女（另提供 `genderText` 中文字符串 `'男' | '女'`）
- 出生日期用 `new Date` 回绕校验（含闰年），不合法返回 `null`；非法身份证返回 `null`

### 脱敏规则

- 中间掩码字符数 = 原长度 - 前保留 - 后保留，与原串**等长**（示例：`41132*********2433` 为 5 + 9 + 4 = 18 位）
- `maskIdCard` / `maskPhone` 入参支持字符串或数字（数字经 `String()` 转换后脱敏，`NaN` / `Infinity` 等非有限数字返回空串）；注意 18 位身份证超出 JS Number 安全整数范围，数字入参会丢精度，**身份证建议传字符串**
- `maskIdCard` 默认前 5 后 4；`maskPhone` 默认前 3 后 3；`maskChar` 默认 `'*'`；前后保留位数可配置
- 长度 ≤ 前保留 + 后保留 → 整体脱敏；空串 / 非字符串返回空串；输入自动 `trim()`
- `maskName` 规则：1 字整体脱敏，2 字脱尾数（`李*`），3 字脱中间（`张*丰`），4 字及以上脱后两位（`诸葛**`）；按 `Array.from` 切分 Unicode 字符
- 脱敏函数对任意字符串生效，**不前置校验**身份证 / 手机号合法性（容错风格，不抛错）

### 格式化规则

- `formatPhone`：先按 `isPhoneNumber` 校验，非法返回空串；默认空格 3-4-4 分段，分隔符可配
- `formatAmount`：千分位分组，支持负数、`precision` 小数位四舍五入；`|amount| >= 1e21`（JS 转字符串会走科学计数法）返回空串
- `toChineseAmount`：支持到千亿级（`0 <= amount < 1e12`），**以「分」为单位的整数运算**避免浮点误差；节间零规则：中间空节 / 节内高位有零时补且仅补一个「零」，结果不以「零」结尾；`0` → `零元整`，纯角/分时省略「元」（`0.5` → `伍角整`）

### 插件形态

- `LgUtilsPlugin.install`：Vue3 挂 `app.config.globalProperties.$lgUtils` + `provide('lgUtils')`；Vue2 挂 `Vue.prototype.$lgUtils`
- `useLgUtils()` 返回冻结的 `lgUtils` 单例对象（函数均为无状态纯函数）
- 非 Vue 环境直接 `import { isIdCard } from 'lg-utils'` 使用，无需 `app.use()`

## 编码约定

- TypeScript strict 模式；注释使用中文 JSDoc 风格
- 核心逻辑（`idcard.ts` / `phone.ts` / `name.ts`）不依赖 Vue，保持可独立测试
- `vue` 是 peerDependencies，禁止打包进产物（`vite.config.ts` 中 `external: ['vue']`）
- 所有函数容错风格：非字符串 / 空串 / 非法输入静默兜底（返回 `false` / `null` / `''`），**不抛错**

## 测试约定

- vitest + jsdom，测试文件放 `tests/*.test.ts`
- 修改校验规则、信息读取规则、脱敏规则后，必须确保 `tests/` 下全部测试通过

## 发布

- 版本号写在 `package.json`；`files` 仅包含 `dist`
- 构建产物：`dist/index.js`（ESM）、`dist/index.cjs`（CJS）、`dist/index.d.ts`（类型）
- 混淆：`build` 脚本最后一步用 terser CLI 压缩 `dist/index.js`（`--module`）和 `dist/index.cjs`（`-c drop_console=true,drop_debugger=true -m`）。注意：Vite 5 的 `minify: 'terser'` 不会处理 lib 模式的 ES 格式产物，因此必须走构建后脚本，勿改为 `minify: 'terser'` 了事
- License: MIT
