import React, { useState, useEffect } from 'react';

const HolidayForm = (props) => {

  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [day, setDay] = useState('');
  const [input_date, setInputDate] = useState('');
  const [weekday, setWeekday] = useState('');

  const calculateWeekday = () => {
    const date = new Date(year, month - 1, day);
    const days = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];
    setWeekday(days[date.getDay()]);
  };

  // 年、月、日が変更されたときに曜日を計算
  useEffect(() => {
    if (input_date) {
      calculateWeekday();
    }
  }, [input_date]);

  const submitFormAdd = async (e) => {
    e.preventDefault();
    const accounts_id = localStorage.getItem('user');
    const data = {
      accounts_id,
      date: input_date,
      week: weekday
    };
    try {
      const response = await fetch('http://localhost:3000/holiday', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
      });
      if (response.ok) {
        window.location.reload();
      } else {
        alert('データの保存に失敗しました');
      }
    } catch (error) {
      console.error('Error saving data:', error);
      alert('データの保存に失敗しました');
    }
  };

  return (
  <form onSubmit={submitFormAdd}>
    <div id='holiday_input_area'>
      <input type="date" name="date" id="holiday_input" onChange={(e) => setInputDate(e.target.value)} value={input_date}/>
    </div>
    <div id='h_button_area'>
      <button type='submit' id='h_button'>登録</button>
    </div>
  </form>
  );
};

export default HolidayForm;


