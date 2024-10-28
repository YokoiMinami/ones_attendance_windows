import React, { useState, useEffect } from 'react';
import { Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { useNavigate,useParams } from 'react-router-dom';
import { TextField, Autocomplete } from '@mui/material';


const TimeForm = (props) => {
  const [items, setItems] = useState([]); 
  const [projects, setProjects] = useState('');
  const [company, setCompany] = useState('');
  const [name, setName] = useState('');

  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [breakTime, setBreakTime] = useState('01:00');
  const [workHours, setWorkHours] = useState('08:00');

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
      if (data.start_time) setStartTime(data.start_time);
      if (data.end_time) setEndTime(data.end_time);
      if (data.break_time) setBreakTime(data.break_time);
    })
    .catch(err => console.log(err));
  }, []);

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
        window.location.reload();
      } else {
        alert('データの保存に失敗しました');
      }
    } catch (error) {
      console.error('Error saving data:', error);
      alert('データの保存に失敗しました');
    }
  };

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
const CalculateWorkHours2 = (work_hours, breakTime) => {
  // 時間文字列をDateオブジェクトに変換
  const checkOllTime = new Date(`1970-01-01T${work_hours}`);
  const checkBreakTime = new Date(`1970-01-01T${breakTime}`);
  
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

  useEffect(() => {
    if (startTime && endTime && breakTime) {
      const WorkHours = CalculateWorkHours2(work_hours, breakTime);
      setWorkHours(WorkHours);
    }
  }, [startTime, endTime, breakTime]);
  
//   const addItemToState = (item) => {
//     window.location.reload();
//     setItems(prevItems => [...prevItems, item]);
// };


    return (
      <form onSubmit={handleSubmit}>
        <div id='time_area'>
          <div className='time_area_box'>
            <label className='time_label'>出勤時間 : </label>
              <input type='time' className='over_time_input' value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </div>
          <div className='time_area_box'>
            <label className='time_label'>退勤時間 : </label>
            <input type='time' className='over_time_input' value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>
          <div className='time_area_box'>
            <label className='time_label'>休憩時間 : </label>
            <input type='time' className='over_time_input' value={breakTime} onChange={(e) => setBreakTime(e.target.value)} />
          </div>
          <div className='time_area_box'>
            <label className='time_label'>勤務時間 : </label>
            <span id='over_time_text'>&nbsp;&nbsp;{workHours}&nbsp;&nbsp;</span>
            {/* <input type='time' className='over_time_input' value={workHours} onChange={(e) => setWorkHours(e.target.value)} /> */}
          </div>
          <div id='time_bt'>
            <button type='submit' id='over_time_button'>登録</button>
          </div>
        </div>
      </form>
    );
};

export default TimeForm;


