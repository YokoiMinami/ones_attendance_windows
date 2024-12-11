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

//時間をhh:mm形式でフォーマット
export const attendanceFormatTime = (timeString) => {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':');
  const formattedHours = hours ? hours.padStart(2, '0') : '';
  const formattedMinutes = minutes ? minutes.padStart(2, '0') : '';
  return `${formattedHours}:${formattedMinutes}`;
};

//分単位を時間にフォーマット
export const convertMinutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60).toString().padStart(2, '0');
  const mins = Math.floor(minutes % 60).toString().padStart(2, '0');
  return `${hours}:${mins}`;
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

//総勤務時間
export const totalWorkHours = (start, end) => {
  const startDate = new Date(`1970-01-01T${start}`);
  const endDate = new Date(`1970-01-01T${end}`);

  // 退勤時間が出勤時間よりも前の場合、日付が変わったと見なす 
  if (endDate < startDate) { 
    endDate.setDate(endDate.getDate() + 1); 
  }

  const diff = endDate - startDate;
  const hours = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');;
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');;
  return `${hours}:${minutes}`;
};

//総勤務時間から休憩時間を引く
export const calculateNetWorkHours = (totalWorkTime, breakTime) => {
  // 時間文字列をDateオブジェクトに変換
  const totalWork = new Date(`1970-01-01T${totalWorkTime}`);
  const breakPeriod = new Date(`1970-01-01T${breakTime}`);

  // 日付の有効性をチェック
  const isValidDate = (date) => date instanceof Date && !isNaN(date);
  if (!isValidDate(totalWork) || !isValidDate(breakPeriod)) {
    return '00:00';
  }

  // 時間の差を計算
  const diff = totalWork - breakPeriod;
  const hours = Math.floor(diff / 1000 / 60 / 60).toString().padStart(2, '0');
  const minutes = Math.floor((diff / 1000 / 60) % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

// 「。」を改行タグに置き換える関数
export const formatRemarks = (remarks) => {
  if (!remarks) return '';
  return remarks.split('。').join('。<br />');
};

//日数計算するために分単位に変換
export const convertTimeToMinutes = (timeString) => {
  if (!timeString) return 0; // または適切なデフォルト値
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

//小数点以下切り捨て
export const formatAmount2 = (amount) => { 
  return Math.floor(amount);
};

//3桁ごとに区切る
export const formatAmount3 = (amount) => {
  return amount.toLocaleString('ja-JP', { minimumFractionDigits: 0 });
};

//小数点以下切り捨て、数字に変換
export const formatAmount = (amount) => { 
  const flooredAmount = Math.floor(amount); 
  return Number(flooredAmount);
};

//少数点以下切り捨て、3桁ごとに区切る
export const formatAmountJp = (amount) => { 
  const flooredAmount = Math.floor(amount); 
  return flooredAmount.toLocaleString('ja-JP', { minimumFractionDigits: 0 }); 
};
