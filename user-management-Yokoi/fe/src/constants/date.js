//土日を判定
export const isWeekend = (date) => {
  const day = date.getUTCDay();
  return day === 0 || day === 6; // 日曜日 (0) または土曜日 (6)
};
