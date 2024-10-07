import React, { Component, useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

//import AccountsTable from './Tables/AccountsTable';
//import AddEditModal from './Modals/AddEditModal';
//import 'bootstrap/dist/css/bootstrap.min.css';

const Member = ( ) => {

  //ユーザー情報
  const id = localStorage.getItem('user');
  const [userData, setUserData] = useState(null);
  const [authorityData, setAuthorityData] = useState(false);

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

  return(
    <div id='member_page'>
      <div id='member_top'>
        <div id='member_user_name_area'>
        <p id='member_user_name'>{userData ? userData.fullname : ''}</p>
        </div>
        <h1 id='member_h1'>メンバー管理</h1>
      </div>
      <div id='member_midle'> 
        <button className='all_button' id='member_new_button' onClick={handleClick1}>新規登録</button>
        <input type='text' id='member_input'></input>
        <button>検索</button>
        <button>削除</button>
      </div>
    </div>
  )
}

export default Member;



//   state = {
//     items: []
//   }

//   getItems() {
//     fetch('http://localhost:3000/get')
//       .then(response => response.json())
//       .then(items => this.setState({ items }))
//       .catch(err => console.log(err))
//   };

//   addItemToState = (item) => {
//     window.location.reload();
//     this.setState(prevState => ({
//       items: [...prevState.items, item]
//     }));
//   }

//   updateState = (item) => {
//     const itemIndex = this.state.items.findIndex(data => data.id === item.id);

//     const newArray = [
//       ...this.state.items.slice(0, itemIndex),
//       item,
//       ...this.state.items.slice(itemIndex + 1)
//     ];
//     this.setState({ items: newArray });
//   }

//   deleteItemFromState = (id) => {
//     const updatedItems = this.state.items.filter(item => item.id !== id);
//     this.setState({ items: updatedItems });
//   }

//   componentDidMount() {
//     this.getItems();
//   }

//   render() {
//     return (
//       <div id='accout_page'>
//         <Container className="container">
//           <Row className="row">
//             <Col className="col">
//               <h1 id='account_h1'>メンバー管理</h1>
//             </Col>
//           </Row>
//           <Row className="row">
//             <Col md={2} className="col" id='add_button_area'>
//               <AddEditModal buttonLabel="メンバー追加" addItemToState={this.addItemToState} />
//               {this.state.items.length > 0 &&
//                 <CSVLink
//                   className="custom-csv-link" 
//                   filename={"accounts.csv"}
//                   data={this.state.items}>
//                   CSVエクスポート
//                 </CSVLink>
//               }
//             </Col>
//             <Col md={10} className="col">
//               <AccountsTable items={this.state.items} updateState={this.updateState} deleteItemFromState={this.deleteItemFromState} />
//             </Col>
//           </Row>
//           <Row className="row" id='accounto_link_area'>
//             <Col className="col">
//               <Link to="/top" id='account_top_link'>← 勤怠一覧ページ</Link>
//             </Col>
//           </Row>
//         </Container>
//       </div>
//     );
//   }
  
// }

// export default Account;