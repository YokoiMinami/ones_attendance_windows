import React, { useState, useEffect } from 'react';
import { formatDate, formatTime } from '../../common/format';

const DigitalClock = () => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setDate(formatDate(now));
      setTime(formatTime(now));
    };

    const intervalId = setInterval(updateDateTime, 1000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div>
      <p>{date} &nbsp;&nbsp;{time}</p>
    </div>
  );
};

export default DigitalClock;
