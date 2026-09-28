import { getIdCardInfo, isIdCard, maskIdCard } from './idcard'
import { formatAmount, formatPhone, toChineseAmount } from './format'
import { maskName } from './name'
import { isPhoneNumber, maskPhone } from './phone'

/**
 * 工具集合：纯函数、无状态，可直接在任意环境（Vue / 小程序原生 / Node）使用
 */
export const lgUtils = Object.freeze({
  isIdCard,
  getIdCardInfo,
  maskIdCard,
  isPhoneNumber,
  maskPhone,
  maskName,
  formatPhone,
  formatAmount,
  toChineseAmount
})

export type LgUtils = typeof lgUtils

/**
 * Vue 插件对象，兼容 Vue2 与 Vue3
 *
 * Vue3: app.use(LgUtils) → app.config.globalProperties.$lgUtils + provide('lgUtils')
 * Vue2: Vue.use(LgUtils) → Vue.prototype.$lgUtils
 */
export const LgUtilsPlugin = {
  install(app: any) {
    if (app && app.config && app.config.globalProperties) {
      // Vue3
      app.config.globalProperties.$lgUtils = lgUtils
      if (typeof app.provide === 'function') {
        app.provide('lgUtils', lgUtils)
      }
    } else if (app && app.prototype) {
      // Vue2
      app.prototype.$lgUtils = lgUtils
    }
  }
}

/**
 * 组合式 API：获取工具集合
 *
 * 工具函数均为无状态纯函数，直接返回共享的 lgUtils 对象
 */
export function useLgUtils(): LgUtils {
  return lgUtils
}

export { getIdCardInfo, isIdCard, maskIdCard } from './idcard'
export { formatAmount, formatPhone, toChineseAmount } from './format'
export { maskName } from './name'
export { isPhoneNumber, maskPhone } from './phone'
export type {
  FormatAmountOptions,
  FormatPhoneOptions,
  Gender,
  IdCardInfo,
  MaskOptions,
  NameMaskOptions
} from './types'

export default LgUtilsPlugin
