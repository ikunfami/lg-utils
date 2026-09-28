import type { MaskOptions } from './types'

/** 手机号：以 1 开头，共 11 位数字 */
const PHONE = /^1\d{10}$/

/**
 * 校验手机号（校验开头为 1、长度 11 位，且全部为数字）
 *
 * @param phone 待校验的手机号
 * @returns 是否为合法手机号
 */
export function isPhoneNumber(phone: unknown): phone is string {
  if (typeof phone !== 'string') return false
  return PHONE.test(phone.trim())
}

/**
 * 手机号脱敏
 *
 * 默认保留前 3 位、后 3 位，中间按实际位数替换为等长掩码字符：
 * `17612345210` → `176*****210`（中间 5 位）
 *
 * 支持传入字符串或数字；长度小于等于「前保留 + 后保留」时整体脱敏；
 * 空串 / 非字符串数字返回空串。
 *
 * @param phone 手机号（字符串或数字）
 * @param options 脱敏选项（front 默认 3，back 默认 3，maskChar 默认 `'*'`）
 * @returns 脱敏后的字符串
 */
export function maskPhone(phone: unknown, options: MaskOptions = {}): string {
  const front = Math.max(0, Math.floor(options.front ?? 3))
  const back = Math.max(0, Math.floor(options.back ?? 3))
  const maskChar = options.maskChar ?? '*'
  const value =
    typeof phone === 'string' || (typeof phone === 'number' && Number.isFinite(phone))
      ? String(phone).trim()
      : ''
  const len = value.length
  if (len === 0) return ''
  if (len <= front + back) return maskChar.repeat(len)
  return value.slice(0, front) + maskChar.repeat(len - front - back) + value.slice(len - back)
}
