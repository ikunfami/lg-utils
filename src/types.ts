/** 性别（数字，1 = 男，2 = 女） */
export type Gender = 1 | 2

/** 身份证信息（getIdCardInfo 返回值） */
export interface IdCardInfo {
  /** 出生年份（4 位数字，15 位身份证按 19xx 处理） */
  birthYear: number
  /** 出生月份（1-12） */
  birthMonth: number
  /** 出生日（1-31） */
  birthDay: number
  /** 出生日期，格式 YYYY-MM-DD */
  birthDate: string
  /** 性别（数字，1 = 男，2 = 女） */
  gender: Gender
  /** 性别中文：男 / 女 */
  genderText: '男' | '女'
}

/** 脱敏选项（maskIdCard / maskPhone） */
export interface MaskOptions {
  /** 保留前几位，默认见各函数 */
  front?: number
  /** 保留后几位，默认见各函数 */
  back?: number
  /** 掩码字符，默认 `'*'` */
  maskChar?: string
}

/** 姓名脱敏选项（maskName） */
export interface NameMaskOptions {
  /** 掩码字符，默认 `'*'` */
  maskChar?: string
}

/** formatPhone 选项 */
export interface FormatPhoneOptions {
  /** 分段分隔符，默认 `' '`（空格） */
  separator?: string
}

/** formatAmount 选项 */
export interface FormatAmountOptions {
  /** 千分位分隔符，默认 `','` */
  separator?: string
  /** 小数位数（四舍五入），不填则保留原值 */
  precision?: number
}
