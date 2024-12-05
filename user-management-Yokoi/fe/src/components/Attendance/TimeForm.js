import React, { useState, useEffect } from 'react';
import { standardTime, postStandardTime } from '../../apiCall/apis';
import { totalWorkHours, calculateNetWorkHours } from '../../common/format';

const TimeForm = (props) => {

  const accounts_id = localStorage.getItem('user');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [breakTime, setBreakTime] = useState('01:00');
  const [workHours, setWorkHours] = useState('08:00');

  //ユーザーIDをもとに標準勤務時間を取得、データがあればインプットにデフォルト表示
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

  //標準勤務時間を登録
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      accounts_id,
      start_time: startTime,
      end_time: endTime,
      break_time: breakTime,
      work_hours: workHours
    };
    try {
      await postStandardTime(data);
      alert('データが保存されました');
      window.location.reload();
    } catch (error) {
      console.error('Error saving data:', error);
      alert('データの保存に失敗しました');
    }
  };

  const work_hours = totalWorkHours(startTime, endTime);

  useEffect(() => {
    if (startTime && endTime && breakTime) {
      const WorkHours = calculateNetWorkHours(work_hours, breakTime);
      setWorkHours(WorkHours);
    }
  }, [startTime, endTime, breakTime, work_hours]);

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
        </div>
        <div id='time_bt'>
          <button type='submit' id='over_time_button'>登録</button>
        </div>
      </div>
    </form>
  );
};

export default TimeForm;


