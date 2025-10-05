import dayjs from 'dayjs';

export const formatDate = (value: string) => dayjs(value).format('DD MMM YYYY');
export const addDays = (value: string, days: number) => dayjs(value).add(days, 'day').format('YYYY-MM-DD');
export const todayIso = () => dayjs().format('YYYY-MM-DD');
