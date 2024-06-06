import React from 'react';

const SelectRoom = () => {
  return (
    <div>
      <div className="font-bold mt-10 text-2xl text-center">
        방을 선택하세요
      </div>
      <div className="flex items-center justify-center mt-10">
        <div className="flex flex-col items-start mr-8">
          <div className="flex items-center mb-4">
            <input
              id="box-306-1"
              type="checkbox"
              value=""
              className="w-4 h-4"
            />
            <label htmlFor="box-306-1" className="ml-2 text-xl font-medium">
              306-1
            </label>
          </div>
          <div className="flex items-center mb-4">
            <input
              id="box-306-2"
              type="checkbox"
              value=""
              className="w-4 h-4"
            />
            <label htmlFor="box-306-2" className="ml-2 text-xl font-medium">
              306-2
            </label>
          </div>
          <div className="flex items-center mb-4">
            <input
              id="box-306-3"
              type="checkbox"
              value=""
              className="w-4 h-4"
            />
            <label htmlFor="box-306-3" className="ml-2 text-xl font-medium">
              306-3
            </label>
          </div>
          <div className="flex items-center mb-4">
            <input
              id="box-306-4"
              type="checkbox"
              value=""
              className="w-4 h-4"
            />
            <label htmlFor="box-306-4" className="ml-2 text-xl font-medium">
              306-4
            </label>
          </div>
        </div>
        <div className="flex flex-col items-start">
          <div className="flex items-center mb-4">
            <input
              id="box-428-1"
              type="checkbox"
              value=""
              className="w-4 h-4"
            />
            <label htmlFor="box-428-1" className="ml-2 text-xl font-medium">
              428-1
            </label>
          </div>
          <div className="flex items-center mb-4">
            <input
              id="box-428-2"
              type="checkbox"
              value=""
              className="w-4 h-4"
            />
            <label htmlFor="box-428-2" className="ml-2 text-xl font-medium">
              428-2
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectRoom;
