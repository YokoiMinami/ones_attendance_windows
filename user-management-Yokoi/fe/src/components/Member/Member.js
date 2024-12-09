import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import OnesLogo from '../../images/ones-logo.png';
import MemberModal from './MemberModal';
import holidayJp from '@holiday-jp/holiday_jp';
import { startOfWeek, endOfWeek, subWeeks } from 'date-fns';
import { fetchUserData, getItems, todayAttendanceData, fetchCostData, fetchTotalHours, deleteItem } from '../../apiCall/apis';
import { getDaysInMonth, isWeekend } from '../../constants/date';
import { formatDate2, attendanceFormatTime, convertMinutesToTime } from '../../common/format';
import { getTextColor } from '../../constants/style' ;

const Member = () => {
  const accounts_id = localStorage.getItem('user');
  const [userData, setUserData] = useState(null);
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});  
  const [costState, setCostState] = useState(''); 
  const [totalHours, setTotalHours] = useState({}); //実際の稼働時間
  const [monthAverage, setMonthAverage] = useState(0); //月平均勤務時間
  const [weekMonthAverage, setWeekMonthAverage] = useState(0); //直近の月平均勤務時間
  const [isOvertime, setIsOvertime] = useState(false); //月予測勤務時間が規定を超えるか
  const [isOvertime2, setIsOvertime2] = useState(false); //直近予測勤務時間が規定を超えるか
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const [holidaysAndWeekendsCount, setHolidaysAndWeekendsCount] = useState(0); //今月の規定勤務日数
  
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

  //メンバーデータを全て取得
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const items = await getItems();
        setItems(items);
        setFilteredItems(items);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };

    fetchItems();
  }, []);

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

  //今日の日付
  const date = formatDate2(now);

  //祝日を取得
  const getHolidaysInMonth = (year, month) => {
    const holidays = holidayJp.between(new Date(year, month - 1, 1), new Date(year, month, 0));
    return holidays.map(holiday => new Date(holiday.date));
  };

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

  }, [year,month]); //monthが変更されるたびに実行する

  //各メンバーの出勤、退勤時間を取得
  useEffect(() => {
    const fetchAllAttendanceData = async () => {
      try {
        const promises = filteredItems.map(item => todayAttendanceData(item.id, date));
        const results = await Promise.all(promises);
        const newAttendanceData = results.reduce((acc, data, index) => {
          acc[filteredItems[index].id] = data || [];
          return acc;
        }, {});
        setAttendanceData(newAttendanceData);
      } catch (error) {
        console.error('Error fetching attendance data:', error);
      }
    };

    if (filteredItems.length > 0) {
      fetchAllAttendanceData();
    }
  }, [filteredItems, date]);

  useEffect(() => {
    const fetchAllCostData = async () => {
      try {
        const promises = filteredItems.map(item => fetchCostData(item.id, year, month));
        const results = await Promise.all(promises);
        const newCostState = results.reduce((acc, data, index) => {
          const { registration_date, app_flag } = data;
          let status = '未申請';
          if (app_flag) {
            status = '承認待ち';
          } else if (!app_flag && registration_date) {
            status = '承認済み';
          }
          acc[filteredItems[index].id] = status;
          return acc;
        }, {});
        setCostState(newCostState);
      } catch (error) {
        console.error('Error fetching cost data:', error);
      }
    };

    if (filteredItems.length > 0) {
      fetchAllCostData();
    }
  }, [filteredItems, month, year]);

  useEffect(() => {
    const fetchAllTotalHours = async () => {
      try {
        const promises = filteredItems.map(item => fetchTotalHours(item.id, year, month, lastMonday, lastSunday));
        const results = await Promise.all(promises);
        results.forEach((data, index) => {
          const accounts_id = filteredItems[index].id;
          const monthAverage = data.average_time_per_day;
          const weekAverage = data.week_average_time_per_day;
          if (monthAverage) {
            // 月勤務時間の分数
            const multipliedWorkHoursInMinutes = monthAverage * holidaysAndWeekendsCount;
            const multipliedWorkHoursInMinutes2 = weekAverage * holidaysAndWeekendsCount;

            // 月の残業判定
            setIsOvertime(prevState => {
              const newState = { ...prevState, [accounts_id]: multipliedWorkHoursInMinutes > 12000 };
              return JSON.stringify(prevState) !== JSON.stringify(newState) ? newState : prevState;
            });

            // 週の残業判定
            setIsOvertime2(prevState => {
              const newState = { ...prevState, [accounts_id]: multipliedWorkHoursInMinutes2 > 12000 };
              return JSON.stringify(prevState) !== JSON.stringify(newState) ? newState : prevState;
            });

            // 月予測勤務時間をhh:mm形式に変換
            const multipliedWorkHours = convertMinutesToTime(multipliedWorkHoursInMinutes);

            // 週予測勤務時間をhh:mm形式に変換
            const multipliedWorkHours2 = convertMinutesToTime(multipliedWorkHoursInMinutes2);

            setTotalHours(prevData => {
              const newState = { ...prevData, [accounts_id]: data.total_hours };
              return JSON.stringify(prevData) !== JSON.stringify(newState) ? newState : prevData;
            });
            setMonthAverage(prevData => {
              const newState = { ...prevData, [accounts_id]: multipliedWorkHours };
              return JSON.stringify(prevData) !== JSON.stringify(newState) ? newState : prevData;
            });
            setWeekMonthAverage(prevData => {
              const newState = { ...prevData, [accounts_id]: multipliedWorkHours2 };
              return JSON.stringify(prevData) !== JSON.stringify(newState) ? newState : prevData;
            });
          } else {
            setTotalHours(prevData => {
              const newState = { ...prevData, [accounts_id]: data.total_hours };
              return JSON.stringify(prevData) !== JSON.stringify(newState) ? newState : prevData;
            });
            setMonthAverage(prevData => {
              const newState = { ...prevData, [accounts_id]: '' };
              return JSON.stringify(prevData) !== JSON.stringify(newState) ? newState : prevData;
            });
            setWeekMonthAverage(prevData => {
              const newState = { ...prevData, [accounts_id]: '' };
              return JSON.stringify(prevData) !== JSON.stringify(newState) ? newState : prevData;
            });
          }
        });
      } catch (error) {
        console.error('Error fetching total hours:', error);
      }
    };

    if (filteredItems.length > 0) {
      fetchAllTotalHours();
    }
  }, [filteredItems, holidaysAndWeekendsCount, lastMonday, lastSunday, month, year]);

  //アカウントを削除
  const deleteItems = () => {
    if (selectedItems.length === 0) {
      alert('アカウントが選択されていません');
      return;
    }
    let confirmDelete = window.confirm('チェックしたメンバーを削除しますか？');
    if (confirmDelete) {
      selectedItems.forEach(async (itemId) => {
        try {
          await deleteItem(itemId);
          setItems(prevItems => prevItems.filter(item => item.id !== itemId));
          setFilteredItems(prevItems => prevItems.filter(item => item.id !== itemId));
        } catch (err) {
          console.error('Error deleting item:', err);
        }
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
          <tbody>{filteredItems.map((item, index) => (
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
                  ? attendanceData[item.id].map(att => attendanceFormatTime(att.check_in_time)).join(', ')
                  : ''}
              </td>
              <td>
                {attendanceData[item.id] && Array.isArray(attendanceData[item.id]) && attendanceData[item.id].some(att => att.check_out_time)
                  ? attendanceData[item.id].map(att => attendanceFormatTime(att.check_out_time)).join(', ')
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