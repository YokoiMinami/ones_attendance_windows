import React, { useEffect, useState } from 'react';
import TopButton from './TopButton';
import OnesLogo from '../../images/ones-logo.png';
import DigitalClock from './DigitalClock';
import { fetchUserData, fetchAttendanceStatus, postAttendance, fetchCheckInTime } from '../../apiCall/apis';
import { roundUpToQuarterHour, roundDownToQuarterHour, formatDate2, formatTime2, calculateWorkHours, calculateNetWorkHours } from '../../common/format';

const TopPage = () => {

  //ユーザー情報
  const accounts_id = localStorage.getItem('user');
  const [userData, setUserData] = useState(null);

  //勤怠情報
  const [remarks1, setRemarks1] = useState('');
  const [remarks2, setRemarks2] = useState('');
  const [out_remarks1, setOutRemarks1] = useState('');
  const [out_remarks2, setOutRemarks2] = useState('');
  const [isCheckedIn, setIsCheckedIn] = useState(false); // 出勤状態を管理するフラグ
  const [break_time, setBreakTime] = useState('01:00');  
  const [midFlag, setMidFlag] = useState(false);

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

  //出勤状況を取得
  useEffect(() => {
    const getAttendanceStatus = async () => {
      try {
        const data = await fetchAttendanceStatus(accounts_id);
        setIsCheckedIn(data.is_checked_in);
        setMidFlag(data.midFlag);
      } catch (err) {
        console.log(err);
      }
    };
    getAttendanceStatus();
  }, [accounts_id]);

  if (!userData) {
    return <div>Loading...</div>;
  }

  //出勤処理
  const handleCheckIn = async () => {
    const now = new Date();
    const currentDate = formatDate2(now);
    const currentTime = formatTime2(now);
    const roundedCheckInTime = roundUpToQuarterHour(currentTime);

    const requestBody = {
      accounts_id,
      date: currentDate,
      check_in_time: roundedCheckInTime,
      remarks1,
      remarks2,
      is_checked_in: true
    };

    try {
      const message = await postAttendance(requestBody);
      alert(message);
      setIsCheckedIn(true); // 出勤状態を更新
    } catch (error) {
      console.error('Error recording attendance:', error);
    }
  };

  //退勤処理
  const handleCheckOut = async () => {
    const now = new Date();
    const currentDate = formatDate2(now);
    const currentTime = formatTime2(now);
    const roundedCheckOutTime = roundDownToQuarterHour(currentTime);
    const previousDate = formatDate2(new Date(now.setDate(now.getDate() - 1)));

    let checkinTime, checkinDate, mid_flag;
    try {
      const data = midFlag
        ? await fetchCheckInTime(accounts_id, currentDate)
        : await fetchCheckInTime(accounts_id, previousDate);
      checkinTime = data.check_in_time;
      checkinDate = data.date;
      mid_flag = !midFlag;
    } catch (error) {
      console.error('Error fetching check-in time:', error);
      alert('出勤時刻の取得に失敗しました。');
      return;
    }

    const work_hours = calculateWorkHours(checkinDate, checkinTime, currentDate, roundedCheckOutTime);
    const workHours = calculateNetWorkHours(work_hours, break_time);

    const requestBody = {
      accounts_id,
      date: checkinDate,
      check_out_time: roundedCheckOutTime,
      break_time: break_time,
      work_hours: workHours,
      out_remarks1: out_remarks1,
      out_remarks2: out_remarks2,
      is_checked_in: isCheckedIn,
      mid_flag: mid_flag
    };

    try {
      const message = await postAttendance(requestBody);
      alert(message);
      window.location.reload();
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
        <p>{userData.fullname} さん</p>
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