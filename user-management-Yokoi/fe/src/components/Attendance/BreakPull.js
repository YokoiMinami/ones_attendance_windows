import React, { useState } from 'react';
import Select from 'react-select';
import { breakOptions } from '../../constants/selectForm';
import { breakStyles } from '../../constants/style';

const BreakPull = ({ value, onChange }) => {
  const [menuIsOpen, setMenuIsOpen] = useState(false);

  const handleMouseEnter = () => {
    setMenuIsOpen(true);
  };

  const handleClick = () => {
    setMenuIsOpen(false);
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
    >
      <Select
        value={breakOptions.find(option => option.value === value)}
        onChange={selectedOption => {
          onChange(selectedOption.value);
          setMenuIsOpen(false); // 選択後にメニューを閉じる
        }}
        options={breakOptions}
        classNamePrefix="custom-select"
        placeholder=""
        menuIsOpen={menuIsOpen}
        styles={breakStyles}
        menuPortalTarget={document.body} // 必要に応じてターゲットを指定
      />
    </div>
  );
};

export default BreakPull;
