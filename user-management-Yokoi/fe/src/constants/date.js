//土日を判定
export const isWeekend = (date) => {
  const day = date.getUTCDay();
  return day === 0 || day === 6; // 日曜日 (0) または土曜日 (6)
};

//指定された年と月のすべての日付を配列として返す
export const getDaysInMonth = (year, month) => {
  //指定された年と月の1日目の日付オブジェクトを作成
  const date = new Date(Date.UTC(year, month, 1));
  //日付を格納するための空の配列を作成
  const days = [];
  //dateの月が指定された月(month)と同じである限りループを続ける
  while (date.getUTCMonth() === month) {
    //現在の日付オブジェクトをdays配列に追加
    days.push(new Date(date));
    //dateオブジェクトの日付を1日進める
    date.setUTCDate(date.getUTCDate() + 1);
  }
  return days; //すべての日付を含む配列を返す
};

//特定の日付の曜日を取得する関数
export const getDayOfWeek = (date) => {
  //渡された日付の曜日を日本語で取得
  //dateオブジェクトを日本語のロケール（ja-JP）でフォーマットし、曜日を長い形式（例：月曜日、火曜日）で返す
  return date.toLocaleDateString('ja-JP', { weekday: 'long' });
};


