import React, { Component } from 'react';
import { Button } from 'reactstrap';
import AddEditModal from '../Modals/AddEditModal';

class AccountsTable extends Component {

  deleteItem = id => {
    let confirmDelete = window.confirm('削除しますか？');
    if (confirmDelete) {
      fetch('http://localhost:3000/delete', {
        method: 'delete',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id
        })
      })
        .then(response => response.json())
        .then(item => {
          this.props.deleteItemFromState(id)
        })
        .catch(err => console.log(err));
    }

  }

  render() {
    let items = this.props.items.map(item => (
      <tr key={item.id}>
        <td>{item.id}</td>
        <td>{item.fullname}</td>
        <td>{item.email}</td>
        <td>{item.phone}</td>
        <td>****</td>
        <td className='ac_6'>
          <div id='account_button_area'>
            <AddEditModal buttonLabel="編集" item={item} updateState={this.props.updateState} />
            {' '}
            <Button id='account_delete_button' onClick={() => this.deleteItem(item.id)}>削除</Button>
          </div>
        </td>
      </tr>
    ));
    
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
        <tbody>{items}</tbody>
      </table>
    );
    
  }
}

export default AccountsTable;