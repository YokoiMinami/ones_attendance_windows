import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PassModal from './PassModal';
import OnesLogo from '../../images/ones-logo.png';
import { fetchUserData, fetchPassword } from '../../apiCall/apis';

const PassPage = () => {
  const accounts_id = localStorage.getItem('user');
  const [userData, setUserData] = useState(null);
  const [items, setItems] = useState([]);

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

  // 現在の管理者パスワードを取得
  useEffect(() => {
    const fetchPass = async () => {
      try {
        const data = await fetchPassword();
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
      <div id='h_flex'>
        <div id='a_box1'>
          <div id='admin_user_area'>
            {userData && <p id='atUser'>{userData.fullname} さん</p>}
          </div>
          <div id='member_new_button'>
            <PassModal buttonLabel="変更" addItemToState={addItemToState} />
          </div>
        </div>
        <div id ='a_box2'>
          <h1 id='a_h1'>管理者パスワード変更</h1>
          <table id ='admin_table'>
            <thead id ='expenses_Th'>
              <tr>
                <th id='pass_cl1'>現在のパスワード</th>
                <th id='pass_cl2'>最終更新者</th>
                <th id='pass_cl3'>最終更新日</th>
              </tr>
            </thead>
            <tbody id='admin_tbody'>{ items && items.length > 0 ? (
              items.map((pass, index) => (
                <tr key={index}>
                  <td>{pass.admin_password}</td>
                  <td>{pass.fullname}</td>
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
          <div id='admin_page_logo'>
            <img src={OnesLogo} alt="Ones" />
          </div>
        </div>
      </div>
      <div id='member_botom'>
        <div id='member_link_area'>
          <Link to="/" id='member_link'>← トップページ</Link>
        </div>
      </div>
    </div>
  );
};

export default PassPage;
