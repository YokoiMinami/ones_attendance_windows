import React from 'react';
import { Button, Form, FormGroup, Label, Input } from 'reactstrap';

class AddEditForm extends React.Component {
  state = {
    id: 0,
    fullname: '',
    email: '',
    phone: '',
    password: ''
  }

  onChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  }

  submitFormAdd = e => {
    e.preventDefault();
    fetch('http://localhost:3000/post', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fullname: this.state.fullname,
        email: this.state.email,
        phone: this.state.phone,
        password: this.state.password
      })
    })
      .then(response => response.json())
      .then(item => {
        if (Array.isArray(item)) {
          this.props.addItemToState(item[0]);
          this.props.toggle();
        } else {
          console.log('failure');
        }
      })
      .catch(err => console.log(err));
  }

  submitFormEdit = e => {
    e.preventDefault();
    fetch('http://localhost:3000/put', {
      method: 'put',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: this.state.id,
        fullname: this.state.fullname,
        email: this.state.email,
        phone: this.state.phone,
        password: this.state.password
      })
    })
      .then(response => response.json())
      .then(item => {
        if (Array.isArray(item)) {
          this.props.updateState(item[0]);
          this.props.toggle();
        } else {
          console.log('failure');
        }
      })
      .catch(err => console.log(err));
  }

  componentDidMount() {
    if (this.props.item) {
      const { id, fullname, email, phone, password } = this.props.item;
      this.setState({ id, fullname, email, phone, password });
    };
  }

  render() {
    return (
      <Form onSubmit={this.props.item ? this.submitFormEdit : this.submitFormAdd}>
        <FormGroup>
          <Label for="fullname">氏名</Label>
          <Input type="text" name="fullname" id="fullname" onChange={this.onChange} value={this.state.fullname === null ? '' : this.state.fullname} />
        </FormGroup>
        <FormGroup>
          <Label for="email">Email</Label>
          <Input type="email" name="email" id="email" onChange={this.onChange} value={this.state.email === null ? '' : this.state.email} />
        </FormGroup>
        <FormGroup>
          <Label for="phone">電話番号</Label>
          <Input type="text" name="phone" id="phone" onChange={this.onChange} value={this.state.phone === null ? '' : this.state.phone} />
        </FormGroup>
        <FormGroup>
          <Label for="password">パスワード</Label>
          <Input type="text" name="password" id="password" onChange={this.onChange} value={this.state.password === null ? '' : this.state.password} />
        </FormGroup>
        <Button>確定</Button>
      </Form>
    );
  }
}

export default AddEditForm;