import { LOCALE_META, type Locale } from "./locales";

export interface Formatters {
  money: (amount: number) => string;
  number: (value: number) => string;
  date: (iso: string) => string;
  dateTime: (iso: string) => string;
  time: (iso: string) => string;
  weekdayDate: (iso: string) => string;
}

/** Intl formatters for a locale. Amounts are Moroccan dirhams without decimals. */
export function createFormatters(locale: Locale): Formatters {
  const tag = LOCALE_META[locale].intl;
  const money = new Intl.NumberFormat(tag, { style: "currency", currency: "MAD", maximumFractionDigits: 0 });
  const number = new Intl.NumberFormat(tag);
  const date = new Intl.DateTimeFormat(tag, { day: "numeric", month: "short", year: "numeric" });
  const dateTime = new Intl.DateTimeFormat(tag, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  const time = new Intl.DateTimeFormat(tag, { hour: "2-digit", minute: "2-digit" });
  const weekdayDate = new Intl.DateTimeFormat(tag, { weekday: "short", day: "numeric", month: "short" });
  return {
    money: (amount) => money.format(amount),
    number: (value) => number.format(value),
    date: (iso) => date.format(new Date(iso)),
    dateTime: (iso) => dateTime.format(new Date(iso)),
    time: (iso) => time.format(new Date(iso)),
    weekdayDate: (iso) => weekdayDate.format(new Date(iso)),
  };
}

export function ageFrom(birthDate: string, now: Date = new Date()): number {
  const b = new Date(birthDate);
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age;
}
