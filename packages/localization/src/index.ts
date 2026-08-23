export const fa = {
  common: {
    appName: 'نوابانک',
    loading: 'در حال بارگذاری...',
    error: 'خطا',
    success: 'موفق',
    cancel: 'انصراف',
    confirm: 'تایید',
    save: 'ذخیره',
    delete: 'حذف',
    edit: 'ویرایش',
    close: 'بستن',
  },
  currency: {
    toman: 'تومان',
    rial: 'ریال',
  },
  account: {
    accounts: 'حساب‌ها',
    balance: 'موجودی',
    type: 'نوع',
    cash: 'نقدی',
    bank: 'بانکی',
    wallet: 'کیف پول',
    credit: 'اعتباری',
  },
  bank: {
    banks: 'بانک‌ها',
    name: 'نام بانک',
  },
  auth: {
    login: 'ورود',
    register: 'ثبت نام',
    logout: 'خروج',
    phone: 'شماره موبایل',
    password: 'رمز عبور',
  },
};

export const en = {
  common: {
    appName: 'NovaBank',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
  },
  currency: {
    toman: 'Toman',
    rial: 'Rial',
  },
  account: {
    accounts: 'Accounts',
    balance: 'Balance',
    type: 'Type',
    cash: 'Cash',
    bank: 'Bank',
    wallet: 'Wallet',
    credit: 'Credit',
  },
  bank: {
    banks: 'Banks',
    name: 'Bank Name',
  },
  auth: {
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    phone: 'Phone',
    password: 'Password',
  },
};

export type Locale = 'fa' | 'en';
export type TranslationKeys = typeof fa;
