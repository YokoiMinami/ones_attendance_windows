import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import HolidayModal from './HolidayModal';

const HolidayPage = () => {
  const id = localStorage.getItem('user');
  const [userData, setUserData] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  
  // ユーザー情報を取得
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

  //ユーザーの代休情報を取得
  useEffect(() => {
    const fetchHoliday = async () => {
      const accounts_id = localStorage.getItem('user');
      try {
        const response = await fetch(`http://localhost:3000/holiday/${accounts_id}`);
        const data = await response.json();
        setItems(data);
      } catch (error) {
        console.error('Error fetching holiday data:', error);
      }
    };
    fetchHoliday();
  }, [id]);

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
        fetch('http://localhost:3000/holiday_delete', {
          method: 'delete',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ id: itemId })
        })
        .then(response => response.json())
        .then(() => {
          setItems(prevItems => prevItems.filter(item => item.id !== itemId));
        })
        .catch(err => console.log(err));
      });
      // チェックボックスのリセット
      setSelectedItems([]);
    }
  };

  const formatDate = (dateString) => { 
    const date = new Date(dateString); 
    const year = date.getFullYear(); 
    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const day = String(date.getDate()).padStart(2, '0'); 
    return `${year}/${month}/${day}`; 
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
