import { describe, expect, it } from 'vitest'
import { isPhoneNumber, maskPhone } from '../src'

describe('isPhoneNumber 手机号校验', () => {
  it('1 开头、11 位数字合法', () => {
    expect(isPhoneNumber('17612345210')).toBe(true)
    expect(isPhoneNumber('19912345210')).toBe(true)
    expect(isPhoneNumber('11111111111')).toBe(true)
  })

  it('非 1 开头不合法', () => {
    expect(isPhoneNumber('27612345210')).toBe(false)
    expect(isPhoneNumber('07612345210')).toBe(false)
  })

  it('长度不是 11 位不合法', () => {
    expect(isPhoneNumber('1761234521')).toBe(false) // 10 位
    expect(isPhoneNumber('176123452100')).toBe(false) // 12 位
    expect(isPhoneNumber('1')).toBe(false)
    expect(isPhoneNumber('')).toBe(false)
  })

  it('含非数字字符不合法', () => {
    expect(isPhoneNumber('1761234521a')).toBe(false)
    expect(isPhoneNumber('176 1234 5210')).toBe(false)
    expect(isPhoneNumber('+8617612345210')).toBe(false)
  })

  it('首尾空白自动忽略', () => {
    expect(isPhoneNumber(' 17612345210 ')).toBe(true)
  })

  it('非字符串不合法', () => {
    expect(isPhoneNumber(undefined)).toBe(false)
    expect(isPhoneNumber(null)).toBe(false)
    expect(isPhoneNumber(17612345210)).toBe(false)
  })
})

describe('maskPhone 手机号脱敏', () => {
  it('默认前 3 后 3', () => {
    expect(maskPhone('17612345210')).toBe('176*****210')
    expect(maskPhone('17612345210')).toHaveLength(11)
  })

  it('支持自定义前后保留位数与掩码字符', () => {
    expect(maskPhone('17612345210', { front: 3, back: 4 })).toBe('176****5210')
    expect(maskPhone('17612345210', { front: 4, back: 4 })).toBe('1761***5210')
    expect(maskPhone('17612345210', { front: 3, back: 3, maskChar: '#' })).toBe('176#####210')
  })

  it('长度小于等于前后保留位数时整体脱敏', () => {
    expect(maskPhone('176210')).toBe('******') // 6 位 = 3 + 3
    expect(maskPhone('176')).toBe('***')
    expect(maskPhone('17')).toBe('**')
  })

  it('支持传入数字（中间掩码按实际位数）', () => {
    expect(maskPhone(17612345210)).toBe('176*****210')
    expect(maskPhone(17612345210)).toHaveLength(11)
  })

  it('非有限数字 / 其他类型返回空串', () => {
    expect(maskPhone(NaN)).toBe('')
    expect(maskPhone(Infinity)).toBe('')
    expect(maskPhone(undefined)).toBe('')
    expect(maskPhone(null)).toBe('')
    expect(maskPhone({})).toBe('')
  })

  it('首尾空白自动忽略', () => {
    expect(maskPhone(' 17612345210 ')).toBe('176*****210')
  })
})
