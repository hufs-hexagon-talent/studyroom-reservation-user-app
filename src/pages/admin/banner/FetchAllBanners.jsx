import React, { useState } from 'react';
import { Label } from 'flowbite-react';
import UnderArrow from '../../../assets/icons/under_arrow_black.png';

const FetchAllBanners = ({ allBanners }) => {
  const [isFetch, setIsFetch] = useState(false);

  return (
    <div className="max-w-[400px] flex flex-col gap-6">
      <div className="flex flex-row items-center">
        <div className="font-bold text-xl p-4">모든 배너 조회</div>
        <img
          onClick={() => setIsFetch(!isFetch)}
          className={`w-5 h-6 cursor-pointer transition-transform duration-300 hover:scale-125 ${isFetch ? 'rotate-180' : ''}`}
          src={UnderArrow}
        />
      </div>
      {isFetch && (
        <div className="flex flex-col items-center gap-4">
          {allBanners?.map((banner, index) => (
            <div key={index} className="flex items-center gap-4">
              <Label>{banner.bannerId}</Label>
              <Label htmlFor={`checkbox-${index}`}>
                <img src={banner.imageUrl} alt={`Banner ${index}`} />
              </Label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FetchAllBanners;
