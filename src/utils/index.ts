import {format} from 'date-fns';
import {utcToZonedTime} from 'date-fns-tz';

export const formatJstDateString = (
  utcDate: Date,
  dateFormat: string = 'yyyy年MM月dd日 HH:mm'
): string => {
  const jstDate = utcToZonedTime(utcDate, 'Asia/Tokyo');
  return format(jstDate, dateFormat);
};
