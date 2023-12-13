import moment from 'moment';
import { v4 } from 'uuid';

export const rgbToHex = (r: number, g: number, b: number): string => {
    function valueToHex(c: number) {
        var hex = c.toString(16);
        if (hex.length === 1) hex = `0${hex}`;
        return hex.toUpperCase();
    }
    return valueToHex(r) + valueToHex(g) + valueToHex(b);
};

export const sleep = (ms: number): Promise<Function> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

export const isEnglish = (str: string): boolean => {
    // const englishReg: RegExp = /^[a-zA-Z]+$/;
    // return englishReg.test(str);

    const englishCount = (str.match(/[a-zA-Z]/g) || []).length;
    return (englishCount / str.length) * 100 > 80 ? true : false;
};

export const isChinese = (str: string): boolean => {
    const chineseReg: RegExp = /[\u4e00-\u9fa5]/;
    return chineseReg.test(str);
};

export const isSameDay = (date1: string, date2: string): boolean => {
    return new Date(date1).toDateString() === new Date(date2).toDateString();
};
export const getDays = (start_date: string, end_date: string | number): any[] => {
    const startTime = moment.utc(start_date);
    const endTime = moment.utc(end_date);

    let days: any[] = [];

    while (startTime.isBefore(endTime)) {
        const firstDay = startTime.startOf('day');
        if (days.length > 0) {
            days[days.length - 1].end = firstDay.toISOString();
        }
        days.push({ from: firstDay.toISOString() });
        startTime.add(1, 'day');
    }
    days[days.length - 1].end = moment.utc(end_date).endOf('day').toISOString();
    return days;
};

export const startDateFromWeek = (_date: any) => {
    const year = Number(_date.split('_')[0]),
        week = Number(_date.split('_')[1]);
    const date = new Date(year, 0, 1);
    const daysUntilTargetWeek = (week - 1) * 7 - date.getDay() + 1;
    date.setDate(date.getDate() + daysUntilTargetWeek);
    return date;
};

export const getWeeks = (start_date: string, end_date: string | number): any[] => {
    const startTime = moment.utc(start_date);
    const endTime = moment.utc(end_date);

    let weeks: any[] = [];

    while (startTime.isBefore(endTime)) {
        const firstDayOfWeek = startTime.startOf('week');
        const firstDayOfWeekMidnight = firstDayOfWeek.startOf('day');
        if (weeks.length > 0) {
            weeks[weeks.length - 1].end = firstDayOfWeekMidnight.toISOString();
        }
        weeks.push({ from: firstDayOfWeekMidnight.toISOString() });
        startTime.add(1, 'week');
    }
    weeks[weeks.length - 1].end = moment.utc(end_date).endOf('week').endOf('day').toISOString();
    return weeks;
};

export const getMonths = (start_date: string, end_date: string | number): any[] => {
    const startTime = moment.utc(start_date);
    const endTime = moment.utc(end_date);

    let months: any[] = [];

    while (startTime.isBefore(endTime)) {
        const firstDayOfMonth = startTime.startOf('month');
        const firstDayOfMonthMidnight = firstDayOfMonth.startOf('day');
        if (months.length > 0) {
            months[months.length - 1].end = firstDayOfMonthMidnight.toISOString();
        }
        months.push({ from: firstDayOfMonthMidnight.toISOString() });
        startTime.add(1, 'month');
    }
    months[months.length - 1].end = moment.utc(end_date).endOf('month').endOf('day').toISOString();
    return months;
};

export const onlyNumber = (val: any) => {
    return String(val).replace(/[^\d]/g, '');
};

export const uuid = () => {
    return v4().replace(/-/g, '');
};

export const capitalize = (str: string) => {
    if (str && typeof str === 'string') {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
    return '';
};
