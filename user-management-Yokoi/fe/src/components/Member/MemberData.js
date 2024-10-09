import React from 'react';
import { useParams } from 'react-router-dom';

const MemberData = () => {
  const { id } = useParams();

  return (
    <div>
      <h2>User ID: {id}</h2>
      {/* ここにユーザーの詳細情報を表示するロジックを追加できます */}
    </div>
  );
};

export default MemberData;
