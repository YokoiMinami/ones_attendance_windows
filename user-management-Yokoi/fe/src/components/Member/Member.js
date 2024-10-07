import React, { Component, useState, useEffect } from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import OnesLogo from '../../images/ones-logo.png';
import { Container, Row, Col } from 'reactstrap';
import { CSVLink } from "react-csv";

import MemberModal from './MemberModal';
import MemberTable from './MemberTable';
//import 'bootstrap/dist/css/bootstrap.min.css';

const Member = ( ) => {

  //ユーザー情報
  const id = localStorage.getItem('user');
  const [userData, setUserData] = useState(null);
  const [authorityData, setAuthorityData] = useState(false);
  const [items, setItems] = useState([]);

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
      .then(items => setItems(items))
      .catch(err => console.log(err));
  };
  
  const addItemToState = (item) => {
    window.location.reload();
    setItems(prevItems => [...prevItems, item]);
  };
  
  const updateState = (item) => {
    const itemIndex = items.findIndex(data => data.id === item.id);
    const newArray = [
      ...items.slice(0, itemIndex),
      item,
      ...items.slice(itemIndex + 1)
    ];
    setItems(newArray);
  };
  
  const deleteItemFromState = (id) => {
    const updatedItems = items.filter(item => item.id !== id);
    setItems(updatedItems);
  };
  
  useEffect(() => {
    getItems();
  }, []);

  return(
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
            <input type='text' id='member_input'></input>
          </div>
          <div id='member_button_area'>
            <button id='member_search_button'>検索</button>
            <button id='member_delete_button'>削除</button>
          </div>
        </div>
      </div>
      <div id='member_table_area'>
        <table id='member_table'>
          <thead>
            <tr>
              <th id = 'check_cl' ></th>
              <th id = 'no_cl'>No.</th>
              <th id = 'name_cl'>氏名</th>
              <th id = 'kana_cl'>シメイ</th>
              <th id = 'in_cl'>出勤</th>
              <th id = 'out_cl'>退勤</th>
              <th id = 'over_cl'>総残業時間</th>
              <th id = 'revision_cl'>勤怠修正</th>
              <th id = 'row_cl'>並び順▼</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id}>
                <td><input type="checkbox" /></td>
                <td>{index + 1}</td>
                <td>{item.fullname}</td>
                <td>{item.kananame}</td>
                <td>09:00</td>
                <td>18:00</td>
                <td>45:00</td>
                <td>修正</td>
                <td>
                  {/* <button onClick={() => updateState(item)}>編集</button>
                  <button onClick={() => deleteItemFromState(item.id)}>削除</button> */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <MemberTable items={items} updateState={updateState} deleteItemFromState={deleteItemFromState} />
        {/* <Container className="container">
            <Row className="row">
              <Col md={2} className="col" id='add_button_area'>
                <MemberModal buttonLabel="新規登録" addItemToState={addItemToState} />
                {items.length > 0 &&
                  <CSVLink
                    className="custom-csv-link" 
                    filename={"accounts.csv"}
                    data={items}>
                    CSVエクスポート
                  </CSVLink>
                }
              </Col>
              <Col md={10} className="col">
              // <MemberTable items={items} updateState={updateState} deleteItemFromState={deleteItemFromState} />
              </Col>
            </Row>
            <Row className="row" id='accounto_link_area'>
              <Col className="col">
                <Link to="/top" id='account_top_link'>← 勤怠一覧ページ</Link>
              </Col>
            </Row>
          </Container> */}
        </div>
      <img src={OnesLogo} alt="Ones" />
    </div>
  )
}

export default Member;



