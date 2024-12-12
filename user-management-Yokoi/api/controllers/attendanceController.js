const { getTotalHours, getWeeklyTotalHours, formatTime, getDaysWithWorkHours } = require('../common/utils');

//勤怠登録
const attData = async (req, res, db) => {
  const { accounts_id, date, check_in_time, check_out_time, break_time, work_hours, remarks1, remarks2, out_remarks1, out_remarks2, is_checked_in, mid_flag } = req.body;
  try {
    const userAttendance = await db('attendance').where({ accounts_id, date }).first();

    if (userAttendance) {
      if (mid_flag) {
        // 退勤登録
        await db('attendance')
        .where({ accounts_id, date })
        .update({
          check_out_time,
          break_time,
          work_hours: db.raw(`INTERVAL '${work_hours}'`),
          out_remarks1,
          out_remarks2,
          is_checked_in: false
        });
        res.status(200).send('退勤登録完了');
      } else {
        // 退勤登録
        await db('attendance')
        .where({ accounts_id, date })
        .update({
          check_out_time,
          break_time,
          work_hours: db.raw(`INTERVAL '${work_hours}'`), 
          out_remarks1,
          out_remarks2,
          //is_checked_in: false
        });
        res.status(200).send('退勤登録完了');
      }
    } else {
      // 出勤登録
      await db('attendance').insert({
        accounts_id,
        date,
        check_in_time,
        remarks1,
        remarks2,
        is_checked_in: true
      });
      res.status(200).send('出勤登録完了');
    }
  } catch (error) {
    console.error('Error recording attendance:', error);
    res.status(500).send('サーバーエラー');
  }
};

//出勤状態を取得
const attgetData = async (req, res, db) => {
  const { id } = req.params;
  const today = new Date();
  const todayISOString = today.toISOString().split('T')[0];

  // 前日の取得
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayISOString = yesterday.toISOString().split('T')[0];
  try {
    // 今日と前日の日付を考慮して出勤状態を取得
    const todayAttendance = await db('attendance').where({ accounts_id: parseInt(id, 10), date: todayISOString }).first();
    const yesterdayAttendance = await db('attendance').where({ accounts_id: parseInt(id, 10), date: yesterdayISOString }).first();

    //今日の出勤がある場合
    if (todayAttendance) {
      res.json({ is_checked_in: todayAttendance.is_checked_in, midFlag: true });
    //昨日の未退勤がある場合、日を跨いで稼働している
    } else if (yesterdayAttendance && yesterdayAttendance.is_checked_in) {
      res.json({ is_checked_in: true });
    //出勤してない
    } else {
      res.json({ is_checked_in: false });
    }
  } catch (error) {
    console.error('Error fetching attendance status:', error);
    res.status(500).send('サーバーエラー');
  }
};

//出勤時間を取得
const checkIn = async (req, res, db) => {
  const { accounts_id,date } = req.params;
  try {
    const userAttendance = await db('attendance').where({ accounts_id, date }).first();
    if (userAttendance) {
      res.json({ check_in_time: userAttendance.check_in_time,date});
    } else {
      res.status(404).send('出勤記録が見つかりません。');
    }
  } catch (error) {
    console.error('Error fetching check-in time:', error);
    res.status(500).send('サーバーエラー');
  }
}

// メンバーの出勤、退勤時間を取得
const dateData = async (req, res, db) => {
  const { accounts_id, date } = req.params;
  const numericAccountsId = parseInt(accounts_id, 10); 
  try {
    const userAttendance = await db('attendance').where({ accounts_id: numericAccountsId, date });
    if (userAttendance.length > 0) {
      res.json(userAttendance);
    } else {
      res.json(''); // 出勤記録が見つからない場合、空文字列を返す
    }
  } catch (error) {
    console.error('Error fetching attendance data:', error);
    res.status(500).send('サーバーエラー');
  }
};

//メンバーの今月の勤務時間、先週の勤務時間を取得
const getMonthlyTotalHours = async (req, res, db) => {
  const { accounts_id, year, month, lastMonday, lastSunday } = req.params;
  try {
    const yearStr = String(year);
    const monthStr = String(month).padStart(2, '0');
    const startDate = `${yearStr}-${monthStr}-01`;
    const endDate = `${yearStr}-${monthStr}-${new Date(year, month, 0).getDate()}`;

    // 月の合計勤務時間のクエリ
    const totalHoursResult = await getTotalHours(db, accounts_id, startDate, endDate);
    const totalTime = totalHoursResult && totalHoursResult.total_hours ? parseFloat(totalHoursResult.total_hours).toFixed(2) : '';

    // 先週の合計勤務時間のクエリ
    const weeklyTotalHoursResult = await getWeeklyTotalHours(db, accounts_id, lastMonday, lastSunday, month);
    const weeklyTotalTime = weeklyTotalHoursResult && weeklyTotalHoursResult.week_hours ? parseFloat(weeklyTotalHoursResult.week_hours).toFixed(2) : '0.00';

    // 月の時間と分の取得とフォーマット
    const formattedTime = formatTime(totalTime);

    // 先週の時間と分を取得してフォーマット
    const formattedWeeklyTime = formatTime(weeklyTotalTime);

    // 月の勤務時間を分に変換し、勤務日数で割る
    const totalMinutes = totalTime ? Math.floor(totalTime) * 60 + Math.round((totalTime - Math.floor(totalTime)) * 60) : 0;
    const daysWithWorkHoursResult = await getDaysWithWorkHours(db, accounts_id, startDate, endDate);
    const averageMinutes = totalMinutes / (daysWithWorkHoursResult.count || 1); // 0で割るのを防ぐために1をデフォルト値に

    // 週の勤務時間を分に変換し、勤務日数で割る
    const weekMinutes = weeklyTotalTime ? Math.floor(weeklyTotalTime) * 60 + Math.round((weeklyTotalTime - Math.floor(weeklyTotalTime)) * 60) : 0;
    const weekWithWorkHoursResult = await getDaysWithWorkHours(db, accounts_id, new Date(lastMonday), new Date(lastSunday));
    const weekAverageMinutes = weekMinutes / (weekWithWorkHoursResult.count || 1); // 0で割るのを防ぐために1をデフォルト値に

    // レスポンスに返す
    res.json({
      total_hours: formattedTime,
      weekly_total_hours: formattedWeeklyTime,
      weekly_total_count: weekWithWorkHoursResult,
      average_time_per_day: averageMinutes,
      week_average_time_per_day: weekAverageMinutes
    });
  } catch (error) {
    console.error('クエリエラー:', error.message);
    res.status(500).json({ error: `サーバーエラー: ${error.message}` });
  }
};

