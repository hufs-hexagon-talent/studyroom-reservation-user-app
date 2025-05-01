import React, { useState } from 'react';
import { Label } from 'flowbite-react';
import UnderArrow from '../../../assets/icons/under_arrow_black.png';
import { useAllBanners } from '../../../api/banner.api';

const FetchAllBanners = () => {
  const [isFetch, setIsFetch] = useState(false);
  const { data: allBanners } = useAllBanners();

  return (
    <div className="max-w-[400px] flex flex-col px-4 gap-6">
      <div className="flex flex-row items-center py-6">
        <div className="font-bold text-3xl text-black px-4">Fetch Banner</div>
      </div>
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
    </div>
  );
};

export default FetchAllBanners;
