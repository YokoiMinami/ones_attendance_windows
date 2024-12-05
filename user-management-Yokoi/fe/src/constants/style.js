export const remarksStyles = {
  control: (provided) => ({
    ...provided,
    height: '40px', // 必要に応じて高さを調整
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 9999, // 必要に応じて調整
    width: '150px', // 必要に応じて横幅を調整
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999, // 必要に応じて調整
  }),
};

export const breakStyles = {
  control: (provided) => ({
    ...provided,
    height: '40px', // 必要に応じて高さを調整
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 9999, // 必要に応じて調整
    width: '150px', // 必要に応じて横幅を調整
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