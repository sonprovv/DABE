const DOW = {
    SUNDAY: 8,
    MONDAY: 2,
    TUESDAY: 3,
    WEDNESDAY: 4,
    THURSDAY: 5,
    FRIDAY: 6,
    SATURDAY: 7,
}

const JS_TO_DOW = {
  0: "SUNDAY",
  1: "MONDAY",
  2: "TUESDAY",
  3: "WEDNESDAY",
  4: "THURSDAY",
  5: "FRIDAY",
  6: "SATURDAY",
};

const dayOfMonth = {
    1: 31,
    2: 28,
    3: 31,
    4: 30,
    5: 31,
    6: 30,
    7: 31,
    8: 31,
    9: 30,
    10: 31,
    11: 30,
    12: 31,
}

const getDate = (hour, minute, duration) => {

    const now = new Date();
    let day = now.getDate();
    let month = now.getMonth() + 1;
    let year = now.getFullYear();

    day += duration;
    if (day-dayOfMonth[month]>0) {
        day = day - dayOfMonth[month];
        month += 1;
        if (month>12) {
            year += 1;
            month = 1;
        }
    }

    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
}

const getStartAndEndTime = (startTime, listDays, time) => {
    const [hour, minute] = startTime.split(':').map(Number);
    
    let start = listDays[0], end = listDays[0];
    for (const date of listDays) {
        if (DOW[date]<DOW[start]) start = date;
        if (DOW[date]>DOW[end]) end = date;
    }

    const now = new Date();
    const thu = JS_TO_DOW[now.getDay()];

    const durationStart = DOW[start] - DOW[thu];
    const durationEnd = DOW[end] - DOW[thu];

    return { 
        startTime: getDate(hour, minute, durationStart), 
        endTime: getDate(hour+time, minute, durationEnd) 
    };
}

const formatDate = (date) => {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear().toString();

    return `${day}/${month}/${year}`;
}

const formatDateAndTime = (date) => {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear().toString();
    const hour = d.getHours().toString().padStart(2, '0');
    const minute = d.getMinutes().toString().padStart(2, '0');

    return `${hour}:${minute} ${day}/${month}/${year}`;
}

module.exports = { getStartAndEndTime, formatDate, formatDateAndTime };