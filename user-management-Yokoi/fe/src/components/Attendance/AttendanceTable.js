import React, { useEffect, useState } from 'react';
import holidayJp from '@holiday-jp/holiday_jp';
import { Link } from 'react-router-dom';

const AttendanceTablePage = ( ) => {
  const id = localStorage.getItem('user');
  const [userData, setUserData] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [overData, setOverData] = useState({});
  const [daysInMonth, setDaysInMonth] = useState([]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [breakTime, setBreakTime] = useState('01:00');
  const [workHours, setWorkHours] = useState('08:00');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [holidaysAndWeekendsCount, setHolidaysAndWeekendsCount] = useState(0);
  const [provisions, setProvisions] = useState(0);
  const [userWorkHours, setUserWorkHours] = useState(0);
  const [remainingTime, setRemainingTime] = useState('');
  const [userTotal, setUserTotal] = useState(0);
  const [isOvertime, setIsOvertime] = useState(false);

  //ユーザー情報を取得
  useEffect(() => {
    fetch(`http://localhost:3000/user/${id}`, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.json())
      .then(data => setUserData(data))
      .catch(err => console.log(err));
  }, [id]);

  //ユーザーの勤怠情報を取得
  useEffect(() => {
    const fetchAttendance = async () => {
      const accounts_id = localStorage.getItem('user');
      try {
        const response = await fetch(`http://localhost:3000/attendance/${accounts_id}/${month}`);
        const data = await response.json();
        setUserWorkHours(data);
        setAttendanceData(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching attendance data:', error);
        setAttendanceData([]);
      }
    };
    fetchAttendance();
  }, [year,month]);

  //土日を判定
  const isWeekend = (date) => {
    const day = date.getUTCDay();
    return day === 0 || day === 6; // 日曜日 (0) または土曜日 (6)
  };

  //祝日を取得
  const getHolidaysInMonth = (year, month) => {
    const holidays = holidayJp.between(new Date(year, month - 1, 1), new Date(year, month, 0));
    return holidays.map(holiday => new Date(holiday.date));
  };

  //表を出力
  //特定の月の日付を取得し、それをReactの状態に設定する
  useEffect(() => {
    //指定された年と月のすべての日付を配列として返す
    const getDaysInMonth = (year, month) => {
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

    //getDaysInMonth関数を使用して、現在の年と指定された月のすべての日付を取得します。JavaScriptの月は0から始まるため、month - 1
    const days = getDaysInMonth(year, month - 1);
    const weekends = days.filter(isWeekend);
    const holidays = getHolidaysInMonth(year, month);

    // 祝日が土日に含まれる場合、その日数を除外
    const uniqueHolidays = holidays.filter(holiday => !weekends.some(weekend => weekend.getTime() === holiday.getTime()));
    const holidaysAndWeekends = [...weekends, ...uniqueHolidays].sort((a, b) => a - b);

    // 全ての日数から土日祝日を引いた数をコンソールに表示
    const workingDaysCount = days.length - holidaysAndWeekends.length;

    // 土日祝日を引いた日数を状態に設定
    setHolidaysAndWeekendsCount(workingDaysCount);

    //取得した日付の配列をReactの状態に設定
    setDaysInMonth(days);
  }, [year,month]); //monthが変更されるたびに実行する

  //特定の日付の曜日を取得する関数
  const getDayOfWeek = (date) => {
    //渡された日付の曜日を日本語で取得
    //dateオブジェクトを日本語のロケール（ja-JP）でフォーマットし、曜日を長い形式（例：月曜日、火曜日）で返す
    return date.toLocaleDateString('ja-JP', { weekday: 'long' });
  };

  // 勤怠情報を検索する関数
  const findAttendanceRecord = (date) => {
    // dateオブジェクトをローカルタイムゾーンのYYYY-MM-DD形式に変換
    const formattedDate = date.toLocaleDateString('en-CA'); // 'en-CA'はYYYY-MM-DD形式を返す
    // attendanceData配列内の各recordを検索し、条件に一致する最初の要素を返す
    return attendanceData.find(record => {
      // record.dateを日付オブジェクトに変換し、ローカルタイムゾーンの日付部分を取得
      const recordDate = new Date(record.date).toLocaleDateString('en-CA');
      // recordDateとformattedDateが一致するかどうかを比較し、一致する場合にそのrecordを返す
      return recordDate === formattedDate;
    });
  };

  // 時間をhh:mm形式でフォーマットする関数
  const formatTime = (timeString) => {
    if (!timeString) return '-';
    const [hours, minutes] = timeString.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  };

  // 「。」を改行タグに置き換える関数
  const formatRemarks = (remarks) => {
    if (!remarks) return '-';
    return remarks.split('。').join('。<br />');
  };

  //通常勤怠情報の処理
  //ユーザーIDをもとに残業情報を取得、データがあればインプットにデフォルト表示
  useEffect(() => {
    const accounts_id = localStorage.getItem('user');
    fetch(`http://localhost:3000/overuser/${accounts_id}`, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.json())
      .then(data => {
        setOverData(data);
        if (data.start_time) setStartTime(data.start_time);
        if (data.end_time) setEndTime(data.end_time);
        if (data.break_time) setBreakTime(data.break_time);
      })
      .catch(err => console.log(err));
  }, [id]);

  const calculateWorkHours = (start, end) => {
    const startDate = new Date(`1970-01-01T${start}`);
    const endDate = new Date(`1970-01-01T${end}`);
    const diff = endDate - startDate;
    const hours = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');;
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');;
    return `${hours}:${minutes}`;
  };

  const work_hours = calculateWorkHours(startTime, endTime);

  // 勤務時間を計算
  const CalculateWorkHours2 = (checkOllTimeString, checkBreakTimeString ) => {
    // 時間文字列をDateオブジェクトに変換
    const checkOllTime = new Date(`1970-01-01T${checkOllTimeString}`);
    const checkBreakTime = new Date(`1970-01-01T${checkBreakTimeString}`);
    
    // 日付の有効性をチェック
    const isValidDate = (date) => date instanceof Date && !isNaN(date);
    if (!isValidDate(checkOllTime) || !isValidDate(checkBreakTime)) {
      return '計算できませんでした';
    }

    // 時間の差を計算
    const diff =  checkOllTime - checkBreakTime;
    const hours = Math.floor(diff / 1000 / 60 / 60).toString().padStart(2, '0');;
    const minutes = Math.floor((diff / 1000 / 60) % 60).toString().padStart(2, '0');;
    return `${hours}:${minutes}`;
  };

  //残業時間を計算
  //日数計算するために分単位に変換
  const convertTimeToMinutes = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const convertMinutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60).toString().padStart(2, '0');
    const mins = (minutes % 60).toString().padStart(2, '0');
    return `${hours}:${mins}`;
  };

  const subtractTimes = (time1, time2) => {
    const minutes1 = convertTimeToMinutes(time1);
    const minutes2 = convertTimeToMinutes(time2);
    const diffMinutes = minutes1 - minutes2;
    return convertMinutesToTime(diffMinutes);
  };

  //残りの時間がマイナスかどうかを判定
  const isNegativeTime = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours < 0 || (hours === 0 && minutes < 0);
  };

  //時間からマイナスを消す
  const removeNegativeSign = (timeString) => {
    if (timeString.startsWith('-')) {
      return timeString.slice(1);
    }
    return timeString;
  };
  
  useEffect(() => {
    if (startTime && endTime && breakTime) {
      const WorkHours = CalculateWorkHours2(work_hours, breakTime);
      setWorkHours(WorkHours);

      // workHoursを分単位に変換し、勤務日数を掛ける
      const holiday = holidaysAndWeekendsCount;
      const workHoursInMinutes = convertTimeToMinutes(WorkHours);
      const multipliedWorkHoursInMinutes = workHoursInMinutes * holiday;

      // 分単位の時間をhh:mm形式に変換
      const hours = Math.floor(multipliedWorkHoursInMinutes / 60).toString().padStart(2, '0');
      const minutes = (multipliedWorkHoursInMinutes % 60).toString().padStart(2, '0');
      const multipliedWorkHours = `${hours}:${minutes}`;
      
      //一か月の規定勤務時間
      setProvisions(multipliedWorkHours);

      // ユーザーの一か月の総勤務時間を引く
      if (userWorkHours.length > 0) {
        const allWorkHours = userWorkHours.map(record => record.work_hours);
        const totalWorkHours = allWorkHours.reduce((acc, curr) => {
          const totalMinutes = acc + convertTimeToMinutes(curr);
          return totalMinutes;
        }, 0);

        const totalWorkHoursTime = convertMinutesToTime(totalWorkHours);
        setUserTotal(totalWorkHoursTime);
        const remainingTime1 = subtractTimes(multipliedWorkHours, totalWorkHoursTime);
        setRemainingTime(remainingTime1);
      }
    }
  }, [startTime, endTime, breakTime, workHours, userWorkHours, remainingTime, month, year]);

  const truncateMinutes = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    return `${hours}`;
  };

  useEffect(() => {

    const minus = isNegativeTime(remainingTime);
    if(minus){
      const remove = removeNegativeSign(remainingTime);
      const removeH = truncateMinutes(remove);
      console.log(removeH);
      // 残業時間が35時間を超えるかどうかをチェック
      if (removeH > 35) {
        setIsOvertime(true);
      } 
    }else {
      setIsOvertime(false);
    }
  },[remainingTime])

  const handleSubmit = async (e) => {
    e.preventDefault();
    const accounts_id = localStorage.getItem('user');
    const data = {
      accounts_id,
      start_time: startTime,
      end_time: endTime,
      break_time: breakTime,
      work_hours: workHours
    };

    try {
      const response = await fetch('http://localhost:3000/overtime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        alert('データが保存されました');
      } else {
        alert('データの保存に失敗しました');
      }
    } catch (error) {
      console.error('Error saving data:', error);
      alert('データの保存に失敗しました');
    }
  };
  
  return (
    <div id='table_flex'>
      <div id='table_box1'>
        <div>
        {userData && <p id='atUser'>ユーザー名: {userData.fullname} さん</p>}
        </div>
        <div id='at_all_left'>
          <div id='at_h3'>
            <h3>標準勤務時間</h3>
          </div>
          <div>
            <form onSubmit={handleSubmit}>
              <div>
                <label>出勤開始時間 : </label>
                  <input type='time' className='at_left_input' value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
              <div className='at_left'>
                <label>退勤時間 : </label>
                <input type='time' className='at_left_input' value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
              <div className='at_left'>
                <label>休憩時間 : </label>
                <input type='time' className='at_left_input' value={breakTime} onChange={(e) => setBreakTime(e.target.value)} />
              </div>
              <div className='at_left'>
                <label>勤務時間 : </label>
                <input type='time' className='at_left_input' value={workHours} onChange={(e) => setWorkHours(e.target.value)} />
              </div>
              <div id='at_left_bt'>
                <button type='submit' id='at_left_button'>保存</button>
              </div>
            </form>
          </div>
        </div>
        <div id='attendance_link_area'>
          <Link to="/" id='account_top_link'>← 勤怠一覧ページ</Link>
        </div>
      </div>
      <div id='table_box2'>
        <h1 id='atH1'>勤怠一覧</h1>
        <div id='table_top_menu'>
          <div id='all_overwork'>
            <p>
              <span className="label">今月の総勤務時間 :</span>
              <span className="value">{userTotal}</span>
            </p>
            <p>
              <span className="label">今月の規定勤務時間 :</span>
              <span className="value">{provisions}</span>
            </p>
            <p>
              <span className="label">今月の残り規定勤務時間 :</span>
              <span className="value">{isNegativeTime(remainingTime) ? '0' : remainingTime}</span>
            </p>
            <p>
              <span className="label">今月の総残業時間 :</span>
              <span className={`${isOvertime ? 'overtime' : 'value'}`}>
                {isNegativeTime(remainingTime) ? removeNegativeSign(remainingTime) : '0'}
              </span>
            </p>
          </div>
          <div id='at_ym'>
            <input
              id='at_year'
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
            <input
              id='at_month'
              type="number"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              min="1"
              max="12"
            />
          </div>
        </div>
        <h2>{year}年 {month}月</h2>
        <div id='atTable'>
          <table className='atTop'>
            <thead className='atTh'>
              <tr>
                <th className='date-column'>日付</th>
                <th className='day-column'>曜日</th>
                <th className='time-column'>出勤時間</th>
                <th className='remarks-column'>特記</th>
                <th className='remarks2-column'>出勤備考</th>
                <th className='time-column'>退勤時間</th>
                <th className='remarks-column'>特記</th>
                <th className='remarks2-column'>退勤備考</th>
                <th className='time-column'>休憩時間</th>
                <th className='time-column'>勤務時間</th>
              </tr>
            </thead>
            <tbody id='at_tbody'>
              {daysInMonth.map((date) => {
                const record = findAttendanceRecord(date);
                return (
                  <tr key={date.toISOString()}>
                    <td>{date.toLocaleDateString('ja-JP').replace(/\//g, '/')}</td>
                    <td>{getDayOfWeek(date)}</td>
                    <td>{record ? formatTime(record.check_in_time) : '-'}</td>
                    <td>{record ? record.remarks1 : '-'}</td>
                    <td className='remarks2-td' style={{ textAlign: 'left' }} dangerouslySetInnerHTML={{ __html: record ? formatRemarks(record.remarks2) : '-' }}></td>
                    <td>{record ? formatTime(record.check_out_time) : '-'}</td>
                    <td>{record ? record.out_remarks1 : '-'}</td>
                    <td className='remarks2-td' style={{ textAlign: 'left' }} dangerouslySetInnerHTML={{ __html: record ? formatRemarks(record.out_remarks2) : '-' }}></td>
                    <td>{record ? formatTime(record.break_time) : '-'}</td>
                    <td>{record ? formatTime(record.work_hours) : '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTablePage;