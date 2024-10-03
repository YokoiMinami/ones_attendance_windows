import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import OnesLogo from '../../images/ones-logo.png';
import AccountLogo from '../../images/account-logo.png';
import { Button } from 'reactstrap';
import { BrowserRouter as Router, useNavigate } from 'react-router-dom';


const NewAccountAfter = () => {
  const navigate = useNavigate();

  const handleClick1 = () => {
    navigate('/login');
  };


  const { id } = useParams();
  const [userData, setUserData] = useState(null);

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

  if (!userData) {
    return <div>Loading...</div>;
  }

  
  return (
    <div id='new_account_after'>
      <div id='new_account_ones'>
        <img src={OnesLogo} alt="Ones" style={{ width: '150px', height: '150px', objectFit: 'cover' }} />
      </div>
      <div id='new_account_logo'>
        <img src={AccountLogo} alt="Account" style={{ width: '200px', height: '200px', objectFit: 'cover' }} />
      </div>
      <p id='account_after_text'> アカウント登録が完了しました！</p>
        <div class="new_container">
          <div class="new_row">
              <div class="label">ID:</div>
              <div class="value">{userData.id}</div>
          </div>
          <div class="new_row">
              <div class="label">氏名:</div>
              <div class="value">{userData.fullname}</div>
          </div>
          <div class="new_row">
              <div class="label">Email:</div>
              <div class="value">{userData.email}</div>
          </div>
          <div class="new_row">
              <div class="label">電話番号:</div>
              <div class="value">{userData.phone}</div>
          </div>
            <Button onClick={handleClick1} className='after_button'>ログインページ</Button>
      </div>
    </div>
    
  );
};

export default NewAccountAfter;
