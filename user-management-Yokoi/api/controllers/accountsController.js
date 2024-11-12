const bcrypt = require('bcryptjs'); 
const { console } = require('inspector');
const jwt = require('jsonwebtoken');
const secretKey = 'yourSecretKey';
const path = require('path');
const fs = require('fs');

//アカウント登録
const postData = async (req, res, db) => {
  const { company, fullname, kananame, email, team, password, authority } = req.body;
  const date = new Date();
  const hashedPassword = await bcrypt.hash(password, 10);

  // メールアドレスが既に存在するか確認
  const emailUser = await db('accounts').where({ email }).first();

  // 管理者パスワードを取得 
  const passData = await db('passdata').select('admin_password').first(); 
  const adminPassword = passData.admin_password;

  if (emailUser) {
    return res.status(400).json({ dbError: 'このメールアドレスは既に登録されています' });
  }else if(authority === adminPassword){
    const authorityTrue = true;
    await db('accounts').insert({ company, fullname, kananame, email, team, date, password: hashedPassword, authority:authorityTrue })
    .returning('*')
    .then(item => {
      res.json(item);
    })
    .catch(err => res.status(400).json({
      dbError: 'error'
    }));
  }else{
    const authorityFalse = false;
    await db('accounts').insert({ company, fullname, kananame, email, team, date, password: hashedPassword, authority:authorityFalse })
    .returning('*')
    .then(item => {
      res.json(item);
    })
    .catch(err => res.status(400).json({
      dbError: 'error'
    }));
  }
}

//アカウント登録修正
const putData = async (req, res, db) => {
  const { id, company, fullname, kananame, email, team, authority } = req.body;

  // 管理者パスワードを取得 
  const passData = await db('passdata').select('admin_password').first(); 
  const adminPassword = passData.admin_password;

  if(authority === adminPassword){
    const authorityTrue = true;
    await db('accounts').where({ id }).update({ company, fullname, kananame, email, team, authority:authorityTrue })
    .returning('*')
    .then(item => {
      res.json(item);
    })
    .catch(err => res.status(400).json({
      dbError: 'error'
    }));
  }else {
    const authorityFalse = false;
    await db('accounts').where({ id }).update({ company, fullname, kananame, email, team, authority:authorityFalse })
    .returning('*')
    .then(item => {
      res.json(item);
    })
    .catch(err => res.status(400).json({
      dbError: 'error'
  }));
  }
}

