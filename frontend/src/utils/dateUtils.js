import moment from 'moment';

export const formatDate = (date, format = 'MMM DD, YYYY') => {
  return moment(date).format(format);
};

export const formatDateTime = (date) => {
  return moment(date).format('MMM DD, YYYY HH:mm');
};

export const formatRelativeTime = (date) => {
  return moment(date).fromNow();
};

export const isOverdue = (date) => {
  return moment(date).isBefore(moment(), 'day');
};

export const isDueToday = (date) => {
  return moment(date).isSame(moment(), 'day');
};

export const isDueTomorrow = (date) => {
  return moment(date).isSame(moment().add(1, 'day'), 'day');
};

export const getDaysUntilDue = (date) => {
  return moment(date).diff(moment(), 'days');
};

export const getDateRange = (startDate, endDate) => {
  const start = moment(startDate);
  const end = moment(endDate);
  const duration = moment.duration(end.diff(start));
  
  return {
    days: Math.ceil(duration.asDays()),
    weeks: Math.ceil(duration.asWeeks()),
    months: Math.ceil(duration.asMonths())
  };
};

export const getProjectProgress = (startDate, endDate) => {
  const start = moment(startDate);
  const end = moment(endDate);
  const now = moment();
  
  if (now.isBefore(start)) return 0;
  if (now.isAfter(end)) return 100;
  
  const total = end.diff(start);
  const elapsed = now.diff(start);
  
  return Math.round((elapsed / total) * 100);
};

export const formatDuration = (hours) => {
  if (hours < 1) {
    return `${Math.round(hours * 60)}m`;
  } else if (hours < 24) {
    return `${Math.round(hours)}h`;
  } else {
    const days = Math.floor(hours / 24);
    const remainingHours = Math.round(hours % 24);
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  }
};

export const getWeekDates = (date = new Date()) => {
  const start = moment(date).startOf('week');
  const end = moment(date).endOf('week');
  
  const dates = [];
  let current = start.clone();
  
  while (current.isSameOrBefore(end)) {
    dates.push(current.clone());
    current.add(1, 'day');
  }
  
  return dates;
};

export const getMonthDates = (date = new Date()) => {
  const start = moment(date).startOf('month');
  const end = moment(date).endOf('month');
  
  const dates = [];
  let current = start.clone();
  
  while (current.isSameOrBefore(end)) {
    dates.push(current.clone());
    current.add(1, 'day');
  }
  
  return dates;
};
