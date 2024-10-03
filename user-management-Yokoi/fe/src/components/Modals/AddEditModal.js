import React, { Component } from 'react';
import { Button, Modal, ModalHeader, ModalBody } from 'reactstrap';
import AddEditForm from '../Forms/AddEditForm';

class AddEditModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: false
    }
  }

  toggle = () => {
    this.setState(prevState => ({
      modal: !prevState.modal
    }));
  }

  render() {
    const closeBtn = <button className="close" onClick={this.toggle}>&times;</button>
    const label = this.props.buttonLabel;
    let button = '';
    let title = '';

    if (label === '編集') {
      button = <Button id='account_edit_button'
        onClick={this.toggle}
        >{label}
      </Button>
      title = '編集';
    } else {
      button = <Button id='account_add_button'
        onClick={this.toggle}
        >{label}
      </Button>
      title = '追加';
    }

    return (
      <div>
        {button}
        <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
          <ModalHeader toggle={this.toggle} close={closeBtn}>{title}</ModalHeader>
          <ModalBody>
            <AddEditForm
              addItemToState={this.props.addItemToState}
              updateState={this.props.updateState}
              toggle={this.toggle}
              item={this.props.item} />
          </ModalBody>
        </Modal>
      </div>
    );
  }
}

export default AddEditModal;