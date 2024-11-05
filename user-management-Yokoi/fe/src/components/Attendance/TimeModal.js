import React, { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody } from 'reactstrap';
import TimeForm from './TimeForm';

const TimeModal = (props) => {
  const [modal, setModal] = useState(false);

  const toggle = () => {
    setModal(!modal);
  };

  const closeBtn = <button className="close" onClick={toggle}>×</button>;
  const label = props.buttonLabel;
  let button = '';
  let title = '';

  if (label === '編集') {
    button = <button id='account_edit_button' className='all_button' onClick={toggle}>{label}</button>;
    title = '編集';
  } else {
    button = <Button id='pj_button' className='all_button' onClick={toggle}>{label}</Button>;
    title = '標準勤務時間登録';
  }

  return (
    <div>
      {button}
      <Modal isOpen={modal} toggle={toggle} className={props.className}>
        <ModalHeader toggle={toggle} close={closeBtn}>{title}</ModalHeader>
        <ModalBody>
          <TimeForm
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

export default TimeModal;