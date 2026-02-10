/**
 * Internationalization configuration for DatePickerDialog
 */

export type Locale = 'zh-CN' | 'en-US';

export interface DatePickerI18n {
  confirm: string;
  cancel: string;
  yearSuffix: string;
  monthSuffix: string;
  daySuffix: string;
  monthNames?: string[]; // For English month names (optional)
}

export const defaultI18n: Record<Locale, DatePickerI18n> = {
  'zh-CN': {
    confirm: '确认',
    cancel: '取消',
    yearSuffix: '年',
    monthSuffix: '月',
    daySuffix: '日',
  },
  'en-US': {
    confirm: 'Confirm',
    cancel: 'Cancel',
    yearSuffix: '',
    monthSuffix: '',
    daySuffix: '',
    monthNames: [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ],
  },
};

export function getI18nConfig(locale: Locale = 'zh-CN'): DatePickerI18n {
  return defaultI18n[locale] || defaultI18n['zh-CN'];
}
