import React, { useState, useEffect } from 'react';

const DigitalClock = () => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  useEffect(() => {
    const weekday = ['日', '月', '火', '水', '木', '金', '土'];
    const updateDateTime = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const day = now.getDate();
      const dayOfWeek = weekday[now.getDay()];
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');

      setDate(`${year}/${month}/${day} ${dayOfWeek}`);
      setTime(`${hours}:${minutes}:${seconds}`);
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
