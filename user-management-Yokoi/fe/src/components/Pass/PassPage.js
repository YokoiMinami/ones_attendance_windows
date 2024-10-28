import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PassModal from './PassModal';
import FirstModal from './FirstModal';

const PassPage = () => {
  const id = localStorage.getItem('user');
  const [userData, setUserData] = useState(null);
  const [items, setItems] = useState([]);

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

  // 現在の管理者パスワードを取得
  useEffect(() => {
    const fetchPass = async () => {
      try {
        const response = await fetch('http://localhost:3000/pass');
        const data = await response.json();
        setItems(data);
      } catch (error) {
        console.error('Error fetching password data:', error);
      }
    };
    fetchPass();
  }, []);

  const addItemToState = (item) => {
    setItems(prevItems => [...prevItems, item]);
  };

  return (
    <div id='expenses_page'>
      <div id='expenses_user_area'>
        {userData && <p id='atUser'>ユーザー名: {userData.fullname} さん</p>}
      </div>
      <h1>管理者パスワード変更</h1>
      <div id='h_flex'>
        <div id='h_box1'>
          <div id='member_new_button'>
            { items && items.length > 0 ? (
              <PassModal buttonLabel="変更" addItemToState={addItemToState} />
            ) : (
              <FirstModal buttonLabel="登録" addItemToState={addItemToState} />
            )}
          </div>
        </div>
        <div id ='h_box2'>
          <table id ='h_table'>
            <thead id ='expenses_Th'>
              <tr>
                <th id='pass_cl1'>現在のパスワード</th>
                <th id='pass_cl2'>最終更新者</th>
                <th id='pass_cl3'>最終更新日</th>
              </tr>
            </thead>
            <tbody id='h_tbody'>
              { items && items.length > 0 ? (
                items.map((pass, index) => (
                  <tr key={index}>
                    <td>{pass.admin_password}</td>
                    <td>{pass.accounts_id}</td>
                    <td>{pass.date}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">管理者パスワード情報がありません</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div id='expenses_link_area'>
        <Link to="/" id='expenses_link'>← トップページ</Link>
      </div>
    </div>
  );
};

export default PassPage;
