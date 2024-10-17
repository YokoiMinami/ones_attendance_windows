import React, { useState } from 'react';
import Select from 'react-select';

const options = [
  { value: '', label: '' },
  { value: '09:00', label: '09:00' },
  { value: '09:15', label: '09:15' },
  { value: '09:30', label: '09:30' },
  { value: '09:45', label: '09:45' },
  { value: '10:00', label: '10:00' },
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
  indicatorSeparator: () => ({
    display: 'none', // 矢印のセパレーターを非表示
  }),
  dropdownIndicator: () => ({
    display: 'none', // 矢印自体を非表示
  }),
};

const Time = ({ value, onChange }) => {
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

export default Time;
