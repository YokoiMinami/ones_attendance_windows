import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import HolidayModal from './HolidayModal';
import { fetchUserData, fetchHolidayData, deleteHoliday } from '../../apiCall/apis';
import { formatDate } from '../../common/format';

const HolidayPage = () => {
  const accounts_id = localStorage.getItem('user');
  const [userData, setUserData] = useState(null);
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

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

  //ユーザーの代休情報を取得
  useEffect(() => {
    const fetchHoliday = async () => {
      try {
        const data = await fetchHolidayData(accounts_id);
        setItems(data);
      } catch (error) {
        console.error('Error fetching holiday data:', error);
      }
    };
    fetchHoliday();
  }, [accounts_id]);

  const handleCheckboxChange = (event, itemId) => {
    if (event.target.checked) {
      setSelectedItems(prevSelected => [...prevSelected, itemId]);
    } else {
      setSelectedItems(prevSelected => prevSelected.filter(id => id !== itemId));
    }
  };

  const addItemToState = (item) => {
    window.location.reload();
    setItems(prevItems => [...prevItems, item]);
  };

  const deleteItems = () => {
    if (selectedItems.length === 0) {
      alert('代休が選択されていません');
      return;
    }
    let confirmDelete = window.confirm('チェックした代休を削除しますか？');
    if (confirmDelete) {
      selectedItems.forEach(itemId => {
        deleteHoliday(itemId)
          .then(() => {
            setItems(prevItems => prevItems.filter(item => item.id !== itemId));
          })
          .catch(err => console.log(err));
      });
      // チェックボックスのリセット
      setSelectedItems([]);
    }
  };

  return (
    <div id='expenses_page'>
      <div id='expenses_user_area'>
        {userData && <p id='atUser'>{userData.fullname} さん</p>}
      </div>
      <h1>代休未消化記録表</h1>
      <div id='expenses_H2_area'>
        <h2 id='atH2'>{year}年 {month}月</h2>
      </div>
      <div id='h_flex'>
        <div id='h_box1'>
          <div id='member_new_button'>
            <HolidayModal buttonLabel="登録" addItemToState={addItemToState} />
            <button id='holiday_delete_button' onClick={deleteItems}>削除</button>
          </div>
        </div>
        <div id ='h_box2'>
          <table id ='h_table'>
            <thead id ='expenses_Th'>
              <tr>
                <th id='holiday_th1'></th>
                <th id='holiday_th2'>代休未消化記録表</th>
                <th id='holiday_th3'></th>
              </tr>
            </thead>
            <tbody id='h_tbody'>{ items && items.length > 0 ? (
              items.map((holiday, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(holiday.id)}
                      onChange={(event) => handleCheckboxChange(event, holiday.id)}
                    />
                  </td>
                  <td>{formatDate(holiday.date)}</td>
                  <td style={{ textAlign: 'left'}}>{holiday.week}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td></td>
                <td>代休情報がありません</td>
                <td></td>
              </tr>
            )}
            </tbody>
          </table>
        </div>
      </div>
      <div id='expenses_link_area'>
        <Link to="/attendance_table" id='expenses_link'>← 勤怠一覧ページ</Link>
      </div>
    </div>
  );
};

export default HolidayPage;
