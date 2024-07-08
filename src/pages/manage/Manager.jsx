import React from 'react';

const Manager = () => {
  return (
    <div className="ml-3">
      <h3 className="mt-3 mb-5 font-bold text-xl">멀티지기 출근부</h3>
      <div>멀티지기 QR 코드 확인 : </div>
      <input
        className="mt-1 border border-gray-300 p-2 rounded"
        type="text"
        placeholder="Scan QR Code"></input>
    </div>
  );
};

export default Manager;
