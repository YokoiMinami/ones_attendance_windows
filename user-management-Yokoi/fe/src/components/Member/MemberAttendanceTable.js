import React, { useEffect, useState,useRef } from 'react';
import holidayJp from '@holiday-jp/holiday_jp';
import { Link, useParams } from 'react-router-dom';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import Dropdown from '../Attendance/AttendancePull';
import TimeInput from './TimeInput';

const MemberAttendanceTable = ( ) => {

  const { id } = useParams(); //メンバーIDを取得
  const [userData, setUserData] = useState(null); //メンバー情報を取得
  const [attendanceData, setAttendanceData] = useState([]); //メンバーの勤務データをテーブル用で取得
  const [userWorkHours, setUserWorkHours] = useState(0); //メンバーの勤務データを取得
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
  const [remainingTime, setRemainingTime] = useState('');
  const [userTotal, setUserTotal] = useState(0);
  const [isOvertime, setIsOvertime] = useState(false);
  const [projectsData, setProjectsData] = useState({});
  const [projects, setProjects] = useState('');
  const [company, setCompany] = useState('');
  const [name, setName] = useState('');
  const [editingRemarks, setEditingRemarks] = useState({}); // 出勤特記の編集モードを管理するステート
  const [editingRemarks2, setEditingRemarks2] = useState({}); //出勤備考の編集モードを管理するステート
  const [editingOutRemarks, setEditingOutRemarks] = useState({}); // 退勤特記の編集モードを管理するステート
  const [editingOutRemarks2, setEditingOutRemarks2] = useState({}); //退勤備考の編集モードを管理するステート
  const [editingCheckIn, setEditingCheckIn] = useState({}); //出勤時間の編集モードを管理するステート
  const [editingCheckOut, setEditingCheckOut] = useState({}); //退勤時間の編集モードを管理するステート
  const [editingBreak, setEditingBreak] = useState({}); //休憩時間の編集モードを管理するステート
  const [editingWorkHours, setEditingWorkHours] = useState({}); //勤務時間の編集モードを管理するステート
  const [remarks1, setRemarks1] = useState('');  //出勤特記の編集を保存
  const [remarks2, setRemarks2] = useState('');  //出勤備考の編集を保存
  const [out_set_remarks1, setOutRemarks1] = useState('');  //退勤特記の編集を保存
  const [out_set_remarks2, setOutRemarks2] = useState('');  //出勤備考の編集を保存
  const [checkIn, setCheckIn] = useState('');  //出勤時間の編集を保存
  const [checkOut, setCheckOut] = useState('');  //退勤時間の編集を保存
  const [breakTimeEdit, setBreakTimeEdit] = useState('');  //休憩時間の編集を保存
  const [workHoursEdit, setWorkHoursEdit] = useState('');  //出勤時間の編集を保存

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
      const accounts_id = id
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
  }, [year,month,editingRemarks, editingRemarks2, editingOutRemarks, editingOutRemarks2, editingCheckIn]);

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
  }, [year,month,editingRemarks, editingRemarks2, editingOutRemarks, editingOutRemarks2, editingCheckIn]); //monthが変更されるたびに実行する

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
    if (!timeString) return '-';
    const [hours, minutes] = timeString.split(':');
    const formattedHours = hours ? hours.padStart(2, '0') : '';
    const formattedMinutes = minutes ? minutes.padStart(2, '0') : '';
    return `${formattedHours}:${formattedMinutes}`;
  };

  // 「。」を改行タグに置き換える関数
  const formatRemarks = (remarks) => {
    if (!remarks) return '-';
    return remarks.split('。').join('。<br />');
  };

  //出勤時間の編集
  const handleCheckInChange = async (date, newOption) => {
    setCheckIn(newOption);
    const accounts_id = id;
    const currentDate = date.toISOString().split('T')[0];
    const data = {
      accounts_id,
      date: currentDate,
      check_in_time: newOption
    };
    console.log(checkIn);
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
  };

  const toggleCheckInEditing = (date) => {
    setEditingCheckIn(prev => ({ ...prev, [date.toISOString()]: !prev[date.toISOString()] }));
  };
  
  // const handleMouseOver = (event) => {
  //     event.target.focus();
  // };

  // const checkInRef = useRef(null);

  // useEffect(() => {
  //   if (editingCheckIn && checkInRef.current) {
  //     checkInRef.current.focus();
  //   }
  // }, [editingCheckIn]);












  






  //出勤特記の編集
  const handleRemarksChange1 = async (date, newOption) => {
    setRemarks1(newOption);
    const accounts_id = id;
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
    const accounts_id = id;
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
    const accounts_id = id;
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
      console.log(remarks2);
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
    console.log(newOption);
    setOutRemarks2(newOption);
  };
  
  const handleOutRemarksSave = async (date) => {
    const accounts_id = id;
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
    if (!timeString) return 0; // または適切なデフォルト値
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
    const accounts_id = id
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

  const submitFormAdd = async (e) => {
    e.preventDefault();
    const accounts_id = id;
    const data = {
      accounts_id,
      project: projects,
      company: company,
      name: name
    };
    try {
      const response = await fetch('http://localhost:3000/projects', {
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

  useEffect(() => {
    const accounts_id = id;
    fetch(`http://localhost:3000/projects/${accounts_id}`, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      setProjectsData(data);
      if (data.project ) setProjects(data.project);
      if (data.company) setCompany(data.company);
      if (data.name) setName(data.name);
    })
    .catch(err => console.log(err));
  }, [id]);

  const exportToExcel = async () => {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const allDates = [];
  
    for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
      allDates.push(new Date(d));
    }
  
    const workbook = new ExcelJS.Workbook();
    const worksheetName = `${year}年${month}月`;
    const worksheet = workbook.addWorksheet(worksheetName);
    
    // タイトルを追加
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
        });
        row.height = 25;
      }
    });
  
    // バッファを生成してBlobとして保存
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `勤怠一覧_${year}_${month}_${userData.fullname}.xlsx`);
};

