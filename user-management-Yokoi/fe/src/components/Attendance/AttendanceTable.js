import React, { useEffect, useState,useRef } from 'react';
import holidayJp from '@holiday-jp/holiday_jp';
import { Link, useNavigate } from 'react-router-dom';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import Dropdown from './AttendancePull';
import UserModal from './UserModal';
import TimeModal from './TimeModal';
import { startOfWeek, endOfWeek, subWeeks } from 'date-fns';

const AttendanceTablePage = ( ) => {
  
  const id = localStorage.getItem('user'); //ユーザーID
  const accounts_id = localStorage.getItem('user');//ユーザーID
  const [userData, setUserData] = useState(null); //ユーザーデータ
  const [attendanceData, setAttendanceData] = useState([]); //ユーザーの勤怠データ
  const [userWorkHours, setUserWorkHours] = useState(0); //勤務時間を計算するための勤怠データ
  const [formattedAttendanceData, setFormattedAttendanceData] = useState([]); //日付を修正した勤怠データ
  const [daysInMonth, setDaysInMonth] = useState([]); //勤怠を表示する年月
  const [year, setYear] = useState(new Date().getFullYear()); //勤怠を表示する年
  const [month, setMonth] = useState(new Date().getMonth() + 1); //勤怠を表示する月
  const [overData, setOverData] = useState({}); //標準勤務時間
  const [startTime, setStartTime] = useState('09:00'); //標準勤務時間
  const [endTime, setEndTime] = useState('18:00');//標準勤務時間
  const [breakTime, setBreakTime] = useState('01:00');//標準勤務時間
  const [workHours, setWorkHours] = useState('08:00');//標準勤務時間
  const [holidaysAndWeekendsCount, setHolidaysAndWeekendsCount] = useState(0); //今月の規定勤務日数
  const [provisions, setProvisions] = useState(0); //今月の規定勤務時間
  const [userTotal, setUserTotal] = useState(0); //今月の実際の稼働時間
  const [dayAverage, setDayAverage] = useState(0); //1日平均勤務時間
  const [monthAverage, setMonthAverage] = useState(0); //月平均勤務時間
  const [weekAverage, setWeekAverage] = useState(0); //直近の1日平均勤務時間
  const [weekMonthAverage, setWeekMonthAverage] = useState(0); //直近の月平均勤務時間
  const [isOvertime, setIsOvertime] = useState(false); //月予測勤務時間が規定を超えるか
  const [isOvertime2, setIsOvertime2] = useState(false); //直近予測勤務時間が規定を超えるか
  const [projects, setProjects] = useState('');
  const [company, setCompany] = useState('');
  const [name, setName] = useState('');
  const [editingRemarks, setEditingRemarks] = useState({}); // 出勤特記の編集モードを管理するステート
  const [editingRemarks2, setEditingRemarks2] = useState({}); //出勤備考の編集モードを管理するステート
  const [editingOutRemarks, setEditingOutRemarks] = useState({}); // 退勤特記の編集モードを管理するステート
  const [editingOutRemarks2, setEditingOutRemarks2] = useState({}); //退勤備考の編集モードを管理するステート
  const [remarks1, setRemarks1] = useState(''); 
  const [remarks2, setRemarks2] = useState(''); 
  const [out_set_remarks1, setOutRemarks1] = useState(''); 
  const [out_set_remarks2, setOutRemarks2] = useState(''); 
  const [expensesData, setExpensesData] = useState([]); //交通費データ
  const [holidayData, setHolidayData] = useState([]); //代休データ
  const [items, setItems] = useState([]); //プロジェクト情報
  const [items2, setItems2] = useState([]); //標準勤務時間情報

  const navigate = useNavigate();

  const expensesClick = () => {
    navigate('/expenses');
  };

  const holidayClick = () => {
    navigate('/holiday');
  };
  
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
    const formattedMonth = month.toString().padStart(2, '0');
    const fetchAttendance = async () => {
      try {
        const response = await fetch(`http://localhost:3000/attendance/${accounts_id}/${year}/${formattedMonth}`);
        const data = await response.json();
        setUserWorkHours(data);
        setAttendanceData(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching attendance data:', error);
        setAttendanceData([]);
      }
    };
    fetchAttendance();
  }, [year, month, editingRemarks, editingRemarks2, editingOutRemarks, editingOutRemarks2]);

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
  }, [userWorkHours]);
  
  //ユーザーの交通費情報を取得
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await fetch(`http://localhost:3000/expenses/${accounts_id}/${month}`);
        const data = await response.json();
        setExpensesData(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching attendance data:', error);
        setExpensesData([]);
      }
    };
    fetchExpenses();
  }, [year, month]);

  //ユーザーの代休情報を取得
  useEffect(() => {
    const fetchHoliday = async () => {
      try {
        const response = await fetch(`http://localhost:3000/holiday/${accounts_id}`);
        const data = await response.json();
        setHolidayData(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching attendance data:', error);
        setHolidayData([]);
      }
    };
    fetchHoliday();
  }, [year, month]);

  //プロジェクト情報
  useEffect(() => {
    const fetchUser = async () => {
    try {
        const response = await fetch(`http://localhost:3000/projects/${accounts_id}`);
        const data = await response.json();
        setItems(data);
        if (data.project ) setProjects(data.project);
        if (data.company) setCompany(data.company);
        if (data.name) setName(data.name);
    } catch (error) {
        console.error('Error fetching holiday data:', error);
    }
    };
    fetchUser();
}, [year,month]);

  const addItemToState = (item) => {
    window.location.reload();
    setItems(prevItems => [...prevItems, item]);
  };

  const addItemToState2 = (item) => {
    window.location.reload();
    setItems2(prevItems => [...prevItems, item]);
  };

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
  }, [year,month,editingRemarks, editingRemarks2, editingOutRemarks, editingOutRemarks2]); //monthが変更されるたびに実行する

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
    })|| { date: formattedDate, remarks1: '' , remarks2: '' ,out_remarks1: '' }; // デフォルトの空の特記を返す;
  };

  //出勤特記の編集
  const handleRemarksChange1 = async (date, newOption) => {
    setRemarks1(newOption);
    const currentDate = date.toISOString().split('T')[0];
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
    setOutRemarks1(newOption);
    const currentDate = date.toISOString().split('T')[0];
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
    const currentDate = date.toISOString().split('T')[0];
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
        //setEditingRemarks(prev => ({ ...prev, [date.toISOString()]: false }));
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
    const currentDate = date.toISOString().split('T')[0];
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
        //setEditingRemarks(prev => ({ ...prev, [date.toISOString()]: false }));
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

  //通常勤怠情報の処理
  //ユーザーIDをもとに標準勤務時間を取得
  useEffect(() => {
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

  //勤務時間を計算
  //日数計算するために分単位に変換
  const convertTimeToMinutes = (timeString) => {
    if (!timeString) return 0; // または適切なデフォルト値
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  //分単位を時間にフォーマット
  const convertMinutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60).toString().padStart(2, '0');
    const mins = (minutes % 60).toString().padStart(2, '0');
    return `${hours}:${mins}`;
  };

  //時間からマイナスを消す
  const removeNegativeSign = (timeString) => {
    if (timeString.startsWith('-')) {
      return timeString.slice(1);
    }
    return timeString;
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
  }, [startTime, endTime, breakTime, workHours, userWorkHours, month, year]);





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
  },[formattedAttendanceData]);

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
      //const flooredNumber = Math.floor(multipliedWorkHoursInMinutes2);
      
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
      
      const totalWorkHoursTime = convertMinutesToTime(totalMinutes); 
      console.log(`先週の合計勤務時間: ${totalWorkHoursTime}`); 
      console.log(`先週の1日平均勤務時間: ${multipliedWorkHours2}`); 
    }else{
      //先週の1日平均勤務時間
      setWeekAverage('00:00');
      //直近月予測勤務時間
      setWeekMonthAverage('00:00');
      setIsOvertime2(false);
    }
  }, [formattedAttendanceData]);

  const exportToExcel = async () => {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const allDates = [];
    const allDates2 = [];
    const allDates3 = [];
  
    for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
      allDates.push(new Date(d));
      allDates2.push(new Date(d));
    }
  
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('勤怠表');
    
    // 勤怠表のタイトルを追加
    worksheet.mergeCells('A1:J1'); // セルを結合
    const titleCell = worksheet.getCell('A1');
    titleCell.value = '勤務表';
    titleCell.font = { size: 20, bold: true };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

    worksheet.mergeCells('H2:J2'); 
    const workMonth = worksheet.getCell('H2');
    workMonth.value = `${year}年${month}月`;
    workMonth.font = { size: 18 };
    workMonth.alignment = { vertical: 'middle', horizontal: 'left' };

    worksheet.mergeCells('A3:D3'); 
    const workName = worksheet.getCell('A3');
    workName.value = `プロジェクト名 : ${projects}`;
    workName.font = { size: 18 };
    workName.alignment = { vertical: 'middle', horizontal: 'left' };

    worksheet.mergeCells('H4:J4'); 
    const companyName = worksheet.getCell('H4');
    companyName.value = `所属会社 : ${company}`;
    companyName.font = { size: 18 };
    companyName.alignment = { vertical: 'middle', horizontal: 'left' };

    worksheet.mergeCells('H5:J5'); 
    const userName = worksheet.getCell('H5');
    userName.value = `作業者氏名 : ${name}`;
    userName.font = { size: 18 };
    userName.alignment = { vertical: 'middle', horizontal: 'left' };

    // ヘッダーを手動で追加
    worksheet.addRow(['日付', '曜日', '出勤時間', '特記', '出勤備考', '退勤時間', '特記', '退勤備考', '休憩時間', '勤務時間']);
    worksheet.columns = [
      { key: 'date', width: 15 },
      { key: 'day', width: 10 },
      { key: 'check_in', width: 15 },
      { key: 'remarks1', width: 15 },
      { key: 'remarks2', width: 30 },
      { key: 'check_out', width: 15 },
      { key: 'out_remarks1', width: 15 },
      { key: 'out_remarks2', width: 30 },
      { key: 'break_time', width: 15 },
      { key: 'work_hours', width: 15 }
    ];
  
    allDates.forEach(date => {
      const record = attendanceData.find(record => new Date(record.date).toLocaleDateString('ja-JP') === date.toLocaleDateString('ja-JP'));
      worksheet.addRow({
        date: date.toLocaleDateString('ja-JP').replace(/\//g, '/'),
        day: getDayOfWeek(date),
        check_in: record ? formatTime(record.check_in_time) : '',
        remarks1: record ? record.remarks1 : '',
        remarks2: record ? record.remarks2 : '',
        check_out: record ? formatTime(record.check_out_time) : '',
        out_remarks1: record ? record.out_remarks1 : '',
        out_remarks2: record ? record.out_remarks2 : '',
        break_time: record ? formatTime(record.break_time) : '',
        work_hours: record ? formatTime(record.work_hours) : ''
      });
    });
  
    // スタイルの適用
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber >= 6) { // 6行目から罫線を適用
        row.eachCell((cell, colNumber) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
          if (rowNumber === 6) {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FF266EBD' }
            };
            cell.alignment = { horizontal: 'center' };
          }
          // 中央揃えにする列を指定
          if (![1, 5, 8].includes(colNumber)) {
            cell.alignment = { horizontal: 'center' };
          }
        });
        row.height = 25;
      }
    });

    // 空のセルにも罫線を適用
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber >= 6) {
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      }
    });

    // 交通費情報を新しいシートに追加
    const expensesSheet = workbook.addWorksheet('旅費交通費清算書');

    // 交通費清算書のタイトルを追加
    expensesSheet.mergeCells('A1:L1'); // セルを結合
    const titleCell2 = expensesSheet.getCell('A1');
    titleCell2.value = '旅費交通費清算書';
    titleCell2.font = { size: 20, bold: true };
    titleCell2.alignment = { vertical: 'middle', horizontal: 'center' };

    expensesSheet.mergeCells('A2:C2'); 
    const workName2 = expensesSheet.getCell('A2');
    workName2.value = `氏名 : ${name}`;
    workName2.font = { size: 18 };
    workName2.alignment = { vertical: 'middle', horizontal: 'left' };

    expensesSheet.mergeCells('J2:L2'); 
    const workMonth3 = expensesSheet.getCell('J2');
    workMonth3.value = `${year}年${month}月`;
    workMonth3.font = { size: 18 };
    workMonth3.alignment = { vertical: 'middle', horizontal: 'left' };

    // ヘッダーの1行目
    expensesSheet.getCell('A4').value = '日付';
    expensesSheet.getCell('B4').value = '曜日';
    expensesSheet.getCell('C4').value = '行先・経路';
    expensesSheet.getCell('D4').value = '交通費';
    expensesSheet.getCell('J4').value = '宿泊費';
    expensesSheet.getCell('K4').value = '合計';
    expensesSheet.getCell('L4').value = '備考';

    expensesSheet.mergeCells('A4:A5'); // 日付
    expensesSheet.mergeCells('B4:B5'); // 曜日
    expensesSheet.mergeCells('C4:C5'); // 行先・経路
    expensesSheet.mergeCells('D4:I4'); // 交通費
    expensesSheet.mergeCells('J4:J5'); // 宿泊費
    expensesSheet.mergeCells('K4:K5'); // 合計
    expensesSheet.mergeCells('L4:L5'); // 備考

    // ヘッダーの2行目
    expensesSheet.getCell('D5').value = '電車';
    expensesSheet.getCell('E5').value = 'バス';
    expensesSheet.getCell('F5').value = 'タクシー';
    expensesSheet.getCell('G5').value = '航空機';
    expensesSheet.getCell('H5').value = 'その他';
    expensesSheet.getCell('I5').value = '計';
    
    expensesSheet.columns = [
      { key: 'date', width: 15 },
      { key: 'day', width: 10 },
      { key: 'route', width: 30 },
      { key: 'train', width: 10 },
      { key: 'bus', width: 10 },
      { key: 'tax', width: 10 },
      { key: 'aircraft', width: 10 },
      { key: 'other', width: 10 },
      { key: 'total', width: 10 },
      { key: 'stay', width: 10 },
      { key: 'grand_total', width: 10 },
      { key: 'expenses_remarks', width: 30 }
    ];

    allDates2.forEach(date => {
      const record = expensesData.find(record => new Date(record.date).toLocaleDateString('ja-JP') === date.toLocaleDateString('ja-JP'));
      expensesSheet.addRow({
        date: date.toLocaleDateString('ja-JP').replace(/\//g, '/'),
        day: getDayOfWeek(date),
        route: record ? record.route : null,
        train: record ? Number(record.train) : null,
        bus: record ? Number(record.bus) : null,
        tax: record ? Number(record.tax) : null,
        aircraft: record ? Number(record.aircraft) : null,
        other: record ? Number(record.other) : null,
        total: record ? Number(record.total) : null,
        stay: record ? Number(record.stay) : null,
        grand_total: record ? Number(record.grand_total) : null,
        expenses_remarks: record ? record.expenses_remarks : null
      });
    });
    
    // スタイルの適用
    expensesSheet.eachRow((row, rowNumber) => {
      if (rowNumber >= 4) { // 4行目から罫線を適用
        row.eachCell((cell, colNumber) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
          if (rowNumber === 4 || rowNumber === 5) {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FF266EBD' }
            };
            cell.alignment = { horizontal: 'center' };
          }
          // 中央揃えにする列を指定
          if (![1,12].includes(colNumber)) {
            cell.alignment = { horizontal: 'center' };
          }
        });
        row.height = 25;
      }
    });

    // 空のセルにも罫線を適用
    expensesSheet.eachRow((row, rowNumber) => {
      if (rowNumber >= 4) {
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      }
    });

    // 合計行を追加
    const totalRow = expensesSheet.addRow({
      date: '',
      day: '',
      route: '合計',
      train: { formula: `SUM(D6:D${expensesSheet.rowCount})` },
      bus: { formula: `SUM(E6:E${expensesSheet.rowCount})` },
      tax: { formula: `SUM(F6:F${expensesSheet.rowCount})` },
      aircraft: { formula: `SUM(G6:G${expensesSheet.rowCount})` },
      other: { formula: `SUM(H6:H${expensesSheet.rowCount})` },
      total: { formula: `SUM(I6:I${expensesSheet.rowCount})` },
      stay: { formula: `SUM(J6:J${expensesSheet.rowCount})` },
      grand_total: { formula: `SUM(K6:K${expensesSheet.rowCount})` },
      expenses_remarks: ''
    });

    // 合計行のスタイルを適用
    totalRow.eachCell((cell, colNumber) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // 合計金額を手動で計算
    let grandTotalSum = 0;
    for (let i = 6; i <= totalRow.number - 1; i++) {
      const cellValue = expensesSheet.getCell(`K${i}`).value;
      if (typeof cellValue === 'number') {
        grandTotalSum += cellValue;
      }
    }

    // 1行開けてJからL列を結合
    const emptyRowNumber = totalRow.number + 2;
    expensesSheet.mergeCells(`J${emptyRowNumber}:L${emptyRowNumber}`);
    const mergedCell = expensesSheet.getCell(`J${emptyRowNumber}`);
    mergedCell.value = {
      richText: [
        { text: '合計金額 : ', font: { size: 18 } },
        { text: ` ${grandTotalSum} 円`, font: { size: 18, underline: true } }
      ]
    };
    mergedCell.font = { size: 18 };
    mergedCell.alignment = { vertical: 'middle', horizontal: 'center' };


    // 代休情報を新しいシートに追加
    const holidaySheet = workbook.addWorksheet('代休未消化記録表');

    // 代休未消化記録表のタイトルを追加
    holidaySheet.mergeCells('A1:D1'); // セルを結合
    const titleCell3 = holidaySheet.getCell('A1');
    titleCell3.value = '代休未消化記録表';
    titleCell3.font = { size: 20, bold: true };
    titleCell3.alignment = { vertical: 'middle', horizontal: 'center' };

    holidaySheet.mergeCells('C2:D2'); 
    const workMonth4 = holidaySheet.getCell('C2');
    workMonth4.value = `${year}年${month}月`;
    workMonth4.font = { size: 18 };
    workMonth4.alignment = { vertical: 'middle', horizontal: 'left' };

    // ヘッダーの1行目
    holidaySheet.getCell('A4').value = '代休未消化記録表';

    holidaySheet.mergeCells('A4:D4'); 

    holidaySheet.columns = [
      { key: 'year', width: 15 },
      { key: 'month', width: 15 },
      { key: 'day', width: 15 },
      { key: 'week', width: 15 },
    ];

    // データの追加
    holidayData.forEach(record => {
      holidaySheet.addRow({
        year: `${record.year}年`,
        month: `${record.month}月`,
        day: `${record.day}日`,
        week: record.week,
      });
    });

    // スタイルの適用
    holidaySheet.eachRow((row, rowNumber) => {
      if (rowNumber >= 4) { // 4行目から罫線を適用
        row.eachCell((cell, colNumber) => {
          if(rowNumber === 4){
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          }
        }else if (colNumber === 1) {
          // A列の罫線（左側のみ）
          cell.border = {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' }
          };
        } else if (colNumber === 4) {
          // D列の罫線（左側のみ）
          cell.border = {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        }  else { // 中間の列
          cell.border = {
            top: { style: 'thin' },
            bottom: { style: 'thin' }
          };
        } if (rowNumber === 4) {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FF266EBD' }
            };
            cell.alignment = { horizontal: 'center' };
        }
          // 中央揃えにする列を指定
          if (![1,12].includes(colNumber)) {
            cell.alignment = { horizontal: 'center' };
          }
        });
        row.height = 25;
      } 
    });

    // 空のセルにも罫線を適用
    holidaySheet.eachRow((row, rowNumber) => {
      if (rowNumber >= 4) {
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          if(rowNumber === 4){
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            }
          } else if (colNumber === 1) {
            // A列の罫線（左側のみ）
            cell.border = {
              top: { style: 'thin' },
              bottom: { style: 'thin' },
              left: { style: 'thin' }
            };
          } else if (colNumber === 4) {
            // D列の罫線（左側のみ）
            cell.border = {
              top: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
          }else { // 中間の列
            cell.border = {
              top: { style: 'thin' },
              bottom: { style: 'thin' }
            };
          }
        });
      }
    });
  
    // バッファを生成してBlobとして保存
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `【月末書類】_${userData.fullname}_${userData.company}_${year}_${month}_.xlsx`);
};

