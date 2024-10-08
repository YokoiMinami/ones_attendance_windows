import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OnesLogo from '../../images/ones-logo.png';
import MemberModal from './MemberModal';
import MemberTable from './MemberTable';

const Member = () => {
  const id = localStorage.getItem('user');
  const [userData, setUserData] = useState(null);
  const [authorityData, setAuthorityData] = useState(false);
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  
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

  const navigate = useNavigate();

  const handleClick1 = () => {
    navigate('/new_account');
  };

  const getItems = () => {
    fetch('http://localhost:3000/get')
      .then(response => response.json())
      .then(items => {
        setItems(items);
        setFilteredItems(items);
      })
      .catch(err => console.log(err));
  };

  const accounts_id = localStorage.getItem('user');
  const now = new Date();
  const year = now.getFullYear(); // 年を取得
  const month = now.getMonth() + 1; // 月を取得（0が1月なので+1します）
  //const date = now.getDate(); // 日付を取得
  const date = now.toISOString().split('T')[0];

  //出勤時間と退勤時間をフォーマット
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  useEffect(() => {
    const fetchAttendanceData = async (accounts_id) => {
      try {
        const response = await fetch(`http://localhost:3000/attendance/attendance/${accounts_id}/${date}`);
        const data = await response.json();
        setAttendanceData(prevData => ({
          ...prevData,
          [accounts_id]: data || [] // 空文字列の場合は空の配列を設定
        }));
      } catch (error) {
        console.error('Error fetching attendance data:', error);
      }
    };
  
    filteredItems.forEach(item => {
      fetchAttendanceData(item.id);
    });
  }, [filteredItems, date]);
  

  const deleteItems = () => {
    if (selectedItems.length === 0) {
      alert('アカウントが選択されていません');
      return;
    }
    let confirmDelete = window.confirm('削除しますか？');
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

  const updateState = (item) => {
    const itemIndex = items.findIndex(data => data.id === item.id);
    const newArray = [
      ...items.slice(0, itemIndex),
      item,
      ...items.slice(itemIndex + 1)
    ];
    setItems(newArray);
    setFilteredItems(newArray);
  };

  const deleteItemFromState = (id) => {
    const updatedItems = items.filter(item => item.id !== id);
    setItems(updatedItems);
    setFilteredItems(updatedItems);
  };

  useEffect(() => {
    getItems();
  }, []);
  
  return (
    <div id='member_page'>
      <div id='member_top'>
        <div id='member_user_name_area'>
          <p id='member_user_name'>{userData ? userData.fullname : ''}</p>
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
              <th>id</th>
              <th id='name_cl'>氏名</th>
              <th id='kana_cl'>シメイ</th>
              <th id='in_cl'>出勤</th>
              <th id='out_cl'>退勤</th>
              <th id='over_cl'>総残業時間</th>
              <th id='over_cl2'>予想残業時間</th>
              <th id='revision_cl'>勤怠修正</th>
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
                <td>{item.id}</td>
                <td>{item.fullname}</td>
                <td>{item.kananame}</td>
                <td>
                  {attendanceData[item.id] && Array.isArray(attendanceData[item.id])
                    ? attendanceData[item.id].map(att => formatTime(att.check_in_time)).join(', ')
                    : 'N/A'}
                </td>
                <td>
                  {attendanceData[item.id] && Array.isArray(attendanceData[item.id])
                    ? attendanceData[item.id].map(att => formatTime(att.check_out_time)).join(', ')
                    : 'N/A'}
                </td>
                <td>45:00</td>
                <td>80:00</td>
                <td>修正</td>
              </tr>
            ))}
          </tbody>
        </table>
        <MemberTable items={filteredItems} updateState={updateState} deleteItemFromState={deleteItemFromState} />
      </div>
      <img src={OnesLogo} alt="Ones" />
    </div>
  );
};

export default Member;
