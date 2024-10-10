import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MemberModal from './MemberModal';
import MemberTable from './MemberTable';

const MemberData = () => {
  const [userData, setUserData] = useState(null);
  const [authorityData, setAuthorityData] = useState(false);
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  const { id } = useParams();

  const getItems = () => {
    fetch('http://localhost:3000/get')
      .then(response => response.json())
      .then(items => {
        setItems(items);
      })
      .catch(err => console.log(err));
  };

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
        setItems(data);
        if (data.authority === true) {
          setAuthorityData(true);
        }
      })
      .catch(err => console.log(err));
  }, [id]);

  console.log(userData);

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

  return (
    <div id='member_data_page'>
      <h2>User ID: {id}</h2>
      <button id='member_eddit_button' updateState={updateState}>編集</button>
      <MemberTable updateState={updateState} deleteItemFromState={deleteItemFromState} />
      {/* ここにユーザーの詳細情報を表示するロジックを追加できます */}
    </div>
  );
};

export default MemberData;
