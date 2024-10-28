import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';

const TopButton = () => {
  //ユーザー情報
  const id = localStorage.getItem('user');
  const [userData, setUserData] = useState(null);

  const [authorityData, setAuthorityData] = useState(false);

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

  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const handleClick1 = () => {
    navigate('/');
  };

  const handleClick2 = () => {
    navigate('/attendance_table');
  };

  const handleClick3 = () => {
    navigate('/member');
  };

  const handleClick4 = () => {
    navigate('/pass');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
    <button className='all_button' onClick={handleClick1}>勤怠登録</button>
    <button className='all_button' onClick={handleClick2}>勤怠一覧</button>
    {authorityData && (
      <button className='all_button' onClick={handleClick3}>メンバー管理</button>
    )}
    {authorityData && (
      <button className='all_button' onClick={handleClick4}>管理PW変更</button>
    )}
    <button className='all_button' onClick={handleLogout}>ログアウト</button>
  </div>
  );
};

export default TopButton;