const holidays = getHolidaysInMonth(year, month);

  return (
    <div id='table_flex'>
      <div id='table_box1'>
        <div>
        {userData && <p id='atUser'>{userData.fullname} さん</p>}
        </div>
        <div id='at_all_left'>
          <div id='excel_button_area'>
            <button className='all_button' id='excel_button' onClick={exportToExcel}>Excel 出力</button>
          </div>
          <div id='user_button_area'>
            <UserModal buttonLabel="PJ情報登録" addItemToState={addItemToState} />
          </div>
          <div id='expenses_button_area'>
            <button className='all_button' id='expenses_button' onClick={expensesClick}>交通費精算</button>
          </div>
          <div id='holiday_button_area'>
            <button className='all_button' id='holiday_button' onClick={holidayClick}>代休未消化</button>
          </div>
          <div id='time_button_area'>
            <TimeModal buttonLabel="標準勤務時間" addItemToState={addItemToState2} />
          </div>
        </div>
      </div>
      <div id='table_box2'>
        <h1 id='atH1'>勤怠一覧</h1>
        <div id='table_top_menu'>
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
        <div id='atH2_area'>
          <h2 id='atH2'>{year}年 {month}月</h2>
        </div>
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
              const isHoliday = holidays.some(holiday => holiday.toDateString() === date.toDateString());
              const dayClass = isWeekend(date) ? (date.getUTCDay() === 6 ? 'saturday' : 'sunday') : (isHoliday ? 'holiday' : '');
              const isEditing = editingRemarks[date.toISOString()];
              const isEditing2 = editingRemarks2[date.toISOString()];
              const isEditingOut = editingOutRemarks[date.toISOString()];
              const isEditingOut2 = editingOutRemarks2[date.toISOString()];
              
              return (
                <tr key={date.toISOString()} className={dayClass}>
                  <td>{date.toLocaleDateString('ja-JP').replace(/\//g, '/')}</td>
                  <td>{getDayOfWeek(date)}</td>
                  <td>{record ? formatTime(record.check_in_time) : ''}</td>
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
                  <td>{record ? formatTime(record.work_hours) : ''}</td>
                </tr>
              );
            })}
          </tbody>
          </table>
        </div>
        <div id='attendance_link_area'>
            <Link to="/" id='account_top_link'>← トップページ</Link>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTablePage;