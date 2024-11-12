import React, { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody } from 'reactstrap';
import CostForm from './CostForm';

const CostModal = ({ buttonLabel = '登録', className, addItemToState, updateState, item }) => {
  const [modal, setModal] = useState(false);

  const toggle = () => {
    setModal(!modal);
  };

  const closeBtn = <button className="close" onClick={toggle}>×</button>;
  const label = buttonLabel;
  let button = '';
  let title = '';

  if (label === '編集') {
    button = <button id='account_edit_button' className='all_button' onClick={toggle}>{label}</button>;
    title = '編集';
  } else {
    button = <Button id='account_add_button' onClick={toggle}>{label}</Button>;
    title = '経費登録';
  }

  return (
    <div id='member_data_button_area_modal'>
      {button}
      <Modal isOpen={modal} toggle={toggle} className={className}>
        <ModalHeader toggle={toggle} close={closeBtn}>{title}</ModalHeader>
        <ModalBody>
          <CostForm
            addItemToState={addItemToState}
            updateState={updateState}
            toggle={toggle}
            item={item}
          />
        </ModalBody>
      </Modal>
    </div>
  );
};

export default CostModal;


