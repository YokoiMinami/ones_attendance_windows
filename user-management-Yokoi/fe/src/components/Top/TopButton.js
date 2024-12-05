import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import { fetchUserData } from '../../apiCall/apis';

const TopButton = () => {

  const id = localStorage.getItem('user');
  const [authorityData, setAuthorityData] = useState(false);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const data = await fetchUserData(id);
        if (data.authority === true) {
          setAuthorityData(true);
        }
      } catch (err) {
        console.log(err);
      }
    };
    getUserData();
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