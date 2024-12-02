import React, { useEffect, useState, useRef } from 'react';
import holidayJp from '@holiday-jp/holiday_jp';
import { Link, useParams } from 'react-router-dom';
import Dropdown from '../Attendance/AttendancePull';
import Time from '../Attendance/TimePull';
import BreakPull from '../Attendance/BreakPull';
import 'react-datepicker/dist/react-datepicker.css';
import { startOfWeek, endOfWeek, subWeeks } from 'date-fns';

const MemberAttendanceTable = ( ) => {

  const { id } = useParams(); //メンバーIDを取得
  const [userData, setUserData] = useState(null); //メンバー情報を取得
  const [attendanceData, setAttendanceData] = useState([]); //メンバーの勤務データをテーブル用で取得
  const [formattedAttendanceData, setFormattedAttendanceData] = useState([]); //日付を修正した勤怠データ
  const [userWorkHours, setUserWorkHours] = useState(0); //メンバーの勤務データを取得
  const [daysInMonth, setDaysInMonth] = useState([]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [breakTime, setBreakTime] = useState('01:00');
  const [workHours, setWorkHours] = useState('08:00');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [holidaysAndWeekendsCount, setHolidaysAndWeekendsCount] = useState(0);
  const [provisions, setProvisions] = useState(0);
  const [userTotal, setUserTotal] = useState(0);
  const [editingRemarks, setEditingRemarks] = useState({}); // 出勤特記の編集モードを管理するステート
  const [editingRemarks2, setEditingRemarks2] = useState({}); //出勤備考の編集モードを管理するステート
  const [editingOutRemarks, setEditingOutRemarks] = useState({}); // 退勤特記の編集モードを管理するステート
  const [editingOutRemarks2, setEditingOutRemarks2] = useState({}); //退勤備考の編集モードを管理するステート
  const [editingCheckIn, setEditingCheckIn] = useState({}); //出勤時間の編集モードを管理するステート
  const [editingCheckOut, setEditingCheckOut] = useState({}); //退勤時間の編集モードを管理するステート
  const [editingBreak, setEditingBreak] = useState({}); //休憩時間の編集モードを管理するステート
  const [remarks2, setRemarks2] = useState('');  //出勤備考の編集を保存
  const [out_set_remarks2, setOutRemarks2] = useState('');  //出勤備考の編集を保存
  const [dayAverage, setDayAverage] = useState(0); //1日平均勤務時間
  const [monthAverage, setMonthAverage] = useState(0); //月平均勤務時間
  const [weekAverage, setWeekAverage] = useState(0); //直近の1日平均勤務時間
  const [weekMonthAverage, setWeekMonthAverage] = useState(0); //直近の月平均勤務時間
  const [isOvertime, setIsOvertime] = useState(false); //月予測勤務時間が規定を超えるか
  const [isOvertime2, setIsOvertime2] = useState(false); //直近予測勤務時間が規定を超えるか

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
  });

  //ユーザーの勤怠情報を取得
  useEffect(() => {
    const formattedMonth = month.toString().padStart(2, '0');
    const fetchAttendance = async () => {
      try {
        const response = await fetch(`http://localhost:3000/attendance/${id}/${year}/${formattedMonth}`);
        const data = await response.json();
        setUserWorkHours(data);
        setAttendanceData(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching attendance data:', error);
        setAttendanceData([]);
      }
    };
    fetchAttendance();
  }, [year,month,editingRemarks, editingRemarks2, editingOutRemarks, editingOutRemarks2, editingCheckIn, editingCheckOut,editingBreak, id]);

  //勤怠情報の日付を修正
  useEffect(() => {
    if (userWorkHours.length){
      const formattedAttendanceData = attendanceData.map(item => {
        const formattedDate = new Date(item.date).toLocaleDateString('ja-JP', {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric'
        });
  
        return {
          formattedDate,
          work_hours: item.work_hours
        };
      });
      setFormattedAttendanceData(formattedAttendanceData);
    }else{
      const formattedAttendanceData = attendanceData.map(item => {
        const formattedDate = new Date(item.date).toLocaleDateString('ja-JP', {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric'
        });
        return {
          formattedDate,
          work_hours: '00:00'
        };
      });
      setFormattedAttendanceData(formattedAttendanceData);
    }
  }, [userWorkHours, attendanceData]);

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
  }, [year,month,editingRemarks, editingRemarks2, editingOutRemarks, editingOutRemarks2, editingCheckIn, editingCheckOut,editingBreak]); //monthが変更されるたびに実行する

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
    })|| { date: formattedDate, remarks1: '' , remarks2: '' , out_remarks1: '', checkIn:''}; // デフォルトの空の特記を返す;
  };

  // 時間をhh:mm形式でフォーマットする関数
  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const formattedHours = hours ? hours.padStart(2, '0') : '';
    const formattedMinutes = minutes ? minutes.padStart(2, '0') : '';
    return `${formattedHours}:${formattedMinutes}`;
  };

  // 「。」を改行タグに置き換える関数
  const formatRemarks = (remarks) => {
    if (!remarks) return '';
    return remarks.split('。').join('。<br />');
  };

  //出勤時間の編集
  const handleCheckInChange = async (date, newOption, breakTime, check_out_time ,work_hours) => {

    if(work_hours.length){

      if(newOption === ''){
        const accounts_id = id;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // 月は0から始まるため+1
        const day = String(date.getDate()).padStart(2, '0'); // 日付
        const currentDate = `${year}-${month}-${day}`;

        const data = {
          accounts_id,
          date: currentDate,
          check_in_time: ''
        };
      
        try {
          const response = await fetch('http://localhost:3000/time', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          });
          if (response.ok) {
            // 編集モードを解除
            setEditingCheckIn(prev => ({ ...prev, [date.toISOString()]: false }));
            // 新しいデータを追加
            setAttendanceData(prev => {
              const existingRecordIndex = prev.findIndex(record => record.date === currentDate);
              if (existingRecordIndex !== -1) {
                return prev.map(record => 
                  record.date === currentDate ? { ...record, checkIn: newOption } : record
                );
              } else {
                return [...prev, data];
              }
            });
            
          } else {
            alert('データの保存に失敗しました');
          }
        } catch (error) {
          console.error('Error saving data:', error);
          alert('データの保存に失敗しました');
        }
      }else{
        if(check_out_time.length && breakTime.length){
          //勤務時間の合計を再計算
          const startDate = new Date(`1970-01-01T${newOption}`);
          const endDate = new Date(`1970-01-01T${check_out_time}`);
          const diff = endDate - startDate;
          const hours = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');;
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');;
          const all_work_time = `${hours}:${minutes}`;
    
          //勤務時間の合計から休憩時間を引く
          const checkOllTime = new Date(`1970-01-01T${all_work_time}`);
          const checkBreakTime = new Date(`1970-01-01T${breakTime}`);
    
          // 日付の有効性をチェック
          const isValidDate = (date) => date instanceof Date && !isNaN(date);
          if (!isValidDate(checkOllTime) || !isValidDate(checkBreakTime)) {
            return '計算できませんでした';
          }
    
          // 時間の差を計算
          const diff2 =  checkOllTime - checkBreakTime;
          const hours2 = Math.floor(diff2 / 1000 / 60 / 60).toString().padStart(2, '0');;
          const minutes2 = Math.floor((diff2 / 1000 / 60) % 60).toString().padStart(2, '0');;
          const edit_work =  `${hours2}:${minutes2}`;
          const accounts_id = id;
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0'); // 月は0から始まるため+1
          const day = String(date.getDate()).padStart(2, '0'); // 日付
          const currentDate = `${year}-${month}-${day}`;

          const data = {
            accounts_id,
            date: currentDate,
            check_in_time: newOption,
            work_hours: edit_work
          };
          
          try {
            const response = await fetch('http://localhost:3000/time', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(data)
            });
            if (response.ok) {
              // 編集モードを解除
              setEditingCheckIn(prev => ({ ...prev, [date.toISOString()]: false }));
              // 新しいデータを追加
              setAttendanceData(prev => {
                const existingRecordIndex = prev.findIndex(record => record.date === currentDate);
                if (existingRecordIndex !== -1) {
                  return prev.map(record => 
                    record.date === currentDate ? { ...record, checkIn: newOption } : record
                  );
                } else {
                  return [...prev, data];
                }
              });
              
            } else {
              alert('データの保存に失敗しました');
            }
          } catch (error) {
            console.error('Error saving data:', error);
            alert('データの保存に失敗しました');
          }
        }else if(check_out_time.length){
          //勤務時間の合計を再計算
          const startDate = new Date(`1970-01-01T${newOption}`);
          const endDate = new Date(`1970-01-01T${check_out_time}`);
          const diff = endDate - startDate;
          const hours = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');;
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');;
          const all_work_time = `${hours}:${minutes}`;
          const accounts_id = id;
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0'); // 月は0から始まるため+1
          const day = String(date.getDate()).padStart(2, '0'); // 日付
          const currentDate = `${year}-${month}-${day}`;
    
          const data = {
            accounts_id,
            date: currentDate,
            check_in_time: newOption,
            work_hours: all_work_time,
          };
          
          try {
            const response = await fetch('http://localhost:3000/time', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(data)
            });
            if (response.ok) {
              // 編集モードを解除
              setEditingCheckIn(prev => ({ ...prev, [date.toISOString()]: false }));
              // 新しいデータを追加
              setAttendanceData(prev => {
                const existingRecordIndex = prev.findIndex(record => record.date === currentDate);
                if (existingRecordIndex !== -1) {
                  return prev.map(record => 
                    record.date === currentDate ? { ...record, checkIn: newOption } : record
                  );
                } else {
                  return [...prev, data];
                }
              });
              
            } else {
              alert('データの保存に失敗しました');
            }
          } catch (error) {
            console.error('Error saving data:', error);
            alert('データの保存に失敗しました');
          }
        }
      }
    }else {
      const accounts_id = id;
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // 月は0から始まるため+1
      const day = String(date.getDate()).padStart(2, '0'); // 日付
      const currentDate = `${year}-${month}-${day}`;

      const data = {
        accounts_id,
        date: currentDate,
        check_in_time: newOption,
        is_checked_in: true
      };
      
      try {
        const response = await fetch('http://localhost:3000/time', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        if (response.ok) {
          // 編集モードを解除
          setEditingCheckIn(prev => ({ ...prev, [date.toISOString()]: false }));
          // 新しいデータを追加
          setAttendanceData(prev => {
            const existingRecordIndex = prev.findIndex(record => record.date === currentDate);
            if (existingRecordIndex !== -1) {
              return prev.map(record => 
                record.date === currentDate ? { ...record, checkIn: newOption } : record
              );
            } else {
              return [...prev, data];
            }
          });
        } else {
          alert('データの保存に失敗しました');
        }
      } catch (error) {
        console.error('Error saving data:', error);
        alert('データの保存に失敗しました');
      }
    }
  };

  const toggleCheckInEditing = (date) => {
    setEditingCheckIn(prev => ({ ...prev, [date.toISOString()]: !prev[date.toISOString()] }));
  };

  //退勤時間の編集
  const handleCheckOutChange = async (date, newOption, breakTime, check_in_time , work_hours) => {

    if(newOption === ''){
      const accounts_id = id;
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // 月は0から始まるため+1
      const day = String(date.getDate()).padStart(2, '0'); // 日付
      const currentDate = `${year}-${month}-${day}`;

      const data = {
        accounts_id,
        date: currentDate,
        check_out_time: '',
      };

      try {
        const response = await fetch('http://localhost:3000/time', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        if (response.ok) {
          // 編集モードを解除
          setEditingCheckOut(prev => ({ ...prev, [date.toISOString()]: false }));
          // 新しいデータを追加
          setAttendanceData(prev => {
            const existingRecordIndex = prev.findIndex(record => record.date === currentDate);
            if (existingRecordIndex !== -1) {
              return prev.map(record => 
                record.date === currentDate ? { ...record, checkOut: newOption } : record
              );
            } else {
              return [...prev, data];
            }
          });
          
        } else {
          alert('データの保存に失敗しました');
        }
      } catch (error) {
        console.error('Error saving data:', error);
        alert('データの保存に失敗しました');
      }
    }else{
      if(check_in_time.length && breakTime.length){
        //勤務時間の合計を再計算
        const startDate = new Date(`1970-01-01T${check_in_time}`);
        const endDate = new Date(`1970-01-01T${newOption}`);

        // 退勤時間が出勤時間よりも前の場合、日付が変わったと見なす 
        if (endDate < startDate) { 
          endDate.setDate(endDate.getDate() + 1); 
        }

        const diff = endDate - startDate;
        const hours = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');;
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');;
        const all_work_time = `${hours}:${minutes}`;
  
        //勤務時間の合計から休憩時間を引く
        const checkOllTime = new Date(`1970-01-01T${all_work_time}`);
        const checkBreakTime = new Date(`1970-01-01T${breakTime}`);
  
        // 日付の有効性をチェック
        const isValidDate = (date) => date instanceof Date && !isNaN(date);
        if (!isValidDate(checkOllTime) || !isValidDate(checkBreakTime)) {
          return '計算できませんでした';
        }
  
        // 時間の差を計算
        const diff2 =  checkOllTime - checkBreakTime;
        const hours2 = Math.floor(diff2 / 1000 / 60 / 60).toString().padStart(2, '0');;
        const minutes2 = Math.floor((diff2 / 1000 / 60) % 60).toString().padStart(2, '0');;
        const edit_work =  `${hours2}:${minutes2}`;
        const accounts_id = id;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // 月は0から始まるため+1
        const day = String(date.getDate()).padStart(2, '0'); // 日付
        const currentDate = `${year}-${month}-${day}`;
  
        const data = {
          accounts_id,
          date: currentDate,
          check_out_time: newOption,
          work_hours: edit_work
        };
        
        try {
          const response = await fetch('http://localhost:3000/time', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          });
          if (response.ok) {
            // 編集モードを解除
            setEditingCheckOut(prev => ({ ...prev, [date.toISOString()]: false }));
            // 新しいデータを追加
            setAttendanceData(prev => {
              const existingRecordIndex = prev.findIndex(record => record.date === currentDate);
              if (existingRecordIndex !== -1) {
                return prev.map(record => 
                  record.date === currentDate ? { ...record, checkOut: newOption } : record
                );
              } else {
                return [...prev, data];
              }
            });
            
          } else {
            alert('データの保存に失敗しました');
          }
        } catch (error) {
          console.error('Error saving data:', error);
          alert('データの保存に失敗しました');
        }
      }else if(check_in_time.length){
        //勤務時間の合計を再計算
        const startDate = new Date(`1970-01-01T${check_in_time}`);
        const endDate = new Date(`1970-01-01T${newOption}`);

        // 退勤時間が出勤時間よりも前の場合、日付が変わったと見なす 
        if (endDate < startDate) { 
          endDate.setDate(endDate.getDate() + 1); 
        }

        const diff = endDate - startDate;
        const hours = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');;
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');;
        const all_work_time = `${hours}:${minutes}`;
        const accounts_id = id;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // 月は0から始まるため+1
        const day = String(date.getDate()).padStart(2, '0'); // 日付
        const currentDate = `${year}-${month}-${day}`;
  
        const data = {
          accounts_id,
          date: currentDate,
          check_out_time: newOption,
          work_hours: all_work_time
        };
        
        try {
          const response = await fetch('http://localhost:3000/time', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          });
          if (response.ok) {
            // 編集モードを解除
            setEditingCheckOut(prev => ({ ...prev, [date.toISOString()]: false }));
            // 新しいデータを追加
            setAttendanceData(prev => {
              const existingRecordIndex = prev.findIndex(record => record.date === currentDate);
              if (existingRecordIndex !== -1) {
                return prev.map(record => 
                  record.date === currentDate ? { ...record, checkOut: newOption } : record
                );
              } else {
                return [...prev, data];
              }
            });
            
          } else {
            alert('データの保存に失敗しました');
          }
        } catch (error) {
          console.error('Error saving data:', error);
          alert('データの保存に失敗しました');
        }
      }
    }
  };

  const toggleCheckOutEditing = (date) => {
    setEditingCheckOut(prev => ({ ...prev, [date.toISOString()]: !prev[date.toISOString()] }));
  };

  //休憩時間の編集
  const handleBreakChange = async (date, newOption, check_in_time , check_out_time , work_hours) => {

    if(newOption === ''){
      const accounts_id = id;
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // 月は0から始まるため+1
      const day = String(date.getDate()).padStart(2, '0'); // 日付
      const currentDate = `${year}-${month}-${day}`;

      const data = {
        accounts_id,
        date: currentDate,
        break_time: '',
      };
      
      try {
        const response = await fetch('http://localhost:3000/time', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        if (response.ok) {
          // 編集モードを解除
          setEditingBreak(prev => ({ ...prev, [date.toISOString()]: false }));
          // 新しいデータを追加
          setAttendanceData(prev => {
            const existingRecordIndex = prev.findIndex(record => record.date === currentDate);
            if (existingRecordIndex !== -1) {
              return prev.map(record => 
                record.date === currentDate ? { ...record, breakTimeEdit: newOption } : record
              );
            } else {
              return [...prev, data];
            }
          });
          
        } else {
          alert('データの保存に失敗しました');
        }
      } catch (error) {
        console.error('Error saving data:', error);
        alert('データの保存に失敗しました');
      }
    }else{
      if(work_hours.length ){

        //勤務時間の合計を再計算
        const startDate = new Date(`1970-01-01T${check_in_time}`);
        const endDate = new Date(`1970-01-01T${check_out_time}`);

        // 退勤時間が出勤時間よりも前の場合、日付が変わったと見なす 
        if (endDate < startDate) { 
          endDate.setDate(endDate.getDate() + 1); 
        }
        
        const diff = endDate - startDate;
        const hours = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');;
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');;
        const all_work_time = `${hours}:${minutes}`;
  
        //勤務時間の合計から休憩時間を引く
        const checkOllTime = new Date(`1970-01-01T${all_work_time}`);
        const checkBreakTime = new Date(`1970-01-01T${newOption}`);
  
        // 日付の有効性をチェック
        const isValidDate = (date) => date instanceof Date && !isNaN(date);
        if (!isValidDate(checkOllTime) || !isValidDate(checkBreakTime)) {
          return '計算できませんでした';
        }
  
        // 時間の差を計算
        const diff2 =  checkOllTime - checkBreakTime;
        const hours2 = Math.floor(diff2 / 1000 / 60 / 60).toString().padStart(2, '0');;
        const minutes2 = Math.floor((diff2 / 1000 / 60) % 60).toString().padStart(2, '0');;
        const edit_work =  `${hours2}:${minutes2}`;
        const accounts_id = id;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // 月は0から始まるため+1
        const day = String(date.getDate()).padStart(2, '0'); // 日付
        const currentDate = `${year}-${month}-${day}`;
  
        const data = {
          accounts_id,
          date: currentDate,
          break_time: newOption,
          work_hours: edit_work
        };
        
        try {
          const response = await fetch('http://localhost:3000/time', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          });
          if (response.ok) {
            // 編集モードを解除
            setEditingBreak(prev => ({ ...prev, [date.toISOString()]: false }));
            // 新しいデータを追加
            setAttendanceData(prev => {
              const existingRecordIndex = prev.findIndex(record => record.date === currentDate);
              if (existingRecordIndex !== -1) {
                return prev.map(record => 
                  record.date === currentDate ? { ...record, breakTimeEdit: newOption } : record
                );
              } else {
                return [...prev, data];
              }
            });
          } else {
            alert('データの保存に失敗しました');
          }
        } catch (error) {
          console.error('Error saving data:', error);
          alert('データの保存に失敗しました');
        }
      }if(check_in_time.length ){
        const accounts_id = id;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // 月は0から始まるため+1
        const day = String(date.getDate()).padStart(2, '0'); // 日付
        const currentDate = `${year}-${month}-${day}`;

        const data = {
          accounts_id,
          date: currentDate,
          break_time: newOption,
        };
        
        try {
          const response = await fetch('http://localhost:3000/time', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          });
          if (response.ok) {
            // 編集モードを解除
            setEditingBreak(prev => ({ ...prev, [date.toISOString()]: false }));
            // 新しいデータを追加
            setAttendanceData(prev => {
              const existingRecordIndex = prev.findIndex(record => record.date === currentDate);
              if (existingRecordIndex !== -1) {
                return prev.map(record => 
                  record.date === currentDate ? { ...record, breakTimeEdit: newOption } : record
                );
              } else {
                return [...prev, data];
              }
            });
            
          } else {
            alert('データの保存に失敗しました');
          }
        } catch (error) {
          console.error('Error saving data:', error);
          alert('データの保存に失敗しました');
        }
      }
    }
  };

  const toggleBreakEditing = (date) => {
    setEditingBreak(prev => ({ ...prev, [date.toISOString()]: !prev[date.toISOString()] }));
  };

  //出勤特記の編集
  const handleRemarksChange1 = async (date, newOption) => {
    const accounts_id = id;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月は0から始まるため+1
    const day = String(date.getDate()).padStart(2, '0'); // 日付
    const currentDate = `${year}-${month}-${day}`;

    const data = {
      accounts_id,
      date: currentDate,
      remarks1: newOption
    };
    try {
      const response = await fetch('http://localhost:3000/remarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        // 編集モードを解除
        setEditingRemarks(prev => ({ ...prev, [date.toISOString()]: false }));
        // 新しいデータを追加
        setAttendanceData(prev => {
          const existingRecordIndex = prev.findIndex(record => record.date === currentDate);
          if (existingRecordIndex !== -1) {
            return prev.map(record => 
              record.date === currentDate ? { ...record, remarks1: newOption } : record
            );
          } else {
            return [...prev, data];
          }
        });
      } else {
        alert('データの保存に失敗しました');
      }
    } catch (error) {
      console.error('Error saving data:', error);
      alert('データの保存に失敗しました');
    }
  };

  const toggleEditing = (date) => {
    setEditingRemarks(prev => ({ ...prev, [date.toISOString()]: !prev[date.toISOString()] }));
  };

  //退勤特記の編集
  const handleOutRemarksChange1 = async (date, newOption) => {
    const accounts_id = id;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月は0から始まるため+1
    const day = String(date.getDate()).padStart(2, '0'); // 日付
    const currentDate = `${year}-${month}-${day}`;

    const data = {
      accounts_id,
      date: currentDate,
      out_remarks1: newOption
    };
    try {
      const response = await fetch('http://localhost:3000/remarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        // 編集モードを解除
        setEditingOutRemarks(prev => ({ ...prev, [date.toISOString()]: false }));
        // 新しいデータを追加
        setAttendanceData(prev => {
          const existingRecordIndex = prev.findIndex(record => record.date === currentDate);
          if (existingRecordIndex !== -1) {
            return prev.map(record => 
              record.date === currentDate ? { ...record, out_remarks1: newOption } : record
            );
          } else {
            return [...prev, data];
          }
        });
      } else {
        alert('データの保存に失敗しました');
      }
    } catch (error) {
      console.error('Error saving data:', error);
      alert('データの保存に失敗しました');
    }
  };

  const toggleOutEditing = (date) => {
    setEditingOutRemarks(prev => ({ ...prev, [date.toISOString()]: !prev[date.toISOString()] }));
  };

  //出勤備考の編集
  const handleRemarksChange2 = (newOption) => {
    setRemarks2(newOption);
  };
  
  const handleRemarksSave = async (date) => {
    const accounts_id = id;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月は0から始まるため+1
    const day = String(date.getDate()).padStart(2, '0'); // 日付
    const currentDate = `${year}-${month}-${day}`;

    const data = {
      accounts_id,
      date: currentDate,
      remarks2: remarks2
    };
    try {
      const response = await fetch('http://localhost:3000/remarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      setEditingRemarks2(remarks2);
      if (response.ok) {
        setAttendanceData(prev => {
          const existingRecordIndex = prev.findIndex(record => record.date === currentDate);
          if (existingRecordIndex !== -1) {
            return prev.map(record => 
              record.date === currentDate ? { ...record, remarks2 } : record
            );
          } else {
            return [...prev, data];
          }
        });
      } else {
        alert('データの保存に失敗しました');
      }
    } catch (error) {
      console.error('Error saving data:', error);
      alert('データの保存に失敗しました');
    }
  };
  
  const toggleEditing2 = (date) => {
    setEditingRemarks2(prev => ({ ...prev, [date.toISOString()]: !prev[date.toISOString()] }));
  };

  const inputRef = useRef(null);

  useEffect(() => {
    if (editingRemarks2 && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingRemarks2]);

  //退勤備考の編集
  const handleRemarksOutChange2 = (newOption) => {
    setOutRemarks2(newOption);
  };
  
  const handleOutRemarksSave = async (date) => {
    const accounts_id = id;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月は0から始まるため+1
    const day = String(date.getDate()).padStart(2, '0'); // 日付
    const currentDate = `${year}-${month}-${day}`;

    const data = {
      accounts_id,
      date: currentDate,
      out_remarks2: out_set_remarks2
    };
    try {
      const response = await fetch('http://localhost:3000/remarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      setEditingOutRemarks2(out_set_remarks2);
      if (response.ok) {
        setAttendanceData(prev => {
          const existingRecordIndex = prev.findIndex(record => record.date === currentDate);
          if (existingRecordIndex !== -1) {
            return prev.map(record => 
              record.date === currentDate ? { ...record, out_set_remarks2 } : record
            );
          } else {
            return [...prev, data];
          }
        });
      } else {
        alert('データの保存に失敗しました');
      }
    } catch (error) {
      console.error('Error saving data:', error);
      alert('データの保存に失敗しました');
    }
  };
  
  const toggleEditingOut2 = (date) => {
    setEditingOutRemarks2(prev => ({ ...prev, [date.toISOString()]: !prev[date.toISOString()] }));
  };

  const inputRef2 = useRef(null);

  useEffect(() => {
    if (editingOutRemarks2 && inputRef2.current) {
      inputRef2.current.focus();
    }
  }, [editingOutRemarks2]);

  //通常勤怠情報の処理
  //ユーザーIDをもとに残業情報を取得、データがあればインプットにデフォルト表示
  useEffect(() => {
    const accounts_id = id;
    fetch(`http://localhost:3000/overuser/${accounts_id}`, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.start_time) setStartTime(data.start_time);
      if (data.end_time) setEndTime(data.end_time);
      if (data.break_time) setBreakTime(data.break_time);
    })
    .catch(err => console.log(err));
  });

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
    if (!timeString) return 0; // または適切なデフォルト値
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const convertMinutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60).toString().padStart(2, '0');
    const mins = (minutes % 60).toString().padStart(2, '0');
    return `${hours}:${mins}`;
  };

  useEffect(() => {
    if (startTime && endTime && breakTime) { //標準勤務時間
      const WorkHours = CalculateWorkHours2(work_hours, breakTime);
      setWorkHours(WorkHours);

      // workHoursを分単位に変換し、勤務日数を掛ける
      const workHoursInMinutes = convertTimeToMinutes(WorkHours);
      //規定勤務時間の分数
      const multipliedWorkHoursInMinutes = workHoursInMinutes * holidaysAndWeekendsCount;

      // 分単位の時間をhh:mm形式に変換
      const hours = Math.floor(multipliedWorkHoursInMinutes / 60).toString().padStart(2, '0');
      const minutes = (multipliedWorkHoursInMinutes % 60).toString().padStart(2, '0');
      const multipliedWorkHours = `${hours}:${minutes}`;
      
      //一か月の規定勤務時間
      setProvisions(multipliedWorkHours);
    }
  }, [startTime, endTime, breakTime, workHours, userWorkHours, month, year, holidaysAndWeekendsCount, work_hours]);

  useEffect(() => {
    // 配列から今月の勤務データの数を取得
    const workHoursCount = formattedAttendanceData.filter(item => item.work_hours !== null).length;

    // ユーザーの一か月の総勤務時間を引く
    if (workHoursCount > 0) {
      const allWorkHours = userWorkHours.map(record => record.work_hours);
      const totalWorkHours = allWorkHours.reduce((acc, curr) => {
        const totalMinutes = acc + convertTimeToMinutes(curr);
        return totalMinutes;
      }, 0);

      const totalWorkHoursTime = convertMinutesToTime(totalWorkHours);

      // workHoursを分単位に変換し、勤務日数で割る
      const multipliedWorkHoursInMinutes2 = totalWorkHours / workHoursCount;
      const flooredNumber = Math.floor(multipliedWorkHoursInMinutes2 * 10) / 10;
      // 分単位の時間をhh:mm形式に変換
      const hours2 = Math.floor(flooredNumber / 60).toString().padStart(2, '0');
      const minutes2 = Math.floor(flooredNumber % 60).toString().padStart(2, '0'); 
      const multipliedWorkHours2 = `${hours2}:${minutes2}`;
      //1日平均勤務時間
      setDayAverage(multipliedWorkHours2);

      const workHoursInMinutes = convertTimeToMinutes(multipliedWorkHours2);

      //月予測勤務時間の分数
      const multipliedWorkHoursInMinutes = workHoursInMinutes * holidaysAndWeekendsCount;
      
      if (multipliedWorkHoursInMinutes > 12000) { 
        setIsOvertime(true); 
      } else { 
        setIsOvertime(false);
      } 

      // 分単位の時間をhh:mm形式に変換
      const hours = Math.floor(multipliedWorkHoursInMinutes / 60).toString().padStart(2, '0');
      const minutes = (multipliedWorkHoursInMinutes % 60).toString().padStart(2, '0');
      const multipliedWorkHours = `${hours}:${minutes}`;
      //月予測勤務時間
      setMonthAverage(multipliedWorkHours);
      
      //今月の稼働時間
      setUserTotal(totalWorkHoursTime);
    }else {
      //今月の稼働時間
      setUserTotal('00:00');
      //1日平均勤務時間
      setDayAverage('00:00');
      //月予測勤務時間
      setMonthAverage('00:00');
      setIsOvertime(false);
    }
  },[formattedAttendanceData, holidaysAndWeekendsCount, userWorkHours]);

  useEffect(() => {
    const today = new Date();
    
    // 1週間前の同じ曜日の日付を取得
    const oneWeekAgo = subWeeks(today, 1);
    // 先週の月曜日の日付を取得
    const lastMonday = startOfWeek(oneWeekAgo, { weekStartsOn: 1 });
    // 先週の日曜日の日付を取得
    const lastSunday = endOfWeek(oneWeekAgo, { weekStartsOn: 1 });
  
    // 日付の時刻部分をクリア（00:00:00に設定）
    lastMonday.setHours(0, 0, 0, 0);
    lastSunday.setHours(23, 59, 59, 999);

    // 現在の年月を取得
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // 0から始まるので注意

    // 配列から先週一週間のデータをフィルタリングし、今月のデータのみを取得
    const filterLastWeekData = formattedAttendanceData.filter(item => {
      const itemDate = new Date(item.formattedDate);
      const itemYear = itemDate.getFullYear();
      const itemMonth = itemDate.getMonth() + 1;
      
      return itemDate >= lastMonday && itemDate <= lastSunday && itemYear === currentYear && itemMonth === currentMonth;
    });
    
    if(filterLastWeekData.length){

      const workHoursCount = filterLastWeekData.filter(item => item.work_hours !== null).length;
      const totalMinutes = filterLastWeekData.reduce((total, item) => { 
        return total + convertTimeToMinutes(item.work_hours || '0:00'); // work_hours が null の場合のデフォルト値を設定 
      }, 0); 

      // workHoursを分単位に変換し、勤務日数で割る
      const multipliedWorkHoursInMinutes2 = totalMinutes / workHoursCount;
      const flooredNumber = Math.floor(multipliedWorkHoursInMinutes2 * 10) / 10;
      
      // 分単位の時間をhh:mm形式に変換
      const hours2 = Math.floor(flooredNumber / 60).toString().padStart(2, '0');
      const minutes2 = Math.floor(flooredNumber % 60).toString().padStart(2, '0'); 
      const multipliedWorkHours2 = `${hours2}:${minutes2}`;
      
      //先週の1日平均勤務時間
      setWeekAverage(multipliedWorkHours2);

      const holiday = holidaysAndWeekendsCount;
      const workHoursInMinutes = convertTimeToMinutes(multipliedWorkHours2);
      const multipliedWorkHoursInMinutes = workHoursInMinutes * holiday;

      if (multipliedWorkHoursInMinutes > 12000) { 
        setIsOvertime2(true); 
      } else { 
        setIsOvertime2(false);
      } 

      // 分単位の時間をhh:mm形式に変換
      const hours = Math.floor(multipliedWorkHoursInMinutes / 60).toString().padStart(2, '0');
      const minutes = (multipliedWorkHoursInMinutes % 60).toString().padStart(2, '0');
      const multipliedWorkHours = `${hours}:${minutes}`;
      //直近月予測勤務時間
      setWeekMonthAverage(multipliedWorkHours);
      
      convertMinutesToTime(totalMinutes); 
    }else{
      //先週の1日平均勤務時間
      setWeekAverage('00:00');
      //直近月予測勤務時間
      setWeekMonthAverage('00:00');
      setIsOvertime2(false);
    }
  }, [formattedAttendanceData, holidaysAndWeekendsCount]);

  useEffect(() => {
    const accounts_id = id;
    fetch(`http://localhost:3000/projects/${accounts_id}`, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .catch(err => console.log(err));
  });

const holidays = getHolidaysInMonth(year, month);

  return (
    <div id='table_flex2'>
      <div id='member_attendance_user2'> 
        {userData && <p id='atUser'>ユーザー名: {userData.fullname} さん</p>}
      </div>
      <h1 id='member_at_h1'>勤怠修正</h1>
      <div id='attendance_table_box2'>
        <div id='table_top_menu2'>
          <div id='all_overwork'>
            <p>
              <span className="label">今月の総稼働時間 :</span>
              <span className="value">{userTotal}</span>
            </p>
            <p>
              <span className="label">1日平均稼働時間 :</span>
              <span className="value">{dayAverage}</span>
            </p>
            <p>
              <span className="label">月予測稼働時間 :</span>
              <span className={`${isOvertime ? 'overtime' : 'value'}`}>
                {monthAverage}
              </span>
            </p>
            <p>
              <span className="label">先週の1日平均稼働時間 :</span>
              <span className="value">{weekAverage}</span>
            </p>
            <p>
              <span className="label">直近月予測稼働時間 :</span>
              <span className={`${isOvertime2 ? 'overtime' : 'value'}`}>
                {weekMonthAverage}
              </span>
            </p>
            <p>
              <span className="label">今月の規定勤務時間 :</span>
              <span className="value">{provisions}</span>
            </p>
          </div>
          <div id='at_ym2'>
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
            <h2 id='member_at_h2'>{year}年 {month}月</h2>
          </div>
        </div>
        <div id='atTable2'>
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
            <tbody id='at_tbody'>{daysInMonth.map((date) => {
              const record = findAttendanceRecord(date);
              const isHoliday = holidays.some(holiday => holiday.toDateString() === date.toDateString());
              const dayClass = isWeekend(date) ? (date.getUTCDay() === 6 ? 'saturday' : 'sunday') : (isHoliday ? 'holiday' : '');
              const isEditing = editingRemarks[date.toISOString()];
              const isEditing2 = editingRemarks2[date.toISOString()];
              const isEditingOut = editingOutRemarks[date.toISOString()];
              const isEditingOut2 = editingOutRemarks2[date.toISOString()];
              const isEditingCheckIn = editingCheckIn[date.toISOString()];
              const isEditingCheckOut = editingCheckOut[date.toISOString()];
              const isEditingBreak = editingBreak[date.toISOString()];
              
              return (
                <tr key={date.toISOString()} className={dayClass}>
                  <td>{date.toLocaleDateString('ja-JP').replace(/\//g, '/')}</td>
                  <td>{getDayOfWeek(date)}</td>
                  <td onClick={() => toggleCheckInEditing(date)}>
                    {isEditingCheckIn ? (
                      <Time
                        value={record ? formatTime(record.check_in_time) : ''}
                        onChange={(check_in_time) => handleCheckInChange(date, check_in_time,
                        record ? formatTime(record.break_time) : '', record ? formatTime(record.check_out_time) : '',
                        record ? formatTime(record.work_hours) : '')
                        }
                      />
                    ) : (
                      record ? formatTime(record.check_in_time) : ''
                    )}
                  </td>
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
                  <td onClick={() => toggleCheckOutEditing(date)}>
                    {isEditingCheckOut ? (
                      <Time
                        value={record ? formatTime(record.check_out_time) : ''}
                        onChange={(check_out_time) => handleCheckOutChange(date, check_out_time,
                        record ? formatTime(record.break_time) : '', record ? formatTime(record.check_in_time) : '',
                        record ? formatTime(record.work_hours) : '')
                        }
                      />
                    ) : (
                      record ? formatTime(record.check_out_time) : ''
                    )}
                  </td>
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
                  <td onClick={() => toggleBreakEditing(date)}>
                    {isEditingBreak ? (
                      <BreakPull
                        value={record ? formatTime(record.break_time) : ''}
                        onChange={(break_time) => handleBreakChange(date, break_time,
                          record ? formatTime(record.check_in_time) : '', record ? formatTime(record.check_out_time) : '',
                          record ? formatTime(record.work_hours) : '')
                        }
                      />
                    ) : (
                      record ? formatTime(record.break_time) : ''
                    )}
                  </td>
                  <td>{record ? formatTime(record.work_hours) : ''}</td>
                </tr>
              );
            })}
            </tbody>
          </table>
        </div>
      </div>
      <div id='attendance_link_area2'>
        <Link to="/member" id='account_top_link'>← メンバー管理ページ</Link>
      </div>
    </div>
  );
};

export default MemberAttendanceTable;