//アカウント登録後ページ
const newData = async (req, res, db) => {
  const userId = req.params.id;
  try {
    const item = await db('accounts').where({ id:userId }).first();
    if (item) {
      res.json(item);
    } else {
      res.status(400).json({ error: 'User not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//ログイン機能
const loginData = async (req, res, db) => {
  const { email, password } = req.body;
  try {
    const item = await db('accounts').where({ email }).first();
    const user = item.id;
    if (item) {
      const isMatch = await bcrypt.compare(password, item.password);
      if (isMatch) {
        const token = jwt.sign({ id: item.id }, secretKey, { expiresIn: '1h' });
        res.json({ token, user });
      } else {
        res.status(400).json({ error: 'Invalid credentials' });
      }
    } else {
      res.status(400).json({ error: 'User not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//アカウント情報を全て取得
const getData = (req, res, db) => {
  db.select('*').from('accounts')
  .then(items => {
    if (items.length) {
      res.json(items);
    } else {
      res.json({
        dataExists: 'false'
      });
    }
  })
  .catch(err => res.status(400).json({
    dbError: 'error'
  }));
}

//アカウント削除
const delData = (req, res, db) => {
  const { id } = req.body;

  // トランザクションを使用して複数の削除操作を実行
  db.transaction(trx => {
    trx('attendance').where({ accounts_id: id }).del()
    .then(() => {
      return trx('overdata').where({ accounts_id: id }).del();
    })
    .then(() => {
      return trx('projectdata').where({ accounts_id: id }).del();
    })
    .then(() => {
      return trx('expenses').where({ accounts_id: id }).del();
    })
    .then(() => {
      return trx('accounts').where({ id }).del();
    })
    .then(trx.commit)
    .catch(trx.rollback);
  })
  .then(() => {
    res.json({ delete: 'true' });
  })
  .catch(err => res.status(400).json({ dbError: 'error' }));
};

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
          work_hours: db.raw(`INTERVAL '${work_hours}'`), // INTERVAL 型に変換
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
          work_hours: db.raw(`INTERVAL '${work_hours}'`), // INTERVAL 型に変換
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

// メンバーの経費申請状況を取得
const memberCostData = async (req, res, db) => {
  const { accounts_id, date2 } = req.params;
  const numericAccountsId = parseInt(accounts_id, 10); 
  console.log(`アカウントID${accounts_id}`);
  console.log(`申請フラグ${date2}`);
  try {
    const memberCost = await db('projectdata').where({ accounts_id: numericAccountsId, create_date: date2 });
    if (memberCost.length > 0) {
      res.json(memberCost);
      console.log(memberCost);
    } else {
      res.json([]); // 申請情報が見つからない場合、空の配列を返す
    }
  } catch (error) {
    console.error('Error fetching attendance data:', error);
    res.status(500).json({ error: 'サーバーエラー' }); // JSON形式でエラーメッセージを返す
  }
};

//メンバーの今月の勤務時間、先週の勤務時間を取得
const getMonthlyTotalHours = async (req, res, db) => {
  const { accounts_id, year, month, lastMonday, lastSunday } = req.params;
  const numericAccountsId = parseInt(accounts_id, 10);

  try {
    const yearStr = String(year);
    const monthStr = String(month).padStart(2, '0');
    const startDate = `${yearStr}-${monthStr}-01`;
    const endDate = `${yearStr}-${monthStr}-${new Date(year, month, 0).getDate()}`; // 修正: year, monthを数値として使用

    // 月の合計勤務時間のクエリ
    const totalHoursResult = await db('attendance')
    .where('accounts_id', numericAccountsId)
    .andWhere('date', '>=', startDate)
    .andWhere('date', '<=', endDate)
    .whereNotNull('check_in_time')
    .whereNotNull('check_out_time')
    .select(db.raw(`
      SUM(EXTRACT(EPOCH FROM work_hours) / 3600) as total_hours
    `)).first(); 

    // 先週の合計勤務時間のクエリ
    const weeklyTotalHoursResult = await db('attendance') 
    .where('accounts_id', numericAccountsId) 
    .andWhere('date', '>=', new Date(lastMonday)) 
    .andWhere('date', '<=', new Date(lastSunday)) 
    .andWhere(db.raw(`EXTRACT(MONTH FROM date) = ?`, [month]))
    .whereNotNull('work_hours') .select(db.raw(`SUM(EXTRACT(EPOCH FROM work_hours) / 3600) as week_hours`)).first();

    // 月のwork_hoursデータがある日数のクエリ
    const daysWithWorkHoursResult = await db('attendance')
    .where('accounts_id', numericAccountsId)
    .andWhere('date', '>=', startDate)
    .andWhere('date', '<=', endDate)
    .whereNotNull('work_hours')
    .count('id as count').first(); 

    // 週のwork_hoursデータがある日数のクエリ
    const weekWithWorkHoursResult = await db('attendance')
    .where('accounts_id', numericAccountsId)
    .andWhere('date', '>=', new Date(lastMonday))
    .andWhere('date', '<=', new Date(lastSunday))
    .andWhere(db.raw(`EXTRACT(MONTH FROM date) = ?`, [month])) 
    .whereNotNull('work_hours')
    .count('id as count').first(); 

    const totalTime = parseFloat(totalHoursResult.total_hours).toFixed(2);
    const weeklyTotalTime = parseFloat(weeklyTotalHoursResult.week_hours).toFixed(2);

    // totalTimeまたはweeklyTotalTimeが数値でない場合は空文字列を返す
    if (isNaN(totalTime) || isNaN(weeklyTotalTime)) {
      return res.json({
        total_hours: '',
        weekly_total_hours: '',
        average_time_per_day: '',
        week_average_time_per_day: ''
      });
    }

    // 月の時間と分の取得とフォーマット
    const hours = Math.floor(totalTime);
    const minutes = Math.round((totalTime - hours) * 60);
    const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

    // 先週の時間と分を取得してフォーマット
    const weeklyHours = Math.floor(weeklyTotalTime);
    const weeklyMinutes = Math.round((weeklyTotalTime - weeklyHours) * 60);
    const formattedWeeklyTime = `${String(weeklyHours).padStart(2, '0')}:${String(weeklyMinutes).padStart(2, '0')}`;

    // 月の勤務時間を分に変換し、勤務日数で割る
    const totalMinutes = hours * 60 + minutes;
    const averageMinutes = totalMinutes / daysWithWorkHoursResult.count;

    // 週の勤務時間を分に変換し、勤務日数で割る
    const weekMinutes = weeklyHours * 60 + weeklyMinutes;
    const weekAverageMinutes = weekMinutes / weekWithWorkHoursResult.count;

    // レスポンスに返す
    res.json({
      total_hours: formattedTime,
      weekly_total_hours: formattedWeeklyTime,
      weekly_total_count: weekWithWorkHoursResult,
      average_time_per_day: averageMinutes,
      week_average_time_per_day: weekAverageMinutes
    });
  } catch (error) {
    console.error('Error fetching total hours:', error.message);
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

//プロジェクト情報を登録
const projectsData = async (req, res, db) => {
  const { accounts_id, project, details, company, name, create_date } = req.body;
  const projectUser = await db('projectdata').where({ accounts_id, create_date:create_date }).first();
  if(projectUser){
    await db('projectdata').where({ accounts_id, create_date }).update({ project, details, company, name })
    .returning('*')
    .then(item => {
      res.json(item);
    })
    .catch(err => res.status(400).json({
      dbError: 'error'
    }));
  }else {
    await db('projectdata').insert({accounts_id, project, details, company, name, create_date})
    .returning('*')
    .then(item => {
      res.json(item);
    })
    .catch(err => res.status(400).json({
      dbError: 'error'
    }));
  }
}

const projectsPut = async (req, res, db) => {
  const { accounts_id, create_date, create_day } = req.body;
  const projectUser = await db('projectdata').where({ accounts_id, create_date:create_date }).first();
  if(projectUser){
    await db('projectdata').where({ accounts_id, create_date }).update({ create_day, app_flag:true })
    .returning('*')
    .then(item => {
      res.json(item);
    })
    .catch(err => res.status(400).json({
      dbError: 'error'
    }));
  }else {
    await db('projectdata').insert({accounts_id, create_date, create_day, app_flag:true})
    .returning('*')
    .then(item => {
      res.json(item);
    })
    .catch(err => res.status(400).json({
      dbError: 'error'
    }));
  }
}

const projectsFlag = async (req, res, db) => {
  const { id, registration, registration_date, approver, president, remarks} = req.body;
  const projectUser = await db('projectdata').where({ id }).first();
  if(projectUser){
    await db('projectdata').where({ id }).update({ registration:registration, registration_date:registration_date, approver:approver, president:president, remarks:remarks, app_flag:false })
    .returning('*')
    .then(item => {
      res.json(item);
    })
    .catch(err => res.status(400).json({
      dbError: 'error'
    }));
  }
}

//プロジェクト情報を取得
const projectUser = async (req, res, db) => {
  const { accounts_id, year, month } = req.params;
  const create_date = `${year}-${month}`;
  try {
    const item = await db('projectdata').where({ accounts_id, create_date:create_date }).first();
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

//交通費情報を取得
const expensesData = async (req, res, db) => {
  const { accounts_id, year, month } = req.params;
  db('expenses')
  .whereRaw('EXTRACT(YEAR FROM date) = ?', [year])
  .whereRaw('EXTRACT(MONTH FROM date) = ?', [month])
  .andWhere('accounts_id', accounts_id)
  .then(expenses => {
    // 日付をローカルタイムゾーンに変換
    const adjustedExpenses = expenses.map(expense => ({
      ...expense,
      date: new Date(expense.date).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })
    }));
    res.json(adjustedExpenses);
  })
  .catch(error => {
    console.error('Error fetching attendance data:', error);
    res.status(500).json({ error: 'Internal server error. Please try again later.' });
  });
};

//交通費情報を登録
const newExpenses = async (req, res, db) => {
  const { accounts_id, date, route, train, bus, tax, aircraft, other, total, stay, grand_total, expenses_remarks} = req.body;
  const expensesUser = await db('expenses').where({ accounts_id, date }).first();
  if(expensesUser){
    if(route === ''){
      await db('expenses').where({ accounts_id, date }).del() 
      .then(() => { res.status(200).send('データ削除完了'); }) 
      .catch(err => res.status(400).json({ 
        dbError: '削除エラー' 
      }));
    }else{
      await db('expenses').where({ accounts_id, date }).update({ route, train, bus, tax, aircraft, other, total, stay, grand_total, expenses_remarks })
      .returning('*')
      .then(item => {
        res.json(item);
      })
      .catch(err => res.status(400).json({
        dbError: 'error'
      }));
    }
  }else {
    if(route === ''){
      await db('expenses').where({ accounts_id, date }).del() 
      .then(() => { res.status(200).send('データ削除完了'); }) 
      .catch(err => res.status(400).json({ 
        dbError: '削除エラー' 
      }));
    }else{
      await db('expenses').insert({accounts_id, date, route, train, bus, tax, aircraft, other, total, stay, grand_total, expenses_remarks })
      .returning('*')
      .then(item => {
        res.json(item);
      })
      .catch(err => res.status(400).json({
        dbError: 'error'
      }));
    }
  }
};

//代休を登録
const holidayPost = async (req, res, db) => {
  const { accounts_id, date, week  } = req.body;
  await db('holiday').insert({accounts_id, date, week})
  .returning('*')
  .then(item => {
    res.json(item);
  })
  .catch(err => res.status(400).json({
    dbError: 'error'
  }));
}

//代休を取得
const holidayData = async (req, res, db) => {
  const { accounts_id } = req.params;
  try {
    const item = await db('holiday').where({ accounts_id });
    console.log(item);
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

//代休を削除
const delHolidayData = (req, res, db) => {
  const { id } = req.body;
  db('holiday').where({ id }).del()
  .then(() => {
    res.json({
      delete: 'true'
    });
  })
  .catch(err => res.status(400).json({
    dbError: 'error'
  }));
}

//管理者パスワード取得
const passData = (req, res, db) => {
  db.select('*').from('passdata')
  .then(items => {
    if (items.length) {
      res.json(items);
    } else {
      res.json({
        dataExists: 'false'
      });
    }
  })
  .catch(err => res.status(400).json({
    dbError: 'error'
  }));
}

//管理者パスワードを変更
const passPut = async (req, res, db) => {
  const { id, fullname, date, admin_password, } = req.body;

  await db('passdata').where({ id }).update({ fullname, date, admin_password })
  .returning('*')
  .then(item => {
    res.json(item);
  })
  .catch(err => res.status(400).json({
    dbError: 'error'
  }));
}

//経費
//画像をアップロード
const imagePost = async (req, res, db) => {
  const { accounts_id, date, category, description, amount } = req.body;
  // const receipt_url = path.posix.join('uploads', req.file.filename);
  const receipt_url = req.file ? req.file.filename : '';
  try {
    await db('images_table').insert({ 
      accounts_id,
      date,
      category,
      description,
      amount,
      receipt_url 
    });
    res.status(200).json({ message: 'Image uploaded successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading image', error });
  }
}

//画像を取得
// const imageData = async (req, res, db) => {
//   try {
//     const items = await db('images_table').select();
//     res.json(items);
//   } catch (err) {
//     res.status(400).json({ dbError: 'error' });
//   }
// }

const imageData = async (req, res, db) => {
  const { accounts_id, year, month } = req.params;
  db('images_table')
  .whereRaw('EXTRACT(YEAR FROM date) = ?', [year])
  .whereRaw('EXTRACT(MONTH FROM date) = ?', [month])
  .andWhere('accounts_id', accounts_id)
  .then(expenses => {
    // 日付をローカルタイムゾーンに変換
    const adjustedExpenses = expenses.map(expense => ({
      ...expense,
      date: new Date(expense.date).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })
    }));
    res.json(adjustedExpenses);
  })
  .catch(error => {
    console.error('Error fetching attendance data:', error);
    res.status(500).json({ error: 'Internal server error. Please try again later.' });
  });
};

const costDelete = (req, res, db) => {
  const { id } = req.body;
  db('images_table').where({ id }).del()
  .then(() => {
    res.json({
      delete: 'true'
    });
  })
  .catch(err => res.status(400).json({
    dbError: 'error'
  }));
}

module.exports = {
  getData,
  postData,
  putData,
  delData,
  loginData,
  newData,
  attData,
  attgetData,
  checkIn,
  monthData,
  dateData,
  memberCostData,
  getMonthlyTotalHours,
  overData,
  overUser,
  projectsData,
  projectsPut,
  projectsFlag,
  projectUser,
  newRemarks,
  newTime,
  expensesData,
  newExpenses,
  holidayPost,
  holidayData,
  delHolidayData,
  passData,
  passPut,
  imagePost,
  imageData,
  costDelete
}
  