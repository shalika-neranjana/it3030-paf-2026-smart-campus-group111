export const isTimeValid = (startTime, endTime) => {
  if (!startTime || !endTime) return false;
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);
  return end > start;
};

export const formatBookingStatus = (status) => {
  return status.charAt(0) + status.slice(1).toLowerCase();
};