const holidays = getHolidaysInMonth(year, month);

  return (
    <div id='table_flex'>
      <div id='table_box1'>
        <div>
        {userData && <p id='atUser'>ユーザー名: {userData.fullname} さん</p>}
        </div>
        <div id='at_all_left'>
          <div id='excel_button_area'>
            <button className='all_button' id='excel_button' onClick={exportToExcel}>Excel 出力</button>
          </div>
          <div id='at_h3'>
            <h3>ユーザー情報</h3>
          </div>
          <form onSubmit={submitFormAdd}>
            <div id='projects_area'>
              <div>
                <label className='pj_label'>プロジェクト : </label>
                <input type='text' className='projects_input' value={projects} onChange={(e) => setProjects(e.target.value)} />
              </div>
              <div>
                <label className='pj_label'>所属会社 : </label>
                <input type='text' className='projects_input' value={company} onChange={(e) => setCompany(e.target.value)} />
              </div>
              <div>
                <label className='pj_label'>氏名 : </label>
                <input type='text' className='projects_input' value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div id='projects_bt'>
                <button type='submit' id='projects_button'>保存</button>
              </div>
            </div>
          </form>
          <div id='at_left_at'>
            <div id='at_h3'>
              <h3>標準勤務時間</h3>
            </div>
            <div id='at_left_input'>
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
              const isEditingCheckIn = editingCheckIn[date.toISOString()];
              
              return (
                <tr key={date.toISOString()} className={dayClass}>
                  <td>{date.toLocaleDateString('ja-JP').replace(/\//g, '/')}</td>
                  <td>{getDayOfWeek(date)}</td>
                  {/* <td>{record ? formatTime(record.check_in_time) : '-'}</td> */}
                  <td onClick={() => toggleCheckInEditing(date)}>
                    {isEditingCheckIn ? (
                      <TimeInput
                      value={record ? formatTime(record.check_in_time) : '-'}
                      onChange={(check_in_time) => handleCheckInChange(date, check_in_time)}
                      />
                      // <input
                      //   // ref={checkInRef}
                      //   type='time'
                      //   step='900'
                      //   className=''
                      //   style={{ textAlign: 'left', width:'100%', outline: 'none', border: '1px solid #808080'}}
                      //   value={checkIn}
                      //   onChange={(e) => handleCheckInChange(e.target.value)}
                      //   onClick={() => handleCheckInChange(date)}  
                      //   onBlur={() => handleCheckInChange(date)}
                      // />
                    ) : (
                      record ? formatTime(record.check_in_time) : '-'
                    )}
                  </td>
                  <td onClick={() => toggleEditing(date)}>
                    {isEditing ? (
                      <Dropdown
                        value={record ? record.remarks1 : ''}
                        onChange={(remarks1) => handleRemarksChange1(date, remarks1)}
                      />
                    ) : (
                      record ? record.remarks1 : '-'
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
                      record ? formatRemarks(record.remarks2) : '-'
                    )}
                  </td>
                  <td>{record ? formatTime(record.check_out_time) : '-'}</td>
                  <td onClick={() => toggleOutEditing(date)}>
                    {isEditingOut ? (
                      <Dropdown
                        value={record ? record.out_remarks1 : ''}
                        onChange={(out_remarks1) => handleOutRemarksChange1(date, out_remarks1)}
                      />
                    ) : (
                      record ? record.out_remarks1 : '-'
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
                      record ? formatRemarks(record.out_remarks2) : '-'
                    )}
                  </td>
                  <td>{record ? formatTime(record.break_time) : '-'}</td>
                  <td>{record ? formatTime(record.work_hours) : '-'}</td>
                </tr>
              );
            })}
          </tbody>
          </table>
        </div>
        <TimeInput />
        <div id='attendance_link_area'>
            <Link to="/" id='account_top_link'>← 勤怠一覧ページ</Link>
        </div>
      </div>
    </div>
  );
};

export default MemberAttendanceTable;