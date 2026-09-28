import type { NameMaskOptions } from './types'

/**
 * 姓名脱敏
 *
 * 默认规则（按字符数）：
 * - 1 字：整体脱敏，`*`
 * - 2 字：脱敏尾数，`李*`（李白）
 * - 3 字：脱敏中间，`张*丰`（张三丰）
 * - 4 字及以上：脱敏后两位，`诸葛**`（诸葛孔明）
 *
 * 空串 / 非字符串返回空串；按 Unicode 字符切分，兼容生僻字与emoji（视业务需要）。
 *
 * @param name 姓名
 * @param options 脱敏选项（maskChar 默认 `'*'`）
 * @returns 脱敏后的姓名
 */
export function maskName(name: unknown, options: NameMaskOptions = {}): string {
  const maskChar = options.maskChar ?? '*'
  if (typeof name !== 'string') return ''
  const chars = Array.from(name.trim())
  const len = chars.length
  if (len === 0) return ''
  if (len === 1) return maskChar
  if (len === 2) return chars[0] + maskChar
  if (len === 3) return chars[0] + maskChar + chars[2]
  return chars.slice(0, len - 2).join('') + maskChar + maskChar
}
