import React, { useEffect, useState,useRef } from 'react';
import holidayJp from '@holiday-jp/holiday_jp';
import { Link } from 'react-router-dom';

const ExpensesPage = ( ) => {

  const id = localStorage.getItem('user');
  const [userData, setUserData] = useState(null);

  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [daysInMonth, setDaysInMonth] = useState([]);
  const [holidaysAndWeekendsCount, setHolidaysAndWeekendsCount] = useState(0);

  const [expensesData, setExpensesData] = useState([]); //交通費データ

  const [destination, setDestination] = useState(''); //経路
  const [editingDestination, setEditingDestination] = useState({}); //経路の編集モードを管理するステート

  const [train, setTrain] = useState(''); //電車
  const [editingTrain, setEditingTrain] = useState({}); //電車の編集モードを管理するステート

  const [bus, setBus] = useState(''); //バス
  const [editingBus, setEditingBus] = useState({}); //バスの編集モードを管理するステート

  const [tax, setTax] = useState(''); //タクシー
  const [editingTax, setEditingTax] = useState({}); //タクシーの編集モードを管理するステート

  const [aircraft, setAircraft] = useState(''); //航空機
  const [editingAircraft, setEditingAircraft] = useState({}); //航空機の編集モードを管理するステート

  const [other, setOther] = useState(''); //その他
  const [editingOther, setEditingOther] = useState({}); //その他の編集モードを管理するステート
  
  const [stay, setStay] = useState(''); //宿泊費
  const [editingStay, setEditingStay] = useState({}); //宿泊費の編集モードを管理するステート

  const [expensesRemarks, setExpensesRemarks] = useState(''); //備考
  const [editingExpensesRemarks, setEditingExpensesRemarks] = useState({}); //備考の編集モードを管理するステート

  const [totals, setTotals] = useState({
    train: 0,
    bus: 0,
    tax: 0,
    aircraft: 0,
    other: 0,
    stay: 0,
    total: 0,
    grand_total: 0
  }); //各項目の合計

  const [totalExpenses, setTotalExpenses] = useState(0); //全ての合計

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

  //ユーザーの交通費情報を取得
  useEffect(() => {
    const fetchExpenses = async () => {
      const accounts_id = localStorage.getItem('user');
      try {
        const response = await fetch(`http://localhost:3000/expenses/${accounts_id}/${year}/${month}`);
        const data = await response.json();
        setExpensesData(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching attendance data:', error);
        setExpensesData([]);
      }
    };
    fetchExpenses();
  }, [year, month, editingDestination, editingTrain, editingBus, editingTax, editingAircraft, editingOther, editingStay, editingExpensesRemarks]);


  // 交通費情報を検索する関数
  const findAttendanceRecord = (date) => {
    // dateオブジェクトをローカルタイムゾーンのYYYY-MM-DD形式に変換
    const formattedDate = date.toLocaleDateString('en-CA'); // 'en-CA'はYYYY-MM-DD形式を返す
    // attendanceData配列内の各recordを検索し、条件に一致する最初の要素を返す
    return expensesData.find(record => {
      // record.dateを日付オブジェクトに変換し、ローカルタイムゾーンの日付部分を取得
      const recordDate = new Date(record.date).toLocaleDateString('en-CA');
      // recordDateとformattedDateが一致するかどうかを比較し、一致する場合にそのrecordを返す
      return recordDate === formattedDate;
    })|| { date: formattedDate, destination: '', train:'' }; // デフォルトの空の特記を返す;
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
  }, [year, month, editingDestination, editingTrain, editingBus, editingTax, editingAircraft, editingOther, editingStay, editingExpensesRemarks]); //monthが変更されるたびに実行する

  //特定の日付の曜日を取得する関数
  const getDayOfWeek = (date) => {
    //渡された日付の曜日を日本語で取得
    //dateオブジェクトを日本語のロケール（ja-JP）でフォーマットし、曜日を長い形式（例：月曜日、火曜日）で返す
    return date.toLocaleDateString('ja-JP', { weekday: 'long' });
  };

  //経路の編集
  const handleRouteChange = (newOption) => {
    setDestination(newOption);
  };
  
  const handleRouteSave = async (date) => {
    const accounts_id = localStorage.getItem('user');
    const currentDate = date.toISOString().split('T')[0];
    const data = {
      accounts_id,
      date: currentDate,
      route: destination
    };
    try {
      const response = await fetch('http://localhost:3000/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      setEditingDestination(destination);
      
      if (response.ok) {
        setExpensesData(prev => {
          const existingRecordIndex = prev.findIndex(record => record.date === currentDate);
          if (existingRecordIndex !== -1) {
            return prev.map(record => 
              record.date === currentDate ? { ...record, destination } : record
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
    setEditingDestination(prev => ({ ...prev, [date.toISOString()]: !prev[date.toISOString()] }));
  };

  const inputRef = useRef(null);

  useEffect(() => {
    if (editingDestination && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingDestination]);

  //交通費の合計を計算
  const calculateTotal = (record) => {
    const train = parseFloat(record.train) || 0;
    const bus = parseFloat(record.bus) || 0;
    const tax = parseFloat(record.tax) || 0;
    const aircraft = parseFloat(record.aircraft) || 0;
    const other = parseFloat(record.other) || 0;
    return train + bus + tax + aircraft + other;
  };

  useEffect(() => {
    const calculateTotalExpenses = async () => {
      let total = 0;
      expensesData.forEach(record => {
        total += calculateTotal(record);
      });
    };
    calculateTotalExpenses();
  }, [expensesData, editingDestination, editingTrain, editingBus, editingTax, editingAircraft, editingOther, editingStay]);



  //各項目の合計
  useEffect(() => {
    const calculateTotals = () => {
      let trainTotal = 0;
      let busTotal = 0;
      let taxTotal = 0;
      let aircraftTotal = 0;
      let otherTotal = 0;
      let stayTotal = 0;
      let totalTotal = 0;
      let grand_totalTotal = 0;

      daysInMonth.forEach((date) => {
        const record = findAttendanceRecord(date);
        if (record) {
          trainTotal += parseFloat(record.train) || 0;
          busTotal += parseFloat(record.bus) || 0;
          taxTotal += parseFloat(record.tax) || 0;
          aircraftTotal += parseFloat(record.aircraft) || 0;
          otherTotal += parseFloat(record.other) || 0;
          stayTotal += parseFloat(record.stay) || 0;
          totalTotal += parseFloat(record.total) || 0;
          grand_totalTotal += parseFloat(record.grand_total) || 0;
        }
      });

      setTotals({
        train: trainTotal,
        bus: busTotal,
        tax: taxTotal,
        aircraft: aircraftTotal,
        other: otherTotal,
        stay: stayTotal,
        total: totalTotal,
        grand_total: grand_totalTotal
      });
    };
    calculateTotals();
  }, [daysInMonth, findAttendanceRecord]);

  //全ての合計を計算
  const grandTotal = (record) => {
    const train = parseFloat(record.train) || 0;
    const bus = parseFloat(record.bus) || 0;
    const tax = parseFloat(record.tax) || 0;
    const aircraft = parseFloat(record.aircraft) || 0;
    const other = parseFloat(record.other) || 0;
    const stay = parseFloat(record.stay) || 0;
    return train + bus + tax + aircraft + other + stay;
  };

  useEffect(() => {
    const calculateGrandTotal = () => {
      let total = 0;
      expensesData.forEach(record => {
        total += grandTotal(record);
      });
      setTotalExpenses(total);
    };
    calculateGrandTotal();
  }, [expensesData, editingDestination, editingTrain, editingBus, editingTax, editingAircraft, editingOther, editingStay]);


  
  //電車の編集
  const handleTrainChange = (newOption) => {
    setTrain(newOption);
  };

  const handleTrainSave = async (date,bus,tax,aircraft,other,stay) => {
    const accounts_id = localStorage.getItem('user');
    const currentDate = date.toISOString().split('T')[0];

    const Train = parseFloat(train) || 0;
    const Bus = parseFloat(bus) || 0;
    const Tax = parseFloat(tax) || 0;
    const Aircraft = parseFloat(aircraft) || 0;
    const Other = parseFloat(other) || 0;
    const Stay = parseFloat(stay) || 0;
    const total = Train + Bus + Tax + Aircraft + Other;
    const grand_total = Train + Bus + Tax + Aircraft + Other + Stay;

    const data = {
      accounts_id,
      date: currentDate,
      train: train,
      total: total,
      grand_total: grand_total
    };
  
    try {
      const response = await fetch('http://localhost:3000/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      setEditingTrain({});
  
      if (response.ok) {
        setExpensesData(prev => {
          const existingRecordIndex = prev.findIndex(record => record.date === currentDate);
          if (existingRecordIndex !== -1) {
            return prev.map(record => 
              record.date === currentDate ? { ...record, train } : record
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
    setEditingTrain(prev => ({ ...prev, [date.toISOString()]: !prev[date.toISOString()] }));
  };

  const inputRef2 = useRef(null);

  useEffect(() => {
    if (editingTrain && inputRef2.current) {
      inputRef2.current.focus();
    }
  }, [editingTrain]);

  //バスの編集
  const handleBusChange = (newOption) => {
    setBus(newOption);
  };

  const handleBusSave = async (date,train,tax,aircraft,other,stay) => {
    const accounts_id = localStorage.getItem('user');
    const currentDate = date.toISOString().split('T')[0];

    const Train = parseFloat(train) || 0;
    const Bus = parseFloat(bus) || 0;
    const Tax = parseFloat(tax) || 0;
    const Aircraft = parseFloat(aircraft) || 0;
    const Other = parseFloat(other) || 0;
    const Stay = parseFloat(stay) || 0;
    const total = Train + Bus + Tax + Aircraft + Other;
    const grand_total = Train + Bus + Tax + Aircraft + Other + Stay;

    const data = {
      accounts_id,
      date: currentDate,
      bus: bus,
      total: total,
      grand_total: grand_total
    };
    try {
      const response = await fetch('http://localhost:3000/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      setEditingBus(bus);
      
      if (response.ok) {
        setExpensesData(prev => {
          const existingRecordIndex = prev.findIndex(record => record.date === currentDate);
          if (existingRecordIndex !== -1) {
            return prev.map(record => 
              record.date === currentDate ? { ...record, bus } : record
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

  const toggleEditing3 = (date) => {
    setEditingBus(prev => ({ ...prev, [date.toISOString()]: !prev[date.toISOString()] }));
  };

  const inputRef3 = useRef(null);

  useEffect(() => {
    if (editingBus && inputRef3.current) {
      inputRef3.current.focus();
    }
  }, [editingBus]);

  //タクシーの編集
  const handleTaxChange = (newOption) => {
    setTax(newOption);
  };

  const handleTaxSave = async (date,train,bus,aircraft,other,stay) => {
    const accounts_id = localStorage.getItem('user');
    const currentDate = date.toISOString().split('T')[0];

    const Train = parseFloat(train) || 0;
    const Bus = parseFloat(bus) || 0;
    const Tax = parseFloat(tax) || 0;
    const Aircraft = parseFloat(aircraft) || 0;
    const Other = parseFloat(other) || 0;
    const Stay = parseFloat(stay) || 0;
    const total = Train + Bus + Tax + Aircraft + Other;
    const grand_total = Train + Bus + Tax + Aircraft + Other + Stay;

    const data = {
      accounts_id,
      date: currentDate,
      tax: tax,
      total: total,
      grand_total: grand_total
    };
    try {
      const response = await fetch('http://localhost:3000/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      setEditingTax(tax);
      
      if (response.ok) {
        setExpensesData(prev => {
          const existingRecordIndex = prev.findIndex(record => record.date === currentDate);
          if (existingRecordIndex !== -1) {
            return prev.map(record => 
              record.date === currentDate ? { ...record, tax } : record
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

  const toggleEditing4 = (date) => {
    setEditingTax(prev => ({ ...prev, [date.toISOString()]: !prev[date.toISOString()] }));
  };

  const inputRef4 = useRef(null);

  useEffect(() => {
    if (editingTax && inputRef4.current) {
      inputRef4.current.focus();
    }
  }, [editingTax])

  //航空機の編集
  const handleAircraftChange = (newOption) => {
    setAircraft(newOption);
  };

  const handleAircraftSave = async (date,train,bus,tax,other,stay) => {
    const accounts_id = localStorage.getItem('user');
    const currentDate = date.toISOString().split('T')[0];

    const Train = parseFloat(train) || 0;
    const Bus = parseFloat(bus) || 0;
    const Tax = parseFloat(tax) || 0;
    const Aircraft = parseFloat(aircraft) || 0;
    const Other = parseFloat(other) || 0;
    const Stay = parseFloat(stay) || 0;
    const total = Train + Bus + Tax + Aircraft + Other;
    const grand_total = Train + Bus + Tax + Aircraft + Other + Stay;

    const data = {
      accounts_id,
      date: currentDate,
      aircraft: aircraft,
      total: total,
      grand_total: grand_total
    };
    try {
      const response = await fetch('http://localhost:3000/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      setEditingAircraft(aircraft);
      
      if (response.ok) {
        setExpensesData(prev => {
          const existingRecordIndex = prev.findIndex(record => record.date === currentDate);
          if (existingRecordIndex !== -1) {
            return prev.map(record => 
              record.date === currentDate ? { ...record, aircraft } : record
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

  const toggleEditing5 = (date) => {
    setEditingAircraft(prev => ({ ...prev, [date.toISOString()]: !prev[date.toISOString()] }));
  };

  const inputRef5 = useRef(null);

  useEffect(() => {
    if (editingAircraft && inputRef5.current) {
      inputRef5.current.focus();
    }
  }, [editingAircraft])

  //その他の編集
  const handleOtherChange = (newOption) => {
    setOther(newOption);
  };

  const handleOtherSave = async (date,train,bus,tax,aircraft,stay) => {
    const accounts_id = localStorage.getItem('user');
    const currentDate = date.toISOString().split('T')[0];

    const Train = parseFloat(train) || 0;
    const Bus = parseFloat(bus) || 0;
    const Tax = parseFloat(tax) || 0;
    const Aircraft = parseFloat(aircraft) || 0;
    const Other = parseFloat(other) || 0;
    const Stay = parseFloat(stay) || 0;
    const total = Train + Bus + Tax + Aircraft + Other;
    const grand_total = Train + Bus + Tax + Aircraft + Other + Stay;

    const data = {
      accounts_id,
      date: currentDate,
      other: other,
      total: total,
      grand_total: grand_total
    };
    try {
      const response = await fetch('http://localhost:3000/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      setEditingOther(other);
      
      if (response.ok) {
        setExpensesData(prev => {
          const existingRecordIndex = prev.findIndex(record => record.date === currentDate);
          if (existingRecordIndex !== -1) {
            return prev.map(record => 
              record.date === currentDate ? { ...record, other } : record
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

  const toggleEditing6 = (date) => {
    setEditingOther(prev => ({ ...prev, [date.toISOString()]: !prev[date.toISOString()] }));
  };

  const inputRef6 = useRef(null);

  useEffect(() => {
    if (editingOther && inputRef6.current) {
      inputRef6.current.focus();
    }
  }, [editingOther])

  //宿泊費の編集
  const handleStayChange = (newOption) => {
    setStay(newOption);
  };

  const handleStaySave = async (date,train,bus,tax,aircraft,other) => {
    const accounts_id = localStorage.getItem('user');
    const currentDate = date.toISOString().split('T')[0];

    const Train = parseFloat(train) || 0;
    const Bus = parseFloat(bus) || 0;
    const Tax = parseFloat(tax) || 0;
    const Aircraft = parseFloat(aircraft) || 0;
    const Other = parseFloat(other) || 0;
    const Stay = parseFloat(stay) || 0;
    const grand_total = Train + Bus + Tax + Aircraft + Other + Stay;

    const data = {
      accounts_id,
      date: currentDate,
      stay: stay,
      grand_total: grand_total
    };
    try {
      const response = await fetch('http://localhost:3000/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      setEditingStay(stay);
      
      if (response.ok) {
        setExpensesData(prev => {
          const existingRecordIndex = prev.findIndex(record => record.date === currentDate);
          if (existingRecordIndex !== -1) {
            return prev.map(record => 
              record.date === currentDate ? { ...record, stay } : record
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

  const toggleEditing7 = (date) => {
    setEditingStay(prev => ({ ...prev, [date.toISOString()]: !prev[date.toISOString()] }));
  };

  const inputRef7 = useRef(null);

  useEffect(() => {
    if (editingStay && inputRef7.current) {
      inputRef7.current.focus();
    }
  }, [editingStay])

  //備考の編集
  const handleRemarksChange = (newOption) => {
    setExpensesRemarks(newOption);
  };

  const handleRemarksSave = async (date) => {
    const accounts_id = localStorage.getItem('user');
    const currentDate = date.toISOString().split('T')[0];
    const data = {
      accounts_id,
      date: currentDate,
      expenses_remarks: expensesRemarks
    };
    try {
      const response = await fetch('http://localhost:3000/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      setEditingExpensesRemarks(expensesRemarks);
      
      if (response.ok) {
        setExpensesData(prev => {
          const existingRecordIndex = prev.findIndex(record => record.date === currentDate);
          if (existingRecordIndex !== -1) {
            return prev.map(record => 
              record.date === currentDate ? { ...record, expensesRemarks } : record
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

  const toggleEditing8 = (date) => {
    setEditingExpensesRemarks(prev => ({ ...prev, [date.toISOString()]: !prev[date.toISOString()] }));
  };

  const inputRef8 = useRef(null);

  useEffect(() => {
    if (editingExpensesRemarks && inputRef8.current) {
      inputRef8.current.focus();
    }
  }, [editingExpensesRemarks])

// 「。」を改行タグに置き換える関数
const formatRemarks = (remarks) => {
  if (!remarks) return '';
  return remarks.split('。').join('。<br />');
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
              <th className ='ex_date-column'>日付</th>
              <th className ='ex_week-column'>曜日</th>
              <th className ='destination-column'>行先・経路</th>
              <th className='no-column'></th>
              <th className='no-column'></th>
              <th className='no-column'></th>
              <th id ='traveling-column'>交通費</th>
              <th className='no-column'></th>
              <th className='no-column'></th>
              <th id ='stay-column'>宿泊費</th>
              <th className ='all-column'>合計</th>
              <th className ='expenses_remarks-column'>備考</th>
            </tr>
            <tr>
              <th className='ex_date-column'></th>
              <th className ='ex_week-column'></th>
              <th className='destination-column'></th>
              <th id ='train-column'>電車</th>
              <th id ='bus-column'>バス</th>
              <th id ='tax-column'>タクシー</th>
              <th id ='aircraft-column'>航空機</th>
              <th id ='others-column'>その他</th>
              <th id ='total-column'>計</th>
              <th className='no-column'></th>
              <th className='all-column'></th>
              <th className='expenses-remarks-column'></th>
            </tr>
          </thead>
          <tbody id='at_tbody'>{daysInMonth.map((date) => {
            const record = findAttendanceRecord(date);
            const isHoliday = holidays.some(holiday => holiday.toDateString() === date.toDateString());
            const dayClass = isWeekend(date) ? (date.getUTCDay() === 6 ? 'saturday' : 'sunday') : (isHoliday ? 'holiday' : '');
            const isEditing = editingDestination[date.toISOString()];
            const isEditing2 = editingTrain[date.toISOString()];
            const isEditing3 = editingBus[date.toISOString()];
            const isEditing4 = editingTax[date.toISOString()];
            const isEditing5 = editingAircraft[date.toISOString()];
            const isEditing6 = editingOther[date.toISOString()];
            const isEditing7 = editingStay[date.toISOString()];
            const isEditing8 = editingExpensesRemarks[date.toISOString()];
            
            return (
              <tr key={date.toISOString()} className={dayClass}>
                <td>{date.toLocaleDateString('ja-JP').replace(/\//g, '/')}</td>
                <td>{getDayOfWeek(date)}</td>
                <td onClick={() => toggleEditing(date)}>
                  {isEditing ? (
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder=''
                      className='remarks2-td'
                      style={{ textAlign: 'left', width:'100%', outline: 'none', border: '1px solid #808080'}}
                      value={destination}
                      onChange={(e) => handleRouteChange(e.target.value)}
                      onClick={() => handleRouteSave(date)}  
                      onBlur={() => handleRouteSave(date)}
                    />
                  ) : (
                    record ? formatRemarks(record.route) : ''
                  )}
                </td>
                <td onClick={() => toggleEditing2(date)}>
                  {isEditing2 ? (
                    <input
                      ref={inputRef2}
                      type="text"
                      placeholder=''
                      className='remarks2-td'
                      style={{ textAlign: 'left', width:'100%', outline: 'none', border: '1px solid #808080'}}
                      value={train}
                      onChange={(e) => handleTrainChange(e.target.value)}
                      onClick={() => handleTrainSave(date,record ? record.bus : '', record ? record.tax : '',record ? record.aircraft : '',record ? record.other : '',record ? record.stay : '')}  
                      onBlur={() => handleTrainSave(date)}
                    />
                  ) : (
                    record ? record.train : ''
                  )}
                </td>
                <td onClick={() => toggleEditing3(date)}>
                  {isEditing3 ? (
                    <input
                      ref={inputRef3}
                      type="text"
                      placeholder=''
                      className='remarks2-td'
                      style={{ textAlign: 'left', width:'100%', outline: 'none', border: '1px solid #808080'}}
                      value={bus}
                      onChange={(e) => handleBusChange(e.target.value)}
                      onClick={() => handleBusSave(date,record ? record.train : '', record ? record.tax : '',record ? record.aircraft : '',record ? record.other : '',record ? record.stay : '')}  
                      onBlur={() => handleBusSave(date)}
                    />
                  ) : (
                    record ? record.bus : ''
                  )}
                </td>
                <td onClick={() => toggleEditing4(date)}>
                  {isEditing4 ? (
                    <input
                      ref={inputRef4}
                      type="text"
                      placeholder=''
                      className='remarks2-td'
                      style={{ textAlign: 'left', width:'100%', outline: 'none', border: '1px solid #808080'}}
                      value={tax}
                      onChange={(e) => handleTaxChange(e.target.value)}
                      onClick={() => handleTaxSave(date,record ? record.train : '', record ? record.bus : '',record ? record.aircraft : '',record ? record.other : '',record ? record.stay : '')}  
                      onBlur={() => handleTaxSave(date)}
                    />
                  ) : (
                    record ? record.tax : ''
                  )}
                </td>
                <td onClick={() => toggleEditing5(date)}>
                  {isEditing5 ? (
                    <input
                      ref={inputRef5}
                      type="text"
                      placeholder=''
                      className='remarks2-td'
                      style={{ textAlign: 'left', width:'100%', outline: 'none', border: '1px solid #808080'}}
                      value={aircraft}
                      onChange={(e) => handleAircraftChange(e.target.value)}
                      onClick={() => handleAircraftSave(date,record ? record.train : '', record ? record.bus : '',record ? record.tax : '',record ? record.other : '',record ? record.stay : '')}  
                      onBlur={() => handleAircraftSave(date)}
                    />
                  ) : (
                    record ? record.aircraft : ''
                  )}
                </td>
                <td onClick={() => toggleEditing6(date)}>
                  {isEditing6 ? (
                    <input
                      ref={inputRef6}
                      type="text"
                      placeholder=''
                      className='remarks2-td'
                      style={{ textAlign: 'left', width:'100%', outline: 'none', border: '1px solid #808080'}}
                      value={other}
                      onChange={(e) => handleOtherChange(e.target.value)}
                      onClick={() => handleOtherSave(date,record ? record.train : '', record ? record.bus : '',record ? record.tax : '',record ? record.aircraft : '',record ? record.stay : '')}  
                      onBlur={() => handleOtherSave(date)}
                    />
                  ) : (
                    record ? record.other : ''
                  )}
                </td>
                <td>{calculateTotal(record) > 0 ? calculateTotal(record) : ''}</td>
                <td onClick={() => toggleEditing7(date)}>
                  {isEditing7 ? (
                    <input
                      ref={inputRef7}
                      type="text"
                      placeholder=''
                      className='remarks2-td'
                      style={{ textAlign: 'left', width:'100%', outline: 'none', border: '1px solid #808080'}}
                      value={stay}
                      onChange={(e) => handleStayChange(e.target.value)}
                      onClick={() => handleStaySave(date,record ? record.train : '', record ? record.bus : '',record ? record.tax : '',record ? record.aircraft : '',record ? record.other : '')}  
                      onBlur={() => handleStaySave(date)}
                    />
                  ) : (
                    record ? record.stay : ''
                  )}
                </td>
                <td>{grandTotal(record) > 0 ? grandTotal(record) : ''}</td>
                <td onClick={() => toggleEditing8(date)}>
                  {isEditing8 ? (
                    <input
                      ref={inputRef8}
                      type="text"
                      placeholder=''
                      className='remarks2-td'
                      style={{ textAlign: 'left', width:'100%', outline: 'none', border: '1px solid #808080'}}
                      value={expensesRemarks}
                      onChange={(e) => handleRemarksChange(e.target.value)}
                      onClick={() => handleRemarksSave(date)}  
                      onBlur={() => handleRemarksSave(date)}
                    />
                  ) : (
                    record ? record.expenses_remarks : ''
                  )}
                </td>
              </tr>
              );
            })}
            <tr>
              <td colSpan="3">合計</td>
              <td>{totals.train}</td>
              <td>{totals.bus}</td>
              <td>{totals.tax}</td>
              <td>{totals.aircraft}</td>
              <td>{totals.other}</td>
              <td>{totals.total}</td>
              <td>{totals.stay}</td>
              <td>{totals.grand_total}</td>
              <td></td>
            </tr>
          </tbody>
        </table>
        <div id='grand_total_area'>合計金額 : <span id='grand_total_under'>&nbsp;&nbsp;&nbsp;{totals.grand_total} 円&nbsp;&nbsp;&nbsp;</span></div>
      </div>
      <div id='expenses_link_area'>
          <Link to="/attendance_table" id='expenses_link'>← 勤怠一覧ページ</Link>
      </div>
    </div>
  )
}

export default ExpensesPage;