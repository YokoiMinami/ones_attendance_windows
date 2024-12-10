import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import MemberModal from './MemberModal';
import MemberTable from './MemberTable';
import MemberForm from './MemberForm';
import OnesLogo from '../../images/ones-logo.png';

const MemberData = () => {
  const [userData, setUserData] = useState(null);
  const [authorityData, setAuthorityData] = useState(false);
  const [items, setItems] = useState({});
  const { id } = useParams();

  const getItems = () => {
    fetch(`http://localhost:3000/user/${id}`)
      .then(response => response.json())
      .then(data => {
        if (data) {
          setItems(data);
          if (data.authority === true) {
            setAuthorityData(true);
          }
        } else {
          console.error('Expected an array but got:', data);
        }
      })
      .catch(err => console.log(err));
  };

  const updateState = (item) => {
    setItems({
      ...items,
      [item.id]: item
    });
  };

  const deleteItemFromState = (id) => {
    const { [id]: _, ...newItems } = items;
    setItems(newItems);
  };

  useEffect(() => {
    getItems();
  }, []);

  return (
    <div id='member_data_page'>
      <h1 id='member_data_h1'>メンバー詳細</h1>
      <div id='member_data_table_area'>
        <MemberTable items={items} updateState={updateState} deleteItemFromState={deleteItemFromState} authorityData={authorityData} />
      </div>
      <div id='member_data_page_logo'>
        <img src={OnesLogo} alt="Ones" />
      </div>
    <div id='member_data_link_area'>
        <Link to="/member" id='member_data_link'>← メンバー管理ページ</Link>
    </div>
    </div>
  );
};

export default MemberData;