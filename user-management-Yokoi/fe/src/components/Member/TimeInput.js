import React, { forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CustomInput = forwardRef(({ value, onClick, onMouseEnter }, ref) => (
  <input
    className="time_input"
    value={value}
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    readOnly
    ref={ref}
  />
));

export default CustomInput;

// function TimeInput() {
//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const [isOpen, setIsOpen] = useState(false);

//   const handleMouseEnter = () => {
//     setIsOpen(true);
//   };

//   const handleClick = () => {
//     setIsOpen(false);
//   };

//   return (
//     <div>
//       <DatePicker
//         selected={selectedDate}
//         onChange={date => setSelectedDate(date)}
//         showTimeSelect
//         showTimeSelectOnly
//         timeIntervals={15}
//         timeCaption="Time"
//         dateFormat="HH:mm"
//         timeFormat="HH:mm"
//         customInput={<CustomInput onMouseEnter={handleMouseEnter} onClick={handleClick} />}
//         open={isOpen}
//         onClickOutside={() => setIsOpen(false)}
//       />
//     </div>
//   );
// }

// export default TimeInput;
