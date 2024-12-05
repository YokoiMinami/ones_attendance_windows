// 日付フォーマット
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
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