import {formatInTimeZone} from 'date-fns-tz';

export const formatJstDateString = (
  utcDate: Date,
  dateFormat: string = 'yyyy年MM月dd日 HH:mm'
): string => {
  return formatInTimeZone(utcDate, 'Asia/Tokyo', dateFormat);
};

export const nonNullable = <T>(value: T | undefined | null): value is NonNullable<T> => {
  return value !== null && value !== undefined;
};
