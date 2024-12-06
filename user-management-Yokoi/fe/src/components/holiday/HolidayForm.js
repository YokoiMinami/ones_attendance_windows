import React, { useState, useEffect } from 'react';
import { addHoliday } from '../../apiCall/apis';

const HolidayForm = (props) => {
  const accounts_id = localStorage.getItem('user');
  const [input_date, setInputDate] = useState('');
  const [weekday, setWeekday] = useState('');

  useEffect(() => {
    const calculateWeekday = () => {
      const date = new Date(input_date);
      const days = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];
      setWeekday(days[date.getDay()]);
    };

    if (input_date) {
      calculateWeekday();
    }
  }, [input_date]);

  const submitFormAdd = async (e) => {
    e.preventDefault();
    
    const data = {
      accounts_id,
      date: input_date,
      week: weekday
    };
    try {
      const response = await addHoliday(data);
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
        <input 
          type="date" 
          name="date" 
          id="holiday_input" 
          onChange={(e) => setInputDate(e.target.value)} 
          value={input_date} 
        />
      </div>
      <div id='h_button_area'>
        <button type='submit' id='h_button'>登録</button>
      </div>
    </form>
  );
};

export default HolidayForm;