import { describe, expect, it } from 'vitest'
import { formatAmount, formatPhone, toChineseAmount } from '../src'

describe('formatPhone 手机号格式化', () => {
  it('默认空格 3-4-4 分段', () => {
    expect(formatPhone('17612345210')).toBe('176 1234 5210')
  })

  it('支持数字入参', () => {
    expect(formatPhone(17612345210)).toBe('176 1234 5210')
  })

  it('支持自定义分隔符', () => {
    expect(formatPhone('17612345210', { separator: '-' })).toBe('176-1234-5210')
  })

  it('非法手机号返回空串', () => {
    expect(formatPhone('1761234521')).toBe('')
    expect(formatPhone('27612345210')).toBe('')
    expect(formatPhone('')).toBe('')
    expect(formatPhone(undefined)).toBe('')
    expect(formatPhone(null)).toBe('')
  })
})

describe('formatAmount 金额千分位格式化', () => {
  it('基本千分位', () => {
    expect(formatAmount(1234567.89)).toBe('1,234,567.89')
    expect(formatAmount(123456789)).toBe('123,456,789')
    expect(formatAmount('1234.5')).toBe('1,234.5')
    expect(formatAmount(0.5)).toBe('0.5')
    expect(formatAmount(0)).toBe('0')
  })

  it('支持负数', () => {
    expect(formatAmount(-1234.5)).toBe('-1,234.5')
  })

  it('自定义分隔符', () => {
    expect(formatAmount(1234567, { separator: '_' })).toBe('1_234_567')
  })

  it('指定小数位数（四舍五入）', () => {
    expect(formatAmount(1234.567, { precision: 2 })).toBe('1,234.57')
    expect(formatAmount(1234.5, { precision: 0 })).toBe('1,235')
    expect(formatAmount(1234.5, { precision: 2 })).toBe('1,234.50')
  })

  it('非法输入返回空串', () => {
    expect(formatAmount('abc')).toBe('')
    expect(formatAmount('')).toBe('')
    expect(formatAmount(NaN)).toBe('')
    expect(formatAmount(undefined)).toBe('')
    expect(formatAmount(null)).toBe('')
  })
})

describe('toChineseAmount 金额转中文大写', () => {
  it('整数', () => {
    expect(toChineseAmount(0)).toBe('零元整')
    expect(toChineseAmount(1)).toBe('壹元整')
    expect(toChineseAmount(10)).toBe('壹拾元整')
    expect(toChineseAmount(1024)).toBe('壹仟零贰拾肆元整')
    expect(toChineseAmount(1002)).toBe('壹仟零贰元整')
    expect(toChineseAmount(100000000)).toBe('壹亿元整')
    expect(toChineseAmount(100200000)).toBe('壹亿零贰拾万元整')
  })

  it('大数（到千亿级）', () => {
    expect(toChineseAmount(123456789)).toBe('壹亿贰仟叁佰肆拾伍万陆仟柒佰捌拾玖元整')
    expect(toChineseAmount(100020003)).toBe('壹亿零贰万零叁元整')
    expect(toChineseAmount(100000001)).toBe('壹亿零壹元整')
  })

  it('小数（角 / 分）', () => {
    expect(toChineseAmount(1234.56)).toBe('壹仟贰佰叁拾肆元伍角陆分')
    expect(toChineseAmount(1.5)).toBe('壹元伍角整')
    expect(toChineseAmount(1.05)).toBe('壹元零伍分')
    expect(toChineseAmount(0.5)).toBe('伍角整')
    expect(toChineseAmount(0.05)).toBe('伍分')
    expect(toChineseAmount(0.55)).toBe('伍角伍分')
  })

  it('支持字符串数字入参', () => {
    expect(toChineseAmount('1234.56')).toBe('壹仟贰佰叁拾肆元伍角陆分')
  })

  it('负数 / 超范围 / 非法输入返回空串', () => {
    expect(toChineseAmount(-1)).toBe('')
    expect(toChineseAmount(1e12)).toBe('')
    expect(toChineseAmount('abc')).toBe('')
    expect(toChineseAmount('')).toBe('')
    expect(toChineseAmount(NaN)).toBe('')
    expect(toChineseAmount(undefined)).toBe('')
    expect(toChineseAmount(null)).toBe('')
  })
})
