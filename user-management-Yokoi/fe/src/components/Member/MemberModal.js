import React, { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody } from 'reactstrap';
import MemberForm from './MemberForm';

const MemberModal = (props) => {
  const [modal, setModal] = useState(false);

  const toggle = () => {
    setModal(!modal);
  };

  const closeBtn = <button className="close" onClick={toggle}>×</button>;
  const label = props.buttonLabel;
  let button = '';
  let title = '';

  if (label === '編集') {
    button = <Button id='account_edit_button' onClick={toggle}>{label}</Button>;
    title = '編集';
  } else {
    button = <Button id='account_add_button' onClick={toggle}>{label}</Button>;
    title = '新規登録';
  }

  return (
    <div>
      {button}
      <Modal isOpen={modal} toggle={toggle} className={props.className}>
        <ModalHeader toggle={toggle} close={closeBtn}>{title}</ModalHeader>
        <ModalBody>
          <MemberForm
            addItemToState={props.addItemToState}
            updateState={props.updateState}
            toggle={toggle}
            item={props.item}
          />
        </ModalBody>
      </Modal>
    </div>
  );
};

export default MemberModal;
