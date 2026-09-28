import type { Gender, IdCardInfo, MaskOptions } from './types'

/** 18 位身份证：前 17 位数字 + 末位数字或 X（不校验校验位，仅校验长度与字符集） */
const ID_CARD_18 = /^\d{17}[\dXx]$/
/** 15 位身份证：全数字 */
const ID_CARD_15 = /^\d{15}$/

/**
 * 校验身份证号码（校验长度：15 位或 18 位，并校验字符集）
 *
 * - 18 位：前 17 位为数字，末位为数字或 X/x
 * - 15 位：全数字
 *
 * @param id 待校验的身份证号码
 * @returns 是否为合法长度 / 字符集的身份证号码
 */
export function isIdCard(id: unknown): id is string {
  if (typeof id !== 'string') return false
  const value = id.trim()
  return ID_CARD_18.test(value) || ID_CARD_15.test(value)
}

/**
 * 从身份证号读取出生日期与性别
 *
 * - 18 位：第 7-14 位为出生日期（YYYYMMDD），第 17 位奇数为男、偶数为女
 * - 15 位：第 7-12 位为出生日期（YYMMDD，年份按 19xx 处理），末位奇数为男、偶数为女
 * - 出生日期不合法（如 2 月 30 日）时返回 `null`
 *
 * @param id 身份证号码
 * @returns 身份证信息；不合法时返回 `null`
 */
export function getIdCardInfo(id: unknown): IdCardInfo | null {
  if (typeof id !== 'string') return null
  const value = id.trim()

  let year: number
  let month: number
  let day: number
  let genderDigit: number

  if (ID_CARD_18.test(value)) {
    year = Number(value.slice(6, 10))
    month = Number(value.slice(10, 12))
    day = Number(value.slice(12, 14))
    genderDigit = Number(value.charAt(16))
  } else if (ID_CARD_15.test(value)) {
    year = 1900 + Number(value.slice(6, 8))
    month = Number(value.slice(8, 10))
    day = Number(value.slice(10, 12))
    genderDigit = Number(value.charAt(14))
  } else {
    return null
  }

  // 出生日期合法性校验（含闰年，如 2000-02-29 合法、1900-02-29 不合法）
  const date = new Date(year, month - 1, day)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }

  const gender: Gender = genderDigit % 2 === 1 ? 1 : 2
  const pad = (n: number) => String(n).padStart(2, '0')

  return {
    birthYear: year,
    birthMonth: month,
    birthDay: day,
    birthDate: `${year}-${pad(month)}-${pad(day)}`,
    gender,
    genderText: gender === 1 ? '男' : '女'
  }
}

/**
 * 身份证号码脱敏
 *
 * 默认保留前 5 位、后 4 位，中间按实际位数替换为等长掩码字符：
 * `411321199005122433` → `41132*********2433`（中间 9 位）
 *
 * 支持传入字符串或数字；长度小于等于「前保留 + 后保留」时整体脱敏；
 * 空串 / 非字符串数字返回空串。
 *
 * @param id 身份证号码（字符串或数字）
 * @param options 脱敏选项（front 默认 5，back 默认 4，maskChar 默认 `'*'`）
 * @returns 脱敏后的字符串
 */
export function maskIdCard(id: unknown, options: MaskOptions = {}): string {
  const front = Math.max(0, Math.floor(options.front ?? 5))
  const back = Math.max(0, Math.floor(options.back ?? 4))
  const maskChar = options.maskChar ?? '*'
  const value =
    typeof id === 'string' || (typeof id === 'number' && Number.isFinite(id)) ? String(id).trim() : ''
  const len = value.length
  if (len === 0) return ''
  if (len <= front + back) return maskChar.repeat(len)
  return value.slice(0, front) + maskChar.repeat(len - front - back) + value.slice(len - back)
}
