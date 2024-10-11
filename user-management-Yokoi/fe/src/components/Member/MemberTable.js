import React from 'react';
import { Button } from 'reactstrap';
import { Link } from 'react-router-dom';
import MemberModal from './MemberModal';
import OnesLogo from '../../images/ones-logo.png';

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
    <div id='member_data_page'>
    <table id='member_data_table'>
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
    </table>
    <div id='account_button_area'>
      <MemberModal buttonLabel="編集" item={item} updateState={props.updateState} />
      {' '}
      <Button id='account_delete_button' onClick={() => deleteItem(item.id)}>削除</Button>
    </div>
    <div id='member_data_page_logo'>
      <img src={OnesLogo} alt="Ones" />
    </div>
    <div id='member_data_link_area'>
        <Link to="/" id='member_data_link'>← 勤怠一覧ページ</Link>
    </div>
  </div>







    // <table id='account_table'>
    //   <thead id='account_thead'>
    //     <tr>
    //       <th className='ac_1'>ID</th>
    //       <th className='ac_2'>氏名</th>
    //       <th className='ac_3'>Email</th>
    //       <th className='ac_4'>電話番号</th>
    //       <th className='ac_5'>パスワード</th>
    //       <th className='ac_6'></th>
    //     </tr>
    //   </thead>
    //   <tbody>
    //     <tr key={item.id}>
    //       <td>{item.id}</td>
    //       <td>{item.fullname}</td>
    //       <td>{item.email}</td>
    //       <td></td>
    //       <td>****</td>
    //       <td className='ac_6'>
    //         <div id='account_button_area'>
    //           <MemberModal buttonLabel="編集" item={item} updateState={props.updateState} />
    //           {' '}
    //           <Button id='account_delete_button' onClick={() => deleteItem(item.id)}>削除</Button>
    //         </div>
    //       </td>
    //     </tr>
    //   </tbody>
    // </table>
  );
}

export default MemberTable;
