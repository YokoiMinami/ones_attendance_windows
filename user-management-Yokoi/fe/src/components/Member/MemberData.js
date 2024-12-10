import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import MemberTable from './MemberTable';
import OnesLogo from '../../images/ones-logo.png';
import { fetchUserData } from '../../apiCall/apis';

const MemberData = () => {
  const [authorityData, setAuthorityData] = useState(false);
  const [items, setItems] = useState({});
  const { id } = useParams();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await fetchUserData(id);
        if (data) {
          setItems(data);
          if (data.authority === true) {
            setAuthorityData(true);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchItems();
  }, [id]);

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