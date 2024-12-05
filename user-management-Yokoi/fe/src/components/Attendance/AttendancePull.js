import React, { useState } from 'react';
import Select from 'react-select';
import { remarksOptions } from '../../constants/selectForm';
import { remarksStyles } from '../../constants/style';

const Dropdown = ({ value, onChange }) => {
  const [menuIsOpen, setMenuIsOpen] = useState(false);

  return (
    <div
      onMouseEnter={() => setMenuIsOpen(true)}
      onMouseLeave={() => setMenuIsOpen(false)}
    >
    <Select
      value={remarksOptions.find(option => option.value === value)}
      onChange={selectedOption => {
        onChange(selectedOption.value);
        setMenuIsOpen(false); // 選択後にメニューを閉じる
      }}
      options={remarksOptions}
      classNamePrefix="custom-select"
      placeholder=""
      menuIsOpen={menuIsOpen}
      styles={remarksStyles}
      menuPortalTarget={document.body} // 必要に応じてターゲットを指定
    />
  </div>
  );
};

export default Dropdown;
