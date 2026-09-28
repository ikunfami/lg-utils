import { isPhoneNumber } from './phone'
import type { FormatAmountOptions, FormatPhoneOptions } from './types'

/** 中文大写数字 */
const CN_DIGITS = '零壹贰叁肆伍陆柒捌玖'
/** 节内单位（个 / 拾 / 佰 / 仟） */
const CN_UNITS = ['', '拾', '佰', '仟']
/** 节单位（个级 / 万级 / 亿级） */
const CN_SECTION_UNITS = ['', '万', '亿']

/**
 * 解析为有限数字（字符串 / 数字入参），非法返回 null
 */
function toFiniteNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value.trim())
    return Number.isFinite(n) ? n : null
  }
  return null
}

/**
 * 手机号格式化（3-4-4 分段）
 *
 * 先按 `isPhoneNumber` 规则校验，非法手机号返回空串：
 * `'17612345210'` → `'176 1234 5210'`
 *
 * @param phone 手机号（字符串或数字）
 * @param options 格式化选项（separator 默认空格 `' '`）
 * @returns 分段格式化后的字符串
 */
export function formatPhone(phone: unknown, options: FormatPhoneOptions = {}): string {
  const separator = options.separator ?? ' '
  if (typeof phone !== 'string' && (typeof phone !== 'number' || !Number.isFinite(phone))) return ''
  const value = String(phone).trim()
  if (!isPhoneNumber(value)) return ''
  return value.slice(0, 3) + separator + value.slice(3, 7) + separator + value.slice(7)
}

/**
 * 金额千分位格式化
 *
 * `1234567.89` → `'1,234,567.89'`
 *
 * @param amount 金额（字符串或数字）
 * @param options 格式化选项（separator 默认 `','`，precision 小数位数四舍五入）
 * @returns 千分位格式化后的字符串；非法输入返回空串
 */
export function formatAmount(amount: unknown, options: FormatAmountOptions = {}): string {
  const separator = options.separator ?? ','
  const n = toFiniteNumber(amount)
  if (n === null || Math.abs(n) >= 1e21) return ''
  const fixed = options.precision !== undefined ? n.toFixed(options.precision) : String(n)
  const negative = fixed.startsWith('-')
  const body = negative ? fixed.slice(1) : fixed
  const dotIndex = body.indexOf('.')
  const intPart = dotIndex === -1 ? body : body.slice(0, dotIndex)
  const decPart = dotIndex === -1 ? '' : body.slice(dotIndex)
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator)
  return (negative ? '-' : '') + grouped + decPart
}

/**
 * 0-9999 转中文大写（节内零规则：中间连续的零只保留一个，末尾零省略）
 */
function sectionToChinese(section: number): string {
  let str = ''
  let unitIndex = 0
  let zeroPending = false
  while (section > 0) {
    const d = section % 10
    if (d === 0) {
      if (str !== '') zeroPending = true
    } else {
      if (zeroPending) {
        str = CN_DIGITS[0] + str
        zeroPending = false
      }
      str = CN_DIGITS[d] + CN_UNITS[unitIndex] + str
    }
    unitIndex++
    section = Math.floor(section / 10)
  }
  return str
}

/**
 * 金额转中文大写（人民币，报销 / 合同场景）
 *
 * - `1024` → `'壹仟零贰拾肆元整'`
 * - `1234.56` → `'壹仟贰佰叁拾肆元伍角陆分'`
 * - `0.5` → `'伍角整'`，`0.05` → `'伍分'`
 *
 * 支持到千亿级（`0 <= amount < 1e12`）；以「分」为单位的整数运算，避免浮点误差；
 * 负数 / 超出范围 / 非法输入返回空串。
 *
 * @param amount 金额（字符串或数字）
 * @returns 中文大写金额
 */
export function toChineseAmount(amount: unknown): string {
  const n = toFiniteNumber(amount)
  if (n === null || n < 0 || n >= 1e12) return ''

  // 以「分」为单位的整数运算，避免浮点误差
  const totalCents = Math.round(n * 100)
  const integer = Math.floor(totalCents / 100)
  const cents = totalCents % 100
  const jiao = Math.floor(cents / 10)
  const fen = cents % 10

  // 整数部分：按「万」分节，从高位到低位组装 censStr
  let intStr = ''
  if (integer > 0) {
    const sections: number[] = []
    let num = integer
    while (num > 0) {
      sections.push(num % 10000)
      num = Math.floor(num / 10000)
    }
    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i]
      if (section === 0) {
        // 中间空节：低位还有内容时补一个零
        if (intStr !== '' && i > 0 && !intStr.endsWith(CN_DIGITS[0])) {
          intStr += CN_DIGITS[0]
        }
        continue
      }
      // 本节不足 4 位（高位有零）且前面已有内容时补一个零
      if (intStr !== '' && section < 1000 && !intStr.endsWith(CN_DIGITS[0])) {
        intStr += CN_DIGITS[0]
      }
      intStr += sectionToChinese(section) + CN_SECTION_UNITS[i]
    }
    // 低位全为零时会在末尾多补一个零，截掉（中文大写数字不会以「零」结尾）
    if (intStr.endsWith(CN_DIGITS[0])) intStr = intStr.slice(0, -1)
  }

  // 小数部分（角 / 分）
  let decStr = ''
  if (jiao > 0) {
    decStr += CN_DIGITS[jiao] + '角'
    if (fen === 0) decStr += '整'
  }
  if (fen > 0) {
    if (jiao === 0 && integer > 0) decStr += CN_DIGITS[0]
    decStr += CN_DIGITS[fen] + '分'
  }

  if (integer === 0) {
    return decStr === '' ? '零元整' : decStr
  }
  if (cents === 0) return intStr + '元整'
  return intStr + '元' + decStr
}
