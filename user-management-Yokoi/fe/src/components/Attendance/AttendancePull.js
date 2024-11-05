import React, { useState } from 'react';
import Select from 'react-select';

const options = [
  { value: '', label: '' },
  { value: '慶弔休暇', label: '慶弔休暇' },
  { value: '有休休暇', label: '有休休暇' },
  { value: '代休', label: '代休' },
  { value: '休日出勤', label: '休日出勤' },
  { value: '欠勤', label: '欠勤' },
  { value: '遅刻', label: '遅刻' },
  { value: '早退', label: '早退' },
];

const customStyles = {
  control: (provided) => ({
    ...provided,
    height: '40px', // 必要に応じて高さを調整
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 9999, // 必要に応じて調整
    width: '150px', // 必要に応じて横幅を調整
    // maxHeight: '200px',
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999, // 必要に応じて調整
  }),
};

const Dropdown = ({ value, onChange }) => {
  const [menuIsOpen, setMenuIsOpen] = useState(false);

  return (
    <div
      onMouseEnter={() => setMenuIsOpen(true)}
      onMouseLeave={() => setMenuIsOpen(false)}
    >
    <Select
      value={options.find(option => option.value === value)}
      onChange={selectedOption => {
        onChange(selectedOption.value);
        setMenuIsOpen(false); // 選択後にメニューを閉じる
      }}
      options={options}
      classNamePrefix="custom-select"
      placeholder=""
      menuIsOpen={menuIsOpen}
      styles={customStyles}
      menuPortalTarget={document.body} // 必要に応じてターゲットを指定
    />
  </div>
  );
};

export default Dropdown;
