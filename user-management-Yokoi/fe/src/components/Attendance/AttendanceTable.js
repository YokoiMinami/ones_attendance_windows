import React, { useEffect, useState,useRef } from 'react';
import holidayJp from '@holiday-jp/holiday_jp';
import { Link, useNavigate } from 'react-router-dom';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import Dropdown from './AttendancePull';
import UserModal from './UserModal';
import TimeModal from './TimeModal';
import { startOfWeek, endOfWeek, subWeeks } from 'date-fns';
import { fetchUserData, fetchAttendanceData, fetchExpensesData, fetchHolidayData, fetchProjectData, fetchExpensesData2, postRemarks, standardTime } from '../../apiCall/apis';
import { isWeekend, getDaysInMonth, getDayOfWeek } from '../../constants/date';
import { attendanceFormatTime, formatRemarks, totalWorkHours, calculateNetWorkHours, convertTimeToMinutes, convertMinutesToTime, formatDate, formatAmount} from '../../common/format';

const AttendanceTablePage = ( ) => {

  const accounts_id = localStorage.getItem('user');//ユーザーID
  const [userData, setUserData] = useState(null); //ユーザーデータ
  const [attendanceData, setAttendanceData] = useState([]); //ユーザーの勤怠データ
  const [userWorkHours, setUserWorkHours] = useState(0); //勤務時間を計算するための勤怠データ
  const [formattedAttendanceData, setFormattedAttendanceData] = useState([]); //日付を修正した勤怠データ
  const [daysInMonth, setDaysInMonth] = useState([]); //勤怠を表示する年月
  const [year, setYear] = useState(new Date().getFullYear()); //勤怠を表示する年
  const [month, setMonth] = useState(new Date().getMonth() + 1); //勤怠を表示する月
  const formattedMonth = month.toString().padStart(2, '0');
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
  const [details, setDetails] = useState('');
  const [projects, setProjects] = useState('');
  const [company, setCompany] = useState('');
  const [name, setName] = useState('');
  const [appDay, setAppDay] = useState('');
  const [approver, setApprover] = useState('');
  const [president, setPresident] = useState('');
  const [costRemarks, setCostRemarks] = useState('');
  const [editingRemarks, setEditingRemarks] = useState({}); // 出勤特記の編集モードを管理するステート
  const [editingRemarks2, setEditingRemarks2] = useState({}); //出勤備考の編集モードを管理するステート
  const [editingOutRemarks, setEditingOutRemarks] = useState({}); // 退勤特記の編集モードを管理するステート
  const [editingOutRemarks2, setEditingOutRemarks2] = useState({}); //退勤備考の編集モードを管理するステート
  const [remarks2, setRemarks2] = useState(''); 
  const [out_set_remarks2, setOutRemarks2] = useState(''); 
  const [expensesData, setExpensesData] = useState([]); //交通費データ
  const [holidayData, setHolidayData] = useState([]); //代休データ
  const [expenses, setExpenses] = useState([]); //経費データ

  const navigate = useNavigate();

  const expensesClick = () => {
    navigate('/expenses');
  };

  const holidayClick = () => {
    navigate('/holiday');
  };

  const costClick = () => {
    navigate('/cost');
  };
  
  //ユーザー情報を取得
  useEffect(() => {
    const getUserData = async () => {
      try {
        const data = await fetchUserData(accounts_id);
        setUserData(data);
      } catch (err) {
        console.log(err);
      }
    };
    getUserData();
  }, [accounts_id]);

  //ユーザーの勤怠情報を取得
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const data = await fetchAttendanceData(accounts_id, year, formattedMonth);
        setUserWorkHours(data);
        setAttendanceData(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching attendance data:', error);
        setAttendanceData([]);
      }
    };
    fetchAttendance();
  }, [year, month, formattedMonth, accounts_id, editingRemarks, editingRemarks2, editingOutRemarks, editingOutRemarks2]);

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
  
  //ユーザーの交通費情報を取得
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const data = await fetchExpensesData(accounts_id, year, month);
        setExpensesData(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching expenses data:', error);
        setExpensesData([]);
      }
    };
    fetchExpenses();
  }, [year, month, accounts_id]);


  //ユーザーの代休情報を取得
  useEffect(() => {
    const fetchHoliday = async () => {
      try {
        const data = await fetchHolidayData(accounts_id);
        setHolidayData(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching holiday data:', error);
        setHolidayData([]);
      }
    };
    fetchHoliday();
  }, [year, month, accounts_id]);

  //プロジェクト情報を取得
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await fetchProjectData(accounts_id, year, month);
        setProjects(data.project);
        setDetails(data.details);
        setCompany(data.company);
        setName(data.name);
        setAppDay(data.create_day);
        setApprover(data.approver);
        setPresident(data.president);
        setCostRemarks(data.remarks);
      } catch (error) {
        console.error('Error fetching project data:', error);
        setProjects('');
        setDetails('');
        setCompany('');
        setName('');
        setAppDay();
        setApprover();
        setPresident();
        setCostRemarks();
      }
    };
    fetchProjects();
  }, [year, month, accounts_id]);

  //経費情報を取得
  useEffect(() => {
    const fetchExpenses2 = async () => {
      try {
        const data = await fetchExpensesData2(accounts_id, year, month);
        setExpenses(data);
      } catch (error) {
        console.error('Error fetching expenses data:', error);
      }
    };
    fetchExpenses2();
  }, [year, month, accounts_id]);

  //祝日を取得
  const getHolidaysInMonth = (year, month) => {
    const holidays = holidayJp.between(new Date(year, month - 1, 1), new Date(year, month, 0));
    return holidays.map(holiday => new Date(holiday.date));
  };

  //表を出力
  //特定の月の日付を取得し、それをReactの状態に設定する
  useEffect(() => {
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
  }, [year, month, editingRemarks, editingRemarks2, editingOutRemarks, editingOutRemarks2]); 

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
    const currentDate = date.toISOString().split('T')[0];

    const data = {
      accounts_id,
      date: currentDate,
      remarks1: newOption
    };
    try {
      const message = await postRemarks(data);
      if (message) {
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
    const currentDate = date.toISOString().split('T')[0];
    const data = {
      accounts_id,
      date: currentDate,
      out_remarks1: newOption
    };
    try {
      const message = await postRemarks(data);
      if (message) {
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
      const message = await postRemarks(data);
      setEditingRemarks2(remarks2);
      if (message) {
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
      const message = await postRemarks(data);
      setEditingOutRemarks2(out_set_remarks2);
      if (message) {
        setAttendanceData(prev => {
          const existingRecordIndex = prev.findIndex(record => record.date === currentDate);
          if (existingRecordIndex !== -1) {
            return prev.map(record => 
              record.date === currentDate ? { ...record, out_remarks2: out_set_remarks2 } : record
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
  //ユーザーIDをもとに標準勤務時間を取得
  useEffect(() => {
    const getstandardTime = async () => {
      try {
        const data = await standardTime(accounts_id);
        if (data.start_time) setStartTime(data.start_time);
        if (data.end_time) setEndTime(data.end_time);
        if (data.break_time) setBreakTime(data.break_time);
      } catch (err) {
        console.log(err);
      }
    };
    getstandardTime();
  }, [accounts_id]);

  const work_hours = totalWorkHours(startTime, endTime);

  //勤務時間を計算
  useEffect(() => {
    if (startTime && endTime && breakTime) { //標準勤務時間
      const WorkHours = calculateNetWorkHours(work_hours, breakTime);
      setWorkHours(WorkHours);

      // workHoursを分単位に変換し、勤務日数を掛ける
      const workHoursInMinutes = convertTimeToMinutes(WorkHours);
      //規定勤務時間の分数
      const multipliedWorkHoursInMinutes = workHoursInMinutes * holidaysAndWeekendsCount;

      // 分単位の時間をhh:mm形式に変換
      const multipliedWorkHours = convertMinutesToTime(multipliedWorkHoursInMinutes);
      
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
      const multipliedWorkHours2 = convertMinutesToTime(flooredNumber);
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
      const multipliedWorkHours = convertMinutesToTime(multipliedWorkHoursInMinutes);

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
      const multipliedWorkHours2 = convertMinutesToTime(flooredNumber);

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
      const multipliedWorkHours = convertMinutesToTime(multipliedWorkHoursInMinutes);

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

  //エクセル出力
  const exportToExcel = async () => {

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const allDates = [];
    const allDates2 = [];
  
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
        check_in: record ? attendanceFormatTime(record.check_in_time) : '',
        remarks1: record ? record.remarks1 : '',
        remarks2: record ? record.remarks2 : '',
        check_out: record ? attendanceFormatTime(record.check_out_time) : '',
        out_remarks1: record ? record.out_remarks1 : '',
        out_remarks2: record ? record.out_remarks2 : '',
        break_time: record ? attendanceFormatTime(record.break_time) : '',
        work_hours: record ? attendanceFormatTime(record.work_hours) : ''
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
    expensesSheet.mergeCells('A1:L1'); 
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
        train: record ? (record.train !== null ? Number(record.train) : null) : null,
        bus: record ? (record.bus !== null ? Number(record.bus) : null) : null,
        tax: record ? (record.tax !== null ? Number(record.tax) : null) : null,
        aircraft: record ? (record.aircraft !== null ? Number(record.aircraft) : null) : null,
        other: record ? (record.other !== null ? Number(record.other) : null) : null,
        total: record ? (record.total !== null ? Number(record.total) : null) : null,
        stay: record ? (record.stay !== null ? Number(record.stay) : null) : null,
        grand_total: record ? (record.grand_total !== null ? Number(record.grand_total) : null) : null,
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
    holidaySheet.mergeCells('A1:D1'); 
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
      // { key: 'year', width: 15 },
      { key: 'month', width: 15 },
      { key: 'date', width: 15 },
      { key: 'week', width: 15 },
      { key: 'day', width: 15 },
    ];

    // データの追加
    holidayData.forEach(record => {
      holidaySheet.addRow({
        month:'',
        date: formatDate(record.date),
        week: record.week,
        day: '',
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
          } else { // 中間の列
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

    // 経費情報を新しいシートに追加
    const costSheet = workbook.addWorksheet('経費申請書');

    const create_day_label = costSheet.getCell('D2');
    create_day_label.value = '作成日';
    create_day_label.alignment = { vertical: 'middle', horizontal: 'center' };
    create_day_label.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };

    create_day_label.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' } // ライトグレーの背景色
    };

    // セルの幅と高さを指定
    costSheet.getColumn('D').width = 20; // 幅を20に設定
    costSheet.getRow(2).height = 30; // 高さを30に設定

    costSheet.mergeCells('E2:F2'); // セルを結合
    const workMonth5 = costSheet.getCell('E2');
    workMonth5.value = appDay;
    workMonth5.alignment = { vertical: 'middle', horizontal: 'right' };
    workMonth5.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
    
    // 経費明細所のタイトルを追加
    costSheet.mergeCells('A4:E4'); // セルを結合
    const titleCell4 = costSheet.getCell('A4');
    titleCell4.value = '経費明細書';
    titleCell4.font = { size: 20, bold: true };
    titleCell4.alignment = { vertical: 'middle', horizontal: 'center' };

    const company_label = costSheet.getCell('A7');
    company_label.value = '所属会社';
    company_label.alignment = { vertical: 'middle', horizontal: 'center' };
    company_label.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };

    company_label.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' } // ライトグレーの背景色
    };

    // セルの幅と高さを指定
    costSheet.getColumn('A').width = 20; // 幅を20に設定
    costSheet.getRow(2).height = 30; // 高さを30に設定

    costSheet.mergeCells('B7:C7'); // セルを結合
    const company_data = costSheet.getCell('B7');
    company_data.value = company;
    company_data.alignment = { vertical: 'middle', horizontal: 'left' };
    company_data.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };

    const name_label = costSheet.getCell('A8');
    name_label.value = '氏名';
    name_label.alignment = { vertical: 'middle', horizontal: 'center' };
    name_label.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };

    name_label.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' } // ライトグレーの背景色
    };

    costSheet.getRow(8).height = 30; // 高さを30に設定

    costSheet.mergeCells('B8:C8'); // セルを結合
    const name_data = costSheet.getCell('B8');
    name_data.value = name;
    name_data.alignment = { vertical: 'middle', horizontal: 'left' };
    name_data.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };

    const project_label = costSheet.getCell('A10');
    project_label.value = 'プロジェクト';
    project_label.alignment = { vertical: 'middle', horizontal: 'center' };
    project_label.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };

    project_label.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' } // ライトグレーの背景色
    };

    costSheet.getRow(10).height = 30; // 高さを30に設定

    costSheet.mergeCells('B10:C10'); // セルを結合
    const project_data = costSheet.getCell('B10');
    project_data.value = details;
    project_data.alignment = { vertical: 'middle', horizontal: 'left' };
    project_data.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };

    // ヘッダーの1行目
    costSheet.getCell('A13').value = '日付';
    costSheet.getCell('B13').value = '経費科目';
    costSheet.getCell('C13').value = '内容';
    costSheet.getCell('D13').value = '金額(税込)';
    
    costSheet.columns = [
      { key: 'date', width: 15 },
      { key: 'category', width: 25 },
      { key: 'description', width: 35 },
      { key: 'amount', width: 20 },
    ];
    
    expenses.forEach(record => {
      const row = costSheet.addRow({
        date:formatDate(record.date),
        category: record.category,
        description: record.description,
        amount: formatAmount(record.amount)
      });
      // descriptionセルのみを左寄せに設定
      row.getCell('description').alignment = { vertical: 'middle', horizontal: 'left' };
    });

    // 合計を計算
    const totalAmount = expenses.reduce((sum, record) => sum + Math.floor(record.amount), 0);
    
    // スタイルの適用
    costSheet.eachRow((row, rowNumber) => {
      if (rowNumber >= 13) { // 13行目から罫線を適用
        row.eachCell((cell, colNumber) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
          if (rowNumber === 13) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFD3D3D3' } // ライトグレーの背景色
            };
            cell.alignment = { horizontal: 'center' };
          } 
          // 中央揃えにする列を指定
          if (![1,3, 4].includes(colNumber)) {
            cell.alignment = { horizontal: 'center' };
          }
        });
        row.height = 25;
      }
    });

    // 空のセルにも罫線を適用
    costSheet.eachRow((row, rowNumber) => {
      if (rowNumber >= 13) {
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

    // データの行数を取得
    const dataRowCount = expenses.length;

    // 合計を出力する行を計算
    const totalRowNumber = 13 + dataRowCount + 3;
    //記載欄
    const companyNumber = 13 + dataRowCount + 7;
    //承認欄ラベル
    const appLabel = 13 + dataRowCount + 8;
    //承認欄データ
    const appData = 13 + dataRowCount + 9;

    costSheet.mergeCells(`A${totalRowNumber}:B${totalRowNumber}`);
    const total_label = costSheet.getCell(`A${totalRowNumber}`);
    total_label.value = '経費合計';
    total_label.alignment = { vertical: 'middle', horizontal: 'center' };
    total_label.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };

    total_label.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' } // ライトグレーの背景色
    };

    costSheet.getRow(totalRowNumber).height = 30; // 高さを30に設定

    costSheet.mergeCells(`C${totalRowNumber}:D${totalRowNumber}`);
    const total_data = costSheet.getCell(`C${totalRowNumber}`);
    total_data.value = totalAmount;
    total_data.alignment = { vertical: 'middle', horizontal: 'center' };
    total_data.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };

    costSheet.mergeCells(`A${companyNumber}:C${companyNumber}`);
    const company_text = costSheet.getCell(`A${companyNumber}`);
    company_text.value = '株式会社ワンズブルーム記載欄';
    company_text.alignment = { vertical: 'middle', horizontal: 'left' };
    
    const approver_label = costSheet.getCell(`A${appLabel}`);
    approver_label.value = '承認者';
    approver_label.alignment = { vertical: 'middle', horizontal: 'center' };
    approver_label.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };

    approver_label.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' } // ライトグレーの背景色
    };

    const president_label = costSheet.getCell(`B${appLabel}`);
    president_label.value = '社長';
    president_label.alignment = { vertical: 'middle', horizontal: 'center' };
    president_label.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };

    president_label.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' } // ライトグレーの背景色
    };

    const remarks_label = costSheet.getCell(`C${appLabel}`);
    remarks_label.value = '備考';
    remarks_label.alignment = { vertical: 'middle', horizontal: 'center' };
    remarks_label.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };

    remarks_label.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' } // ライトグレーの背景色
    };

    costSheet.getRow(appData).height = 30; 

    const approver_data = costSheet.getCell(`A${appData}`);
    approver_data.value = approver;
    approver_data.alignment = { vertical: 'middle', horizontal: 'center' };
    approver_data.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };

    const president_data = costSheet.getCell(`B${appData}`);
    president_data.value = president;
    president_data.alignment = { vertical: 'middle', horizontal: 'center' };
    president_data.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };

    const remarks_data = costSheet.getCell(`C${appData}`);
    remarks_data.value = costRemarks;
    remarks_data.alignment = { vertical: 'middle', horizontal: 'left' };
    remarks_data.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };

    const imageSheet = workbook.addWorksheet('レシート');
    imageSheet.getColumn('A').width = 10; 

    // データの追加
    for (const [index, record] of expenses.entries()) {
      const colOffset = (index % 4) * 2; // 4つごとに2列右にオフセット
      const rowOffset = Math.floor(index / 4) * 7; // 4つごとに7行下にオフセット
      const col = String.fromCharCode('B'.charCodeAt(0) + colOffset); // 列を計算
      const dateCell = imageSheet.getCell(`${col}${2 + rowOffset}`);
      const categoryCell = imageSheet.getCell(`${col}${3 + rowOffset}`);
      
      dateCell.value = `日付 : ${formatDate(record.date)}`;
      categoryCell.value = `経費科目 : ${record.category}`;

      // 各データ列の幅を55に設定
      const colIndex = col.charCodeAt(0) - 64;
      imageSheet.getColumn(colIndex).width = 55;

      // データが出力されるセルにのみ罫線を適用
      dateCell.border = { bottom: { style: 'thin' } };
      categoryCell.border = { bottom: { style: 'thin' } };

      // 画像を読み込んで追加
      const imageUrl = `http://localhost:3000/uploads/${record.receipt_url}`;
      const response = await fetch(imageUrl);
      if (!response.ok) {
        console.error(`Failed to load image: ${imageUrl}`);
        continue; // 画像の読み込みに失敗した場合はスキップ
      }
      const imageBlob = await response.blob();
      const imageBuffer = await imageBlob.arrayBuffer();

      // ファイル名から拡張子を取得
      const fileExtension = record.receipt_url.split('.').pop();

      // canvasを使用して画像の元のサイズを取得
      const img = new Image();
      img.src = URL.createObjectURL(imageBlob);
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const originalWidth = img.width;
      const originalHeight = img.height;

      // 列幅に合わせた新しい幅と高さを計算
      const newWidth = 50 * 7.5 * 0.8; // 列幅の80%に設定 (1列 = 7.5ポイント)
      const aspectRatio = originalHeight / originalWidth;
      const newHeight = newWidth * aspectRatio;

      const imageId = workbook.addImage({
        buffer: imageBuffer,
        extension: fileExtension, // ファイルの拡張子を動的に設定
      });
      imageSheet.addImage(imageId, {
        tl: { col: colIndex - 1 + 0.9, row: 4 + rowOffset }, // 画像の左上の位置
        ext: { width: newWidth, height: newHeight }, // アスペクト比を維持したサイズ
      });

      // 経費科目が入力されているセルの2つ下のセルの高さを指定
      const targetRow = 3 + 2 + rowOffset; // 経費科目のセルの2つ下の行番号
      imageSheet.getRow(targetRow).height = 700 * 0.75; // 高さを指定
    }

    // スタイルの適用
    imageSheet.eachRow((row, rowNumber) => {
      if (rowNumber >= 2) { // 2行目から行の高さを設定
        row.height = 30;
      }
    });

    // バッファを生成してBlobとして保存
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `【月末書類】_${userData.fullname}_${userData.company}_${year}_${month}.xlsx`);
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
            <UserModal buttonLabel="PJ情報登録"/>
          </div>
          <div id='expenses_button_area'>
            <button className='all_button' onClick={expensesClick}>交通費精算</button>
          </div>
          <div id='cost_button_area'>
            <button className='all_button' onClick={costClick}>経費精算</button>
          </div>
          <div id='holiday_button_area'>
            <button className='all_button' onClick={holidayClick}>代休未消化</button>
          </div>
          <div id='time_button_area'>
            <TimeModal buttonLabel="標準勤務時間"/>
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
                    <td>{record ? attendanceFormatTime(record.check_in_time) : ''}</td>
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
                        <div dangerouslySetInnerHTML={{ __html: record ? formatRemarks(record.remarks2) : '' }} />
                      )}
                    </td>
                    <td>{record ? attendanceFormatTime(record.check_out_time) : ''}</td>
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
                        <div dangerouslySetInnerHTML={{ __html: record ? formatRemarks(record.out_remarks2) : '' }} />
                      )}
                    </td>
                    <td>{record ? attendanceFormatTime(record.break_time) : ''}</td>
                    <td>{record ? attendanceFormatTime(record.work_hours) : ''}</td>
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