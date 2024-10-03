import React, { useEffect, useState } from 'react';
import TopButton from './TopButton';
import OnesLogo from '../../images/ones-logo.png';
import DigitalClock from './DigitalClock';

const TopPage = () => {

  //ユーザー情報
  const id = localStorage.getItem('user');
  const [userData, setUserData] = useState(null);

  //勤怠情報
  const [remarks1, setRemarks1] = useState('');
  const [remarks2, setRemarks2] = useState('');
  const [out_remarks1, setOutRemarks1] = useState('');
  const [out_remarks2, setOutRemarks2] = useState('');
  const [isCheckedIn, setIsCheckedIn] = useState(false); // 出勤状態を管理するフラグ
  const [break_time, setBreakTime] = useState('01:00');  

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

  useEffect(() => {
    // 出勤状態を取得するためのAPI呼び出し
    fetch(`http://localhost:3000/attendance/status/${id}`, {
      method: 'get',
      headers: {
      'Content-Type': 'application/json'
    }
    })
      .then(response => response.json())
      .then(data => setIsCheckedIn(data.is_checked_in))
      .catch(err => console.log(err));
  }, [id]);

  if (!userData) {
    return <div>Loading...</div>;
  }
  //15分繰り上げる
  const roundUpToQuarterHour = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    const roundedMinutes = Math.ceil(totalMinutes / 15) * 15;
    const roundedHours = Math.floor(roundedMinutes / 60).toString().padStart(2, '0');
    const roundedMins = (roundedMinutes % 60).toString().padStart(2, '0');
    return `${roundedHours}:${roundedMins}`;
  };  

  //出勤処理
  const handleCheckIn = async () => {
    const accounts_id = localStorage.getItem('user');
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0].slice(0, 5);

    // 現在の時間を15分単位に繰り上げ
    const roundedCheckInTime = roundUpToQuarterHour(currentTime);

    const requestBody = {
      accounts_id,
      date: currentDate,
      check_in_time: roundedCheckInTime,
      remarks1,
      remarks2
    };

    try {
      const response = await fetch('http://localhost:3000/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const message = await response.text();
      alert(message);
      setIsCheckedIn(true); // 出勤状態を更新
    } catch (error) {
      console.error('Error recording attendance:', error);
    }
  };

  //退勤時間を15分切り捨て
  const roundDownToQuarterHour = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    const roundedMinutes = Math.floor(totalMinutes / 15) * 15;
    const roundedHours = Math.floor(roundedMinutes / 60).toString().padStart(2, '0');
    const roundedMins = (roundedMinutes % 60).toString().padStart(2, '0');
    return `${roundedHours}:${roundedMins}`;
  };  

  //退勤処理
  const handleCheckOut = async () => {
    const accounts_id = localStorage.getItem('user');
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0].slice(0, 5);
    const date = now.toISOString().split('T')[0];

    // 現在の時間を15分単位に切り捨て
    const roundedCheckOutTime = roundDownToQuarterHour(currentTime);
    
    // 出勤時刻を取得するためのAPI呼び出し
    let checkinTime;
    try {
      const response = await fetch(`http://localhost:3000/attendance/checkin/${accounts_id}/${date}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      checkinTime = data.check_in_time;
    } catch (error) {
      console.error('Error fetching check-in time:', error);
      alert('出勤時刻の取得に失敗しました。');
      return;
    }
  
    // 出勤から退勤を引いて全勤務時間を計算
    const calculateWorkHours = (checkInTimeString, checkOutTimeString ) => {
      // 時間文字列をDateオブジェクトに変換
      const checkInTime = new Date(`1970-01-01T${checkInTimeString}`);
      const checkOutTime = new Date(`1970-01-01T${checkOutTimeString}`);
      
      // 日付の有効性をチェック
      const isValidDate = (date) => date instanceof Date && !isNaN(date);
      if (!isValidDate(checkInTime) || !isValidDate(checkOutTime)) {
        //テスト用

        return '計算できませんでした';
      }
  
      // 時間の差を計算
      const diff = checkOutTime - checkInTime;
      console.log(diff);
      const hours = Math.floor(diff / 1000 / 60 / 60).toString().padStart(2, '0');
      const minutes = Math.floor((diff / 1000 / 60) % 60).toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    };

    const work_hours = calculateWorkHours(checkinTime, roundedCheckOutTime);

    // 全勤務時間から休憩時間を引いて勤務時間を計算
    const CalculateWorkHours = (checkOllTimeString, checkBreakTimeString ) => {
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
      console.log(diff);
      const hours = Math.floor(diff / 1000 / 60 / 60).toString().padStart(2, '0');;
      const minutes = Math.floor((diff / 1000 / 60) % 60).toString().padStart(2, '0');;
      return `${hours}:${minutes}`;
    };
  
    const workHours = CalculateWorkHours(work_hours, break_time);

    const requestBody = {
      accounts_id,
      date: currentDate,
      check_out_time: roundedCheckOutTime,
      break_time: break_time,
      work_hours: workHours,
      out_remarks1: out_remarks1,
      out_remarks2: out_remarks2
    };
  
    try {
      const response = await fetch('http://localhost:3000/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
  
      const message = await response.text();
      alert(message);
      setIsCheckedIn(false); // 出勤状態を更新
    } catch (error) {
      console.error('Error recording attendance:', error);
    }
  };
  
  return (
    <div className ="top_flex">
      <div className ="box1">
        <TopButton />
        <div id='top_ones_logo'>
          <img src={OnesLogo} alt="Ones" style={{ width: '150px', height: '150px', objectFit: 'cover' }} />
        </div>
      </div>
      <div className = "box2">
        <p>{userData.fullname}</p>
      </div>
      <div className = "box3">
        <h1>勤怠登録</h1>
        <div id = 'top_clock'>
          <DigitalClock />
        </div>
        {!isCheckedIn ? (
        <>
        <div id='top_r_all'>
          <div id='topbreak'>
          </div>
          <div id='top_drops'>
            <div id='top_drop_text'>
              特記 : 
            </div>
            <div>
              <select className='top_drop_comp' value={remarks1} onChange={(e) => setRemarks1(e.target.value)}>
                <option value="">選択してください</option>
                <option value="遅刻">遅刻</option>
                <option value="早退">早退</option>
                <option value="休日出勤">休日出勤</option>
              </select>
            </div>
          </div>
          <div id='toptextarea'>
            <div id='top_label'>
              <label>備考 : </label>
            </div>
            <div>
              <textarea className="textarea-top" value={remarks2} onChange={(e) => setRemarks2(e.target.value)} />
            </div>
          </div>
        </div>
        </>
        ) : (
        <>
        <div id='top_r_all'>
          <div id='topbreak'>
            <label>休憩時間 : </label>
            <input type='time' step="900" id='break_input' value={break_time} onChange={(e) => setBreakTime(e.target.value)} />
          </div>
          <div id='top_drops'>
            <div id='top_drop_text'>
              特記 : 
            </div>
            <div>
              <select className='top_drop_comp' value={out_remarks1} onChange={(e) => setOutRemarks1(e.target.value)}>
                <option value="">選択してください</option>
                <option value="遅刻">遅刻</option>
                <option value="早退">早退</option>
                <option value="休日出勤">休日出勤</option>
              </select>
            </div>
          </div>
          <div id='toptextarea'>
            <div id='top_label'>
              <label>備考 : </label>
            </div>
            <div>
              <textarea className="textarea-top" value={out_remarks2} onChange={(e) => setOutRemarks2(e.target.value)} />
            </div>
          </div>
        </div>
        </>
        )}
        <button id='top_button' onClick={isCheckedIn ? handleCheckOut : handleCheckIn}>
          {isCheckedIn ? '退勤' : '出勤'}
        </button>
      </div>
    </div>
  );
};

export default TopPage;