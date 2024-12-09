import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MemberModal from './MemberModal';

const MemberTable = (props) => {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  const deleteItem = id => {
    let confirmDelete = window.confirm('メンバーを削除しますか？');
    if (confirmDelete) {
      fetch('http://localhost:3000/delete', {
        method: 'delete',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id })
      })
      .then(response => response.json())
      .then(item => {
        props.deleteItemFromState(id);
        navigate('/member');
      })
      .catch(err => console.log(err));
    }
  }

  // props.items が null または undefined でないことを確認
  if (!props.items) {
    return <div>データがありません</div>;
  }

  const item = props.items;

  const addItemToState = (item) => {
    setItems(prevItems => [...prevItems, item]);
  };

  return (
    <div id='member_data_page_table'>
      <div id='member_data_button_area'>
        <MemberModal buttonLabel="編集" addItemToState={addItemToState} />
        {/* <MemberModal buttonLabel="編集" item={item} updateState={props.updateState} /> */}
        <button id='member_data_delete_button' className='all_button' onClick={() => deleteItem(item.id)}>削除</button>
      </div>
      <div id='member_data_table_box'>
        <table id='member_data_table'>
          <tbody>
            <tr>
              <th className='member_data_th'>会社名</th>
              <td>{item.company}</td>
            </tr>
            <tr>
              <th className='member_data_th'>氏名</th>
              <td>{item.fullname}</td>
            </tr>
            <tr>
              <th className='member_data_th'>シメイ</th>
              <td>{item.kananame}</td>
            </tr>
            <tr>
              <th className='member_data_th'>Email</th>
              <td>{item.email}</td>
            </tr>
            <tr>
              <th className='member_data_th'>所属チーム</th>
              <td>{item.team}</td>
            </tr>
            <tr>
              <th className='member_data_th'>パスワード</th>
              <td>****</td>
            </tr>
            <tr>
              <th className='member_data_th'>利用権限</th>
              <td>{props.authorityData ? 'あり' : 'なし'}</td>
            </tr>
          </tbody>
        </table>
      </div>
  </div>
  );
}

export default MemberTable;
