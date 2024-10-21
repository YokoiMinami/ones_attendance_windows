import React, { useEffect, useState,useRef } from 'react';
import holidayJp from '@holiday-jp/holiday_jp';
import { Link } from 'react-router-dom';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const ExpensesPage = ( ) => {

  const id = localStorage.getItem('user');
  const [userData, setUserData] = useState(null);

  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [daysInMonth, setDaysInMonth] = useState([]);
  const [holidaysAndWeekendsCount, setHolidaysAndWeekendsCount] = useState(0);

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

  const holidays = getHolidaysInMonth(year, month);
  return (
    <div id='expenses_page'>
      <div id='expenses_user_area'>
        {userData && <p id='atUser'>ユーザー名: {userData.fullname} さん</p>}
      </div>
      <h1>交通費精算</h1>
      <div id='expenses_at_ym'>
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
      <div id ='expenses_H2_area'>
        <h2 id ='atH2'>{year}年 {month}月</h2>
      </div>
      <div id ='expenses_table_area'>
        <table id ='expenses_table' className='expenses-table'>
          <thead id ='expenses_Th'>
            <tr>
              <th className ='date-column'>日付</th>
              <th className ='week-column'>曜日</th>
              <th className ='destination-column'>行先・経路</th>
              <th className='no-column'></th>
              <th className='no-column'></th>
              <th id ='traveling-column'>交通費</th>
              <th className='no-column'></th>
              <th className='no-column'></th>
              <th id ='stay-column'>宿泊費</th>
              <th className ='all-column'>合計</th>
              <th iclassName ='expenses_remarks-column'>備考</th>
            </tr>
            <tr>
              <th className='date-column'></th>
              <th className ='week-column'></th>
              <th className='destination-column'></th>
              <th id ='train-column'>電車</th>
              <th id ='bus-column'>バス</th>
              <th id ='tax-column'>タクシー</th>
              <th id ='aircraft-column'>航空機</th>
              <th id ='others-column'>その他</th>
              <th id ='total-column'>計</th>
              <th className='all-column'></th>
              <th className='expenses-remarks-column'></th>
            </tr>
          </thead>
          <tbody id='at_tbody'>
          {daysInMonth.map((date) => {
            // const record = findAttendanceRecord(date);
            const isHoliday = holidays.some(holiday => holiday.toDateString() === date.toDateString());
            const dayClass = isWeekend(date) ? (date.getUTCDay() === 6 ? 'saturday' : 'sunday') : (isHoliday ? 'holiday' : '');
            // const isEditing = editingRemarks[date.toISOString()];
            // const isEditing2 = editingRemarks2[date.toISOString()];
            // const isEditingOut = editingOutRemarks[date.toISOString()];
            // const isEditingOut2 = editingOutRemarks2[date.toISOString()];
            
            return (
              <tr key={date.toISOString()} className={dayClass}>
                <td>{date.toLocaleDateString('ja-JP').replace(/\//g, '/')}</td>
                <td>{getDayOfWeek(date)}</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                {/* <td>{record ? formatTime(record.check_in_time) : ''}</td>
                <td onClick={() => toggleEditing(date)}>
                  {isEditing ? (
                    <Dropdown
                      value={record ? record.remarks1 : ''}
                      onChange={(remarks1) => handleRemarksChange1(date, remarks1)}
                    />
                  ) : (
                    record ? record.remarks1 : ''
                  )}
                </td>
                <td onClick={() => toggleEditing2(date)}>
                  {isEditing2 ? (
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder=''
                      className='remarks2-td'
                      style={{ textAlign: 'left', width:'100%', outline: 'none', border: '1px solid #808080'}}
                      value={remarks2}
                      onChange={(e) => handleRemarksChange2(e.target.value)}
                      onClick={() => handleRemarksSave(date)}  
                      onBlur={() => handleRemarksSave(date)}
                    />
                  ) : (
                    record ? formatRemarks(record.remarks2) : ''
                  )}
                </td>
                <td>{record ? formatTime(record.check_out_time) : ''}</td>
                <td onClick={() => toggleOutEditing(date)}>
                  {isEditingOut ? (
                    <Dropdown
                      value={record ? record.out_remarks1 : ''}
                      onChange={(out_remarks1) => handleOutRemarksChange1(date, out_remarks1)}
                    />
                  ) : (
                    record ? record.out_remarks1 : ''
                  )}
                </td>
                <td onClick={() => toggleEditingOut2(date)}>
                  {isEditingOut2 ? (
                    <input
                      ref={inputRef2}
                      type="text"
                      placeholder=''
                      className='remarks2-td'
                      style={{ textAlign: 'left', width:'100%', outline: 'none', border: '1px solid #808080'}}
                      value={out_set_remarks2}
                      onChange={(e) => handleRemarksOutChange2(e.target.value)}
                      onClick={() => handleOutRemarksSave(date)}  
                      onBlur={() => handleOutRemarksSave(date)}
                    />
                  ) : (
                    record ? formatRemarks(record.out_remarks2) : ''
                  )}
                </td>
                <td>{record ? formatTime(record.break_time) : ''}</td>
                <td>{record ? formatTime(record.work_hours) : ''}</td> */}
              </tr>
            );
          })}
        </tbody>
        </table>
      </div>
    </div>
  )
}

export default ExpensesPage;
