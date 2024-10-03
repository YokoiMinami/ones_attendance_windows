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
        <div className="new_container">
          <div className="new_row">
              <div className="label">ID:</div>
              <div className="value">{userData.id}</div>
          </div>
          <div className="new_row">
              <div className="label">氏名:</div>
              <div className="value">{userData.fullname}</div>
          </div>
          <div className="new_row">
              <div className="label">Email:</div>
              <div className="value">{userData.email}</div>
          </div>
            <Button onClick={handleClick1} className='after_button'>ログインページ</Button>
      </div>
    </div>
    
  );
};

export default NewAccountAfter;
