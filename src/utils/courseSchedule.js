export const scheduleDayOptions = [
  { value: 'Mon', label: 'Mon' },
  { value: 'Tue', label: 'Tue' },
  { value: 'Wed', label: 'Wed' },
  { value: 'Thu', label: 'Thu' },
  { value: 'Fri', label: 'Fri' },
  { value: 'Sat', label: 'Sat' },
  { value: 'Sun', label: 'Sun' },
];

export const scheduleDateOptions = [
  { value: 'weekly', label: 'Repeats weekly' },
  { value: 'today', label: 'Today' },
  { value: 'tomorrow', label: 'Tomorrow' },
  { value: 'specific', label: 'Pick a date' },
];

export const scheduleHourOptions = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, '0'));
export const scheduleMinuteOptions = ['00', '15', '30', '45'];
export const schedulePeriodOptions = ['AM', 'PM'];

const addDays = (date, days) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
};

export const getDateInputValue = (date = new Date()) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
};

export const getScheduleDateForChoice = (choice) => {
  if (choice === 'today') return getDateInputValue(new Date());
  if (choice === 'tomorrow') return getDateInputValue(addDays(new Date(), 1));
  return '';
};

const normalizeHour = (value, fallback = '09') => {
  const hour = Number(value);

  if (!Number.isFinite(hour) || hour < 1 || hour > 12) {
    return fallback;
  }

  return String(hour).padStart(2, '0');
};

const normalizeMinute = (value, fallback = '00') => {
  const minute = String(value || fallback).padStart(2, '0');

  return scheduleMinuteOptions.includes(minute) ? minute : fallback;
};

const normalizePeriod = (value, fallback = 'AM') => {
  const period = String(value || fallback).toUpperCase();

  return schedulePeriodOptions.includes(period) ? period : fallback;
};

export const createCourseScheduleSlot = (slot = {}, index = 0) => ({
  clientId: slot.clientId || `schedule-${Date.now()}-${index}`,
  days: Array.isArray(slot.days) ? slot.days.filter((day) => scheduleDayOptions.some((option) => option.value === day)) : [],
  dateMode: slot.dateMode || 'weekly',
  date: slot.date || '',
  startHour: normalizeHour(slot.startHour, '09'),
  startMinute: normalizeMinute(slot.startMinute, '00'),
  startPeriod: normalizePeriod(slot.startPeriod, 'AM'),
  endHour: normalizeHour(slot.endHour, '10'),
  endMinute: normalizeMinute(slot.endMinute, '00'),
  endPeriod: normalizePeriod(slot.endPeriod, 'AM'),
  customLabel: slot.customLabel || '',
});

const parseScheduleDays = (text) => {
  const days = [];
  const source = String(text || '');
  const dayPattern = /\b(mon(?:day)?|tue(?:s|sday)?|wed(?:nesday)?|thu(?:rs|rsday)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?)\b/gi;
  const dayMap = {
    mon: 'Mon',
    monday: 'Mon',
    tue: 'Tue',
    tues: 'Tue',
    tuesday: 'Tue',
    wed: 'Wed',
    wednesday: 'Wed',
    thu: 'Thu',
    thurs: 'Thu',
    thursday: 'Thu',
    fri: 'Fri',
    friday: 'Fri',
    sat: 'Sat',
    saturday: 'Sat',
    sun: 'Sun',
    sunday: 'Sun',
  };

  for (const match of source.matchAll(dayPattern)) {
    const day = dayMap[match[0].toLowerCase()];

    if (day && !days.includes(day)) {
      days.push(day);
    }
  }

  if (days.length > 0) {
    return days;
  }

  const compactSource = source.replace(/\s+/g, '').toUpperCase();
  const compactPatterns = [
    { pattern: /MWF/, values: ['Mon', 'Wed', 'Fri'] },
    { pattern: /TTH|TUTH|TUETH/, values: ['Tue', 'Thu'] },
    { pattern: /MW/, values: ['Mon', 'Wed'] },
    { pattern: /TH/, values: ['Thu'] },
  ];

  compactPatterns.forEach(({ pattern, values }) => {
    if (pattern.test(compactSource)) {
      values.forEach((day) => {
        if (!days.includes(day)) {
          days.push(day);
        }
      });
    }
  });

  return days;
};

const parseScheduleDate = (text) => {
  return String(text || '').match(/\b\d{4}-\d{2}-\d{2}\b/)?.[0] || '';
};

const parseScheduleTimes = (text) => {
  const source = String(text || '');
  const rangeMatch = source.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?\s*(?:-|to)\s*(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i);

  if (rangeMatch) {
    const endPeriod = normalizePeriod(rangeMatch[6], 'AM');
    return {
      startHour: normalizeHour(rangeMatch[1]),
      startMinute: normalizeMinute(rangeMatch[2]),
      startPeriod: normalizePeriod(rangeMatch[3], endPeriod),
      endHour: normalizeHour(rangeMatch[4], '10'),
      endMinute: normalizeMinute(rangeMatch[5]),
      endPeriod,
      hasTime: true,
    };
  }

  const singleTimeMatch = source.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);

  if (singleTimeMatch) {
    return {
      startHour: normalizeHour(singleTimeMatch[1]),
      startMinute: normalizeMinute(singleTimeMatch[2]),
      startPeriod: normalizePeriod(singleTimeMatch[3]),
      hasTime: true,
    };
  }

  return { hasTime: false };
};

export const parseCourseSchedule = (schedule = '') => {
  const trimmedSchedule = String(schedule || '').trim();

  if (!trimmedSchedule) {
    return [createCourseScheduleSlot()];
  }

  return trimmedSchedule.split(';').map((entry, index) => {
    const text = entry.trim();
    const days = parseScheduleDays(text);
    const date = parseScheduleDate(text);
    const times = parseScheduleTimes(text);

    if (days.length === 0 && !date && !times.hasTime) {
      return createCourseScheduleSlot({ customLabel: text }, index);
    }

    return createCourseScheduleSlot({
      days,
      dateMode: date ? 'specific' : 'weekly',
      date,
      ...times,
    }, index);
  });
};

const formatTime = (row, prefix) => {
  const hour = Number(row[`${prefix}Hour`] || 0);
  const minute = row[`${prefix}Minute`] || '00';
  const period = row[`${prefix}Period`] || 'AM';

  return `${hour || 12}:${minute} ${period}`;
};

const formatScheduleDateLabel = (dateValue) => {
  if (!dateValue) return '';

  const date = new Date(`${dateValue}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const rowHasScheduleSelection = (row) => {
  return Boolean(row.days?.length || row.date || row.dateMode === 'today' || row.dateMode === 'tomorrow');
};

export const formatCourseSchedule = (rows = []) => {
  return rows
    .map((row) => {
      if (row.customLabel && !rowHasScheduleSelection(row)) {
        return row.customLabel;
      }

      if (!rowHasScheduleSelection(row)) {
        return '';
      }

      const days = Array.isArray(row.days) ? row.days.join(' ') : '';
      const date = row.dateMode === 'weekly' ? '' : row.date;
      const dateLabel = formatScheduleDateLabel(date);
      const scheduleLabel = [days, dateLabel].filter(Boolean).join(' ');
      const timeLabel = `${formatTime(row, 'start')} - ${formatTime(row, 'end')}`;

      return [scheduleLabel, timeLabel].filter(Boolean).join(', ');
    })
    .filter(Boolean)
    .join('; ');
};
