const checkAdminPassword = async (db, authority) => {
  const passData = await db('passdata').select('admin_password').first();
  const adminPassword = passData.admin_password;
  return authority === adminPassword;
};

// 月の合計勤務時間を取得
const getTotalHours = async (db, accounts_id, startDate, endDate) => {
  return await db('attendance')
    .where('accounts_id', accounts_id)
    .andWhere('date', '>=', startDate)
    .andWhere('date', '<=', endDate)
    .whereNotNull('check_in_time')
    .whereNotNull('check_out_time')
    .select(db.raw(`
      SUM(EXTRACT(EPOCH FROM work_hours) / 3600) as total_hours
    `)).first();
};

// 先週の合計勤務時間を取得
const getWeeklyTotalHours = async (db, accounts_id, lastMonday, lastSunday, month) => {
  return await db('attendance')
    .where('accounts_id', accounts_id)
    .andWhere('date', '>=', new Date(lastMonday))
    .andWhere('date', '<=', new Date(lastSunday))
    .andWhere(db.raw(`EXTRACT(MONTH FROM date) = ?`, [month]))
    .whereNotNull('work_hours')
    .select(db.raw(`SUM(EXTRACT(EPOCH FROM work_hours) / 3600) as week_hours`)).first();
};

// 時間をフォーマットする
const formatTime = (totalTime) => {
  const hours = totalTime ? Math.floor(totalTime) : 0;
  const minutes = totalTime ? Math.round((totalTime - hours) * 60) : 0;
  return totalTime ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}` : '';
};

// 勤務日数を取得
const getDaysWithWorkHours = async (db, accounts_id, startDate, endDate) => {
  return await db('attendance')
    .where('accounts_id', accounts_id)
    .andWhere('date', '>=', startDate)
    .andWhere('date', '<=', endDate)
    .whereNotNull('work_hours')
    .count('id as count').first();
};

module.exports = { 
  checkAdminPassword, 
  getTotalHours, 
  getWeeklyTotalHours, 
  formatTime, 
  getDaysWithWorkHours 
};
