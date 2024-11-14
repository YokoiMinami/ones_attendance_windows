import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import OnesLogo from '../../images/ones-logo.png';
import MemberModal from './MemberModal';
import holidayJp from '@holiday-jp/holiday_jp';
import { startOfWeek, endOfWeek, subWeeks } from 'date-fns';

const Member = () => {
  const id = localStorage.getItem('user');
  const [userData, setUserData] = useState(null);
  const [authorityData, setAuthorityData] = useState(false);
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [attendanceData, setAttendanceData] = useState({}); 
  const [costData, setCostData] = useState({}); 
  const [costState, setCostState] = useState(''); 
  const [formattedAttendanceData, setFormattedAttendanceData] = useState([]); //日付を修正した勤怠データ
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [monthData, setMonthData] = useState({}); 
  const [totalHours, setTotalHours] = useState({}); //実際の稼働時間
  const [dayAverage, setDayAverage] = useState(0); //1日平均勤務時間
  const [monthAverage, setMonthAverage] = useState(0); //月平均勤務時間
  const [weekAverage, setWeekAverage] = useState(0); //直近の1日平均勤務時間
  const [weekMonthAverage, setWeekMonthAverage] = useState(0); //直近の月平均勤務時間
  const [weekMonthAverage2, setWeekMonthAverage2] = useState(0); //直近の月平均勤務時間計算用
  const [remainingTime, setRemainingTime] = useState(''); //月予測と規定勤務時間の比較
  const [isOvertime, setIsOvertime] = useState(false); //月予測勤務時間が規定を超えるか
  const [isOvertime2, setIsOvertime2] = useState(false); //直近予測勤務時間が規定を超えるか
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [holidaysAndWeekendsCount, setHolidaysAndWeekendsCount] = useState(0); //今月の規定勤務日数
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetch(`http://localhost:3000/user/${id}`, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.json())
      .then(data => {
        setUserData(data);
        if (data.authority === true) {
          setAuthorityData(true);
        }
      })
      .catch(err => console.log(err));
  }, [id]);

  const getItems = () => {
    fetch('http://localhost:3000/get')
      .then(response => response.json())
      .then(items => {
        setItems(items);
        setFilteredItems(items);
      })
      .catch(err => console.log(err));
  };

  const now = new Date();
  // 1週間前の同じ曜日の日付を取得
  const oneWeekAgo = subWeeks(now, 1);
  // 先週の月曜日の日付を取得
  const lastMonday = startOfWeek(oneWeekAgo, { weekStartsOn: 1 });
  // 先週の日曜日の日付を取得
  const lastSunday = endOfWeek(oneWeekAgo, { weekStartsOn: 1 });

  // 日付の時刻部分をクリア（00:00:00に設定）
  lastMonday.setHours(0, 0, 0, 0);
  lastSunday.setHours(23, 59, 59, 999);

  // 先週の月を取得  
  const lastMondayMonth = lastMonday.getMonth() + 1; 
  const lastSundayMonth = lastSunday.getMonth() + 1; 

  const year2 = now.getFullYear();
  const month2 = String(now.getMonth() + 1).padStart(2, '0'); // 月は0から始まるため+1
  const day = String(now.getDate()).padStart(2, '0'); // 日付
  const date = `${year2}-${month2}-${day}`;
  const date2 = `${year2}/${month2}`;

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
    //setDaysInMonth(days);
  }, [year,month]); //monthが変更されるたびに実行する

  //出勤時間と退勤時間をフォーマット
  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  //各メンバーの出勤、退勤時間を取得
  useEffect(() => {
    const fetchAttendanceData = async (accounts_id) => {
      try {
        const response = await fetch(`http://localhost:3000/attendance/attendance/${accounts_id}/${date}`);
        const data = await response.json();
        setAttendanceData(prevData => ({
          ...prevData,
          [accounts_id]: data || [] 
        }));
      } catch (error) {
        console.error('Error fetching attendance data:', error);
      }
    };
    filteredItems.forEach(item => {
      fetchAttendanceData(item.id);
    });
  }, [filteredItems]);
  

  //各メンバーの経費申請状況を取得
  useEffect(() => {
    const fetchCostData = async (accounts_id) => {
      
      try {
        const response = await fetch(`http://localhost:3000/projects/${accounts_id}/${year}/${month}`);
        const data = await response.json();
        const registration_date  = data.registration_date;
        const app_flag = data.app_flag;

        if(app_flag){
          setCostState(prevData => ({
            ...prevData,
            [accounts_id]: '承認待ち' || [] 
          }));
        }else if(!app_flag && registration_date){
          setCostState(prevData => ({
            ...prevData,
            [accounts_id]: '承認済み' || [] 
          }));
        }else{
          setCostState(prevData => ({
            ...prevData,
            [accounts_id]: '未申請' || [] 
          }));
        }
      } catch (error) {
        console.error('Error fetching attendance data:', error);
      }
    };
    filteredItems.forEach(item => {
      fetchCostData(item.id);
    });
  }, [filteredItems]);


  useEffect(() => {
    const formattedMonth = month.toString().padStart(2, '0');
  
    const fetchTotalHours = async (accounts_id) => {
      try {
        
        const response = await fetch(`http://localhost:3000/attendance/total_hours/${accounts_id}/${year}/${formattedMonth}/${lastMonday}/${lastSunday}`);
        const data = await response.json();
        const monthAverage = data.average_time_per_day;
        const weekAverage = data.week_average_time_per_day;

        if (monthAverage) {
          // 月勤務時間の分数
          const multipliedWorkHoursInMinutes = monthAverage * holidaysAndWeekendsCount;
          const multipliedWorkHoursInMinutes2 = weekAverage * holidaysAndWeekendsCount;
          
          // 月の残業判定
          setIsOvertime(prevState => ({
            ...prevState,
            [accounts_id]: multipliedWorkHoursInMinutes > 12000
          }));

          // 週の残業判定
          setIsOvertime2(prevState => ({
            ...prevState,
            [accounts_id]: multipliedWorkHoursInMinutes2 > 12000
          }));

          // 月予測勤務時間をhh:mm形式に変換
          const hours = Math.floor(multipliedWorkHoursInMinutes / 60).toString().padStart(2, '0');
          const minutes = (multipliedWorkHoursInMinutes % 60).toString().padStart(2, '0');
          const multipliedWorkHours = `${hours}:${minutes}`;
  
          // 週予測勤務時間をhh:mm形式に変換
          const hours2 = Math.floor(multipliedWorkHoursInMinutes2 / 60).toString().padStart(2, '0');
          const minutes2 = (multipliedWorkHoursInMinutes2 % 60).toString().padStart(2, '0');
          const multipliedWorkHours2 = `${hours2}:${minutes2}`;

          if (response.ok) {
            setTotalHours(prevData => ({
              ...prevData,
              [accounts_id]: data.total_hours
            }));
            setMonthAverage(prevData => ({
              ...prevData,
              [accounts_id]: multipliedWorkHours
            }));
            setWeekMonthAverage(prevData => ({
              ...prevData,
              [accounts_id]: multipliedWorkHours2
            }));
          } else {
            throw new Error(data.error);
          }
        } else {
          if (response.ok) {
            setTotalHours(prevData => ({
              ...prevData,
              [accounts_id]: data.total_hours
            }));
            setMonthAverage(prevData => ({
              ...prevData,
              [accounts_id]: ''
            }));
            setWeekMonthAverage(prevData => ({
              ...prevData,
              [accounts_id]: ''
            }));
          } else {
            throw new Error(data.error);
          }
        }
      } catch (error) {
        console.error('Error fetching total hours:', error);
        setError(error.message);
      }
    };
  
    const fetchAllTotalHours = async () => {
      const promises = filteredItems.map(item => fetchTotalHours(item.id));
      await Promise.all(promises);
    };
  
    fetchAllTotalHours();
  }, [filteredItems]);
  

  const deleteItems = () => {
    if (selectedItems.length === 0) {
      alert('アカウントが選択されていません');
      return;
    }
    let confirmDelete = window.confirm('チェックしたメンバーを削除しますか？');
    if (confirmDelete) {
      selectedItems.forEach(itemId => {
        fetch('http://localhost:3000/delete', {
          method: 'delete',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ id: itemId })
        })
          .then(response => response.json())
          .then(() => {
            setItems(prevItems => prevItems.filter(item => item.id !== itemId));
            setFilteredItems(prevItems => prevItems.filter(item => item.id !== itemId));
          })
          .catch(err => console.log(err));
      });
    }
  };

  const handleCheckboxChange = (event, itemId) => {
    if (event.target.checked) {
      setSelectedItems(prevSelected => [...prevSelected, itemId]);
    } else {
      setSelectedItems(prevSelected => prevSelected.filter(id => id !== itemId));
    }
  };

  const handleSearch = () => {
    const filtered = items.filter(item => 
      item.fullname.includes(searchQuery) || item.kananame.includes(searchQuery)
    );
    setFilteredItems(filtered);
  };

  const addItemToState = (item) => {
    window.location.reload();
    setItems(prevItems => [...prevItems, item]);
    setFilteredItems(prevItems => [...prevItems, item]);
  };

  useEffect(() => {
    getItems();
  }, []);

  const getTextColor = (status) => {
    switch (status) {
      case '承認待ち':
        return 'crimson';
      case '承認済み':
        return '#266ebd';
      default:
        return '#808080';
    }
  };

  return (
    <div id='member_page'>
      <div id='member_top'>
        <div id='member_user_name_area'>
          <p id='member_user_name'>{userData ? userData.fullname : ''} さん</p>
        </div>
        <h1 id='member_h1'>メンバー管理</h1>
      </div>
      <div id='member_midle_area'>
        <div id='member_new_button'>
          <MemberModal buttonLabel="新規登録" addItemToState={addItemToState} />
        </div>
        <div id='member_midle'>
          <div id='member_input_area'>
            <input
              type='text'
              id='member_input'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div id='member_button_area'>
            <button id='member_search_button' onClick={handleSearch}>検索</button>
            <button id='member_delete_button' onClick={deleteItems}>削除</button>
          </div>
        </div>
      </div>
      <div id='member_table_area'>
        <table id='member_table'>
          <thead>
            <tr>
              <th id='check_cl'></th>
              <th id='no_cl'>No.</th>
              <th id='name_cl'>氏名</th>
              <th id='kana_cl'>シメイ</th>
              <th id='in_cl'>出勤</th>
              <th id='out_cl'>退勤</th>
              <th id='over_cl'>総勤務時間</th>
              <th id='over_cl2'>月予測</th>
              <th id='over_cl3'>直近予測</th>
              <th id='revision_cl'>勤怠修正</th>
              <th id='cost_cl'>経費申請</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item, index) => (
              <tr key={item.id}>
                <td>
                  <input
                    type="checkbox"
                    onChange={(event) => handleCheckboxChange(event, item.id)}
                  />
                </td>
                <td>{index + 1}</td>
                <td><Link to={`/user/${item.id}`} className='member_link'>{item.fullname}</Link></td>
                <td>{item.kananame}</td>
                <td>
                  {attendanceData[item.id] && Array.isArray(attendanceData[item.id])
                    ? attendanceData[item.id].map(att => formatTime(att.check_in_time)).join(', ')
                    : ''}
                </td>
                <td>
                  {attendanceData[item.id] && Array.isArray(attendanceData[item.id]) && attendanceData[item.id].some(att => att.check_out_time)
                    ? attendanceData[item.id].map(att => formatTime(att.check_out_time)).join(', ')
                    : ''}
                </td>
                <td>
                  {totalHours[item.id] !== undefined ? totalHours[item.id] : ''}
                </td>
                <td>
                  <span className={`${isOvertime[item.id] ? 'overtime2' : 'value2'}`}> 
                    {monthAverage[item.id] !== undefined ? monthAverage[item.id] : ''} 
                  </span>
                </td>
                <td>
                <span className={`${isOvertime2[item.id] ? 'overtime2' : 'value2'}`}> 
                  {weekMonthAverage[item.id] !== undefined ? weekMonthAverage[item.id] : ''} 
                </span>
                </td>
                <td><Link to={`/attendance/${item.id}`} className='member_link'>修正</Link></td>
                <td>
                  <Link to={`/cost/${item.id}`} style={{ color: getTextColor(costState[item.id])}}>{costState[item.id] !== undefined ? costState[item.id] : '未申請'}</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div id='member_botom'>
        <div id='member_link_area'>
          <Link to="/" id='member_link'>← トップページ</Link>
        </div>
        <div id='member_page_logo'>
          <img src={OnesLogo} alt="Ones" />
        </div>
      </div>
    </div>
  );
};

export default Member;
