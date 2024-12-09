import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import MemberForm from './MemberForm';

const MemberModal = (props) => {
  const [modal, setModal] = useState(false);

  const toggle = () => {
    setModal(!modal);
  };

  const closeBtn = <button className="close" onClick={toggle}>×</button>;

  return (
    <div id='member_data_button_area_modal'>
      <button id='account_edit_button' className='all_button' onClick={toggle}>{props.buttonLabel}</button>
      <Modal isOpen={modal} toggle={toggle} className={props.className}>
      <ModalHeader toggle={toggle} close={closeBtn}>変更</ModalHeader>
      <ModalBody>
        <MemberForm
          addItemToState={props.addItemToState}
          updateState={props.updateState}
          toggle={toggle}
        />
      </ModalBody>
    </Modal>
  </div>
  );
};

export default MemberModal;
