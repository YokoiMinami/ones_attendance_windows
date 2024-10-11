import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MemberModal from './MemberModal';
import MemberTable from './MemberTable';

const MemberData = () => {
  const [userData, setUserData] = useState(null);
  const [authorityData, setAuthorityData] = useState(false);
  const [items, setItems] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);

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
      <h1 id='member_data_h1'>メンバー詳細</h1>
      <MemberTable items={items} updateState={updateState} deleteItemFromState={deleteItemFromState} authorityData={authorityData} />
      {/* ここにユーザーの詳細情報を表示するロジックを追加できます */}
    </div>
  );
};

export default MemberData;
