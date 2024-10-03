import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';
import { CSVLink } from "react-csv";
import AccountsTable from './Tables/AccountsTable';
import AddEditModal from './Modals/AddEditModal';
import 'bootstrap/dist/css/bootstrap.min.css';

import { BrowserRouter as Router, Link } from 'react-router-dom';

class Account extends Component {
  state = {
    items: []
  }

  getItems() {
    fetch('http://localhost:3000/get')
      .then(response => response.json())
      .then(items => this.setState({ items }))
      .catch(err => console.log(err))
  };

  addItemToState = (item) => {
    window.location.reload();
    this.setState(prevState => ({
      items: [...prevState.items, item]
    }));
  }

  updateState = (item) => {
    const itemIndex = this.state.items.findIndex(data => data.id === item.id);

    const newArray = [
      ...this.state.items.slice(0, itemIndex),
      item,
      ...this.state.items.slice(itemIndex + 1)
    ];
    this.setState({ items: newArray });
  }

  deleteItemFromState = (id) => {
    const updatedItems = this.state.items.filter(item => item.id !== id);
    this.setState({ items: updatedItems });
  }

  componentDidMount() {
    this.getItems();
  }

  render() {
    return (
      <div id='accout_page'>
        <Container className="container">
          <Row className="row">
            <Col className="col">
              <h1 id='account_h1'>メンバー管理</h1>
            </Col>
          </Row>
          <Row className="row">
            <Col md={2} className="col" id='add_button_area'>
              <AddEditModal buttonLabel="メンバー追加" addItemToState={this.addItemToState} />
              {this.state.items.length > 0 &&
                <CSVLink
                  className="custom-csv-link" 
                  filename={"accounts.csv"}
                  data={this.state.items}>
                  CSVエクスポート
                </CSVLink>
              }
            </Col>
            <Col md={10} className="col">
              <AccountsTable items={this.state.items} updateState={this.updateState} deleteItemFromState={this.deleteItemFromState} />
            </Col>
          </Row>
          <Row className="row" id='accounto_link_area'>
            <Col className="col">
              <Link to="/top" id='account_top_link'>← 勤怠一覧ページ</Link>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
  
}

export default Account;