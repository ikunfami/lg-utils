import { describe, expect, it } from 'vitest'
import { getIdCardInfo, isIdCard, maskIdCard } from '../src'

describe('isIdCard 身份证校验', () => {
  it('18 位全数字合法', () => {
    expect(isIdCard('411321199005123310')).toBe(true)
  })

  it('18 位末位为 X/x 合法', () => {
    expect(isIdCard('11010519491231002X')).toBe(true)
    expect(isIdCard('11010519491231002x')).toBe(true)
  })

  it('15 位全数字合法', () => {
    expect(isIdCard('110105491231002')).toBe(true)
  })

  it('长度不符不合法', () => {
    expect(isIdCard('41132119900512331')).toBe(false) // 17 位
    expect(isIdCard('4113211990051233100')).toBe(false) // 19 位
    expect(isIdCard('11010549123100')).toBe(false) // 14 位
    expect(isIdCard('1101054912310021')).toBe(false) // 16 位
  })

  it('字符集不符不合法', () => {
    expect(isIdCard('41132X199005123310')).toBe(false) // X 不在末位
    expect(isIdCard('41132119900512A310')).toBe(false) // 含字母
    expect(isIdCard('41132119900512331A')).toBe(false) // 末位仅允许数字或 X
    expect(isIdCard('11010549123100X')).toBe(false) // 15 位含字母
  })

  it('首尾空白自动忽略', () => {
    expect(isIdCard('  411321199005123310 ')).toBe(true)
  })

  it('非字符串不合法', () => {
    expect(isIdCard(undefined)).toBe(false)
    expect(isIdCard(null)).toBe(false)
    expect(isIdCard(411321199005123310)).toBe(false)
    expect(isIdCard('')).toBe(false)
  })
})

describe('getIdCardInfo 身份证信息读取', () => {
  it('18 位：读取出生日期与性别（男）', () => {
    // 第 17 位为 1（奇数）→ 男
    const info = getIdCardInfo('411321199005123310')
    expect(info).toEqual({
      birthYear: 1990,
      birthMonth: 5,
      birthDay: 12,
      birthDate: '1990-05-12',
      gender: 1,
      genderText: '男'
    })
  })

  it('18 位末位为 X：第 17 位偶数 → 女', () => {
    const info = getIdCardInfo('11010519491231002X')
    expect(info).toEqual({
      birthYear: 1949,
      birthMonth: 12,
      birthDay: 31,
      birthDate: '1949-12-31',
      gender: 2,
      genderText: '女'
    })
  })

  it('15 位：出生日期按 19xx 处理，末位偶数 → 女', () => {
    const info = getIdCardInfo('110105491231002')
    expect(info).toEqual({
      birthYear: 1949,
      birthMonth: 12,
      birthDay: 31,
      birthDate: '1949-12-31',
      gender: 2,
      genderText: '女'
    })
  })

  it('闰年生日合法', () => {
    const info = getIdCardInfo('411321200002290010')
    expect(info?.birthDate).toBe('2000-02-29')
  })

  it('出生日期不合法返回 null', () => {
    expect(getIdCardInfo('411321199013400010')).toBeNull() // 13 月
    expect(getIdCardInfo('411321199902290010')).toBeNull() // 平年 2 月 29 日
    expect(getIdCardInfo('411321199005321010')).toBeNull() // 5 月 32 日
  })

  it('非法身份证返回 null', () => {
    expect(getIdCardInfo('')).toBeNull()
    expect(getIdCardInfo('123')).toBeNull()
    expect(getIdCardInfo(undefined)).toBeNull()
    expect(getIdCardInfo(null)).toBeNull()
  })
})

describe('maskIdCard 身份证脱敏', () => {
  it('默认前 5 后 4', () => {
    expect(maskIdCard('411321199005122433')).toBe('41132*********2433')
    expect(maskIdCard('411321199005122433')).toHaveLength(18)
  })

  it('支持自定义前后保留位数与掩码字符', () => {
    expect(maskIdCard('411321199005122433', { front: 4, back: 4 })).toBe('4113**********2433')
    expect(maskIdCard('411321199005122433', { front: 6, back: 4, maskChar: '#' })).toBe(
      '411321########2433'
    )
  })

  it('15 位身份证同样适用', () => {
    expect(maskIdCard('110105491231002')).toBe('11010******1002')
  })

  it('长度小于等于前后保留位数时整体脱敏', () => {
    expect(maskIdCard('411322433')).toBe('*********') // 9 位 = 5 + 4
    expect(maskIdCard('2433')).toBe('****')
    expect(maskIdCard('24')).toBe('**')
  })

  it('支持传入数字（中间掩码按实际位数；18 位超安全整数范围会丢精度，建议传字符串）', () => {
    expect(maskIdCard(110105491231002)).toBe('11010******1002')
    expect(maskIdCard(110105491231002)).toHaveLength(15)
  })

  it('非有限数字 / 其他类型返回空串', () => {
    expect(maskIdCard(NaN)).toBe('')
    expect(maskIdCard(Infinity)).toBe('')
    expect(maskIdCard(undefined)).toBe('')
    expect(maskIdCard(null)).toBe('')
    expect(maskIdCard({})).toBe('')
  })

  it('首尾空白自动忽略', () => {
    expect(maskIdCard(' 411321199005122433 ')).toBe('41132*********2433')
  })
})
