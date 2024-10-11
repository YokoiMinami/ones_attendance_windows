import React from 'react';
import { Button } from 'reactstrap';
import MemberModal from './MemberModal';

const MemberTable = (props) => {
  const deleteItem = id => {
    let confirmDelete = window.confirm('削除しますか？');
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
        })
        .catch(err => console.log(err));
    }
  }

  // props.items が null または undefined でないことを確認
  if (!props.items) {
    return <div>データがありません</div>;
  }

  const item = props.items;

  return (
    <table id='account_table'>
      <thead id='account_thead'>
        <tr>
          <th className='ac_1'>ID</th>
          <th className='ac_2'>氏名</th>
          <th className='ac_3'>Email</th>
          <th className='ac_4'>電話番号</th>
          <th className='ac_5'>パスワード</th>
          <th className='ac_6'></th>
        </tr>
      </thead>
      <tbody>
        <tr key={item.id}>
          <td>{item.id}</td>
          <td>{item.fullname}</td>
          <td>{item.email}</td>
          <td></td>
          <td>****</td>
          <td className='ac_6'>
            <div id='account_button_area'>
              <MemberModal buttonLabel="編集" item={item} updateState={props.updateState} />
              {' '}
              <Button id='account_delete_button' onClick={() => deleteItem(item.id)}>削除</Button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export default MemberTable;
