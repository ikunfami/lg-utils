import { describe, expect, it } from 'vitest'
import { maskName } from '../src'

describe('maskName 姓名脱敏', () => {
  it('1 字：整体脱敏', () => {
    expect(maskName('李')).toBe('*')
  })

  it('2 字：脱敏尾数', () => {
    expect(maskName('李白')).toBe('李*')
  })

  it('3 字：脱敏中间', () => {
    expect(maskName('张三丰')).toBe('张*丰')
  })

  it('4 字：脱敏后两位', () => {
    expect(maskName('诸葛孔明')).toBe('诸葛**')
  })

  it('5 字及以上：脱敏后两位', () => {
    expect(maskName('西门吹雪侠')).toBe('西门吹**')
    expect(maskName('西门吹雪大侠')).toBe('西门吹雪**')
  })

  it('支持自定义掩码字符', () => {
    expect(maskName('张三丰', { maskChar: '#' })).toBe('张#丰')
    expect(maskName('诸葛孔明', { maskChar: '×' })).toBe('诸葛××')
  })

  it('首尾空白自动忽略', () => {
    expect(maskName(' 张三丰 ')).toBe('张*丰')
  })

  it('空串 / 非字符串返回空串', () => {
    expect(maskName('')).toBe('')
    expect(maskName('   ')).toBe('')
    expect(maskName(undefined)).toBe('')
    expect(maskName(null)).toBe('')
  })
})
