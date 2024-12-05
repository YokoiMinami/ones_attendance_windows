import React, { useState } from 'react';
import Select from 'react-select';
import { timeOptions } from '../../constants/selectForm';
import { breakStyles } from '../../constants/style';

const Time = ({ value, onChange }) => {
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
        value={timeOptions.find(option => option.value === value)}
        onChange={selectedOption => {
          onChange(selectedOption.value);
          setMenuIsOpen(false); // 選択後にメニューを閉じる
        }}
        options={timeOptions}
        classNamePrefix="custom-select"
        placeholder=""
        menuIsOpen={menuIsOpen}
        styles={breakStyles}
        menuPortalTarget={document.body} // 必要に応じてターゲットを指定
      />
    </div>
  );
};

export default Time;
