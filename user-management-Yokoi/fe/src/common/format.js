// 日付フォーマット
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
};

//日付フォーマット
export const formatDate2 = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 日付、曜日フォーマット
export const formatTopDate = (now) => {
  const weekday = ['日', '月', '火', '水', '木', '金', '土'];
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const dayOfWeek = weekday[now.getDay()];
  return `${year}/${month}/${day} ${dayOfWeek}`;
};

//時間フォーマット
export const formatTime = (now) => {
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

//時間フォーマット
export const formatTime2 = (date) => {
  return date.toTimeString().split(' ')[0].slice(0, 5);
};

//15分繰り上げる
export const roundUpToQuarterHour = (timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;
  const roundedMinutes = Math.ceil(totalMinutes / 15) * 15;
  const roundedHours = Math.floor(roundedMinutes / 60).toString().padStart(2, '0');
  const roundedMins = (roundedMinutes % 60).toString().padStart(2, '0');
  return `${roundedHours}:${roundedMins}`;
};  

//退勤時間を15分切り捨て
export const roundDownToQuarterHour = (timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;
  const roundedMinutes = Math.floor(totalMinutes / 15) * 15;
  const roundedHours = Math.floor(roundedMinutes / 60).toString().padStart(2, '0');
  const roundedMins = (roundedMinutes % 60).toString().padStart(2, '0');
  return `${roundedHours}:${roundedMins}`;
};  

//出勤時間と退勤時間の比較
export const calculateWorkHours = (checkInDate, checkInTime, checkOutDate, checkOutTime) => {
  const checkIn = new Date(`${checkInDate}T${checkInTime}`);
  const checkOut = new Date(`${checkOutDate}T${checkOutTime}`);

  if (checkOut < checkIn) {
    checkOut.setDate(checkOut.getDate() + 1);
  }

  const isValidDate = (date) => date instanceof Date && !isNaN(date);
  if (!isValidDate(checkIn) || !isValidDate(checkOut)) {
    return '00:00';
  }

  const diff = checkOut - checkIn;
  const hours = Math.floor(diff / 1000 / 60 / 60).toString().padStart(2, '0');
  const minutes = Math.floor((diff / 1000 / 60) % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

//総勤務時間から休憩時間を引く
export const calculateNetWorkHours = (totalWorkTime, breakTime) => {
  const totalWork = new Date(`1970-01-01T${totalWorkTime}`);
  const breakPeriod = new Date(`1970-01-01T${breakTime}`);

  const isValidDate = (date) => date instanceof Date && !isNaN(date);
  if (!isValidDate(totalWork) || !isValidDate(breakPeriod)) {
    return '00:00';
  }

  const diff = totalWork - breakPeriod;
  const hours = Math.floor(diff / 1000 / 60 / 60).toString().padStart(2, '0');
  const minutes = Math.floor((diff / 1000 / 60) % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};