//今月の勤怠情報を取得
const monthData = async (req, res, db) => {
  const { accounts_id, year, month } = req.params;

  db('attendance')
  .whereRaw(`TO_CHAR(date, 'YYYY-MM') = ?`, [`${year}-${month}`])
  .andWhere('accounts_id', accounts_id)
  .then(attendance => {
    res.json(attendance);
  })
  .catch(error => {
    console.error('Error fetching attendance data:', error);
    res.status(500).json({ error: 'Internal server error. Please try again later.' });
  });
};

//標準勤務時間を取得
const overUser = async (req, res, db) => {
  const { accounts_id } = req.params;
  try {
    const item = await db('overdata').where({ accounts_id }).first();
    if (item) {
      res.json( item );
    } else {
      res.status(404).send('保存データが見つかりません。');
    }
  } catch (error) {
    console.error('Error fetching check-in time:', error);
    res.status(500).send('サーバーエラー');
  }
}

//標準勤務時間を登録
const overData = async (req, res, db) => {
  const { accounts_id, start_time, end_time, break_time, work_hours } = req.body;
  const overUser = await db('overdata').where({ accounts_id }).first();
  if(overUser){
    await db('overdata').where({ accounts_id }).update({ start_time, end_time, break_time, work_hours })
    .returning('*')
    .then(item => {
      res.json(item);
    })
    .catch(err => res.status(400).json({
      dbError: 'error'
    }));
  }else {
    await db('overdata').insert({accounts_id, start_time, end_time, break_time, work_hours})
    .returning('*')
    .then(item => {
      res.json(item);
    })
    .catch(err => res.status(400).json({
      dbError: 'error'
    }));
  }
}

//ユーザーの勤怠修正
const newRemarks = async (req, res, db) => {
  const { accounts_id, date, remarks1, remarks2, out_remarks1, out_remarks2 } = req.body;
  const remarksUser = await db('attendance').where({ accounts_id, date }).first();
  if(remarksUser){
    await db('attendance').where({ accounts_id, date }).update({ remarks1, remarks2, out_remarks1, out_remarks2 })
    .returning('*')
    .then(item => {
      res.json(item);
    })
    .catch(err => res.status(400).json({
      dbError: 'error'
    }));
  }else {
    await db('attendance').insert({accounts_id, date, remarks1, remarks2, out_remarks1, out_remarks2})
    .returning('*')
    .then(item => {
      res.json(item);
    })
    .catch(err => res.status(400).json({
      dbError: 'error'
    }));
  }
}

//管理者の勤怠修正
const newTime = async (req, res, db) => {
  const { accounts_id, date, check_in_time, check_out_time, break_time, work_hours, is_checked_in} = req.body;
  
  const remarksUser = await db('attendance').where({ accounts_id, date }).first();

  if(remarksUser){
    if(check_in_time === ''){
      await db('attendance').where({ accounts_id, date }).del() 
      .then(() => { res.status(200).send('データ削除完了'); }) 
      .catch(err => res.status(400).json({ 
        dbError: '削除エラー' 
      }));
    }else if(check_out_time === ''){
      await db('attendance').where({ accounts_id, date }).update({ break_time: null, check_out_time: null, work_hours: null })
      .returning('*')
      .then(item => {
        res.json(item);
      })
      .catch(err => res.status(400).json({
        dbError: 'error'
      }));
    }else if(break_time === ''){
      await db('attendance').where({ accounts_id, date }).update({ break_time: null, check_out_time: null, work_hours: null })
      .returning('*')
      .then(item => {
        res.json(item);
      })
      .catch(err => res.status(400).json({
        dbError: 'error'
      }));
    }else{
      await db('attendance').where({ accounts_id, date }).update({ check_in_time, check_out_time, break_time, work_hours, is_checked_in })
      .returning('*')
      .then(item => {
        res.json(item);
      })
      .catch(err => res.status(400).json({
        dbError: 'error'
      }));
    }
  }else {
    await db('attendance').insert({accounts_id, date, check_in_time, check_out_time, break_time, work_hours, is_checked_in})
    .returning('*')
    .then(item => {
      res.json(item);
    })
    .catch(err => res.status(400).json({
      dbError: 'error'
    }));
  }
}


module.exports = {
  attData,
  attgetData,
  checkIn,
  dateData,
  getMonthlyTotalHours,
  monthData,
  overUser,
  overData,
  newRemarks,
  newTime
}
  