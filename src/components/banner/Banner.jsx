import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Autoplay } from 'swiper/modules';
import { useActivatedBanner } from '../../api/banner.api';

const Banner = () => {
  const { data: banners = [] } = useActivatedBanner();

  return (
    <div className="mt-5 mb-5 px-0 md:px-24 lg:px-96">
      <Swiper autoplay={{ delay: 3000 }} modules={[Autoplay]}>
        {banners.map((banner, index) => (
          <SwiperSlide key={index} className="bg-gray-500">
            <img
              onClick={() => {
                if (banner.linkUrl) {
                  window.open(banner.linkUrl, '_blank', 'noopener,noreferrer');
                }
              }}
              src={banner.imageUrl}
              alt={`Banner ${index + 1}`}
              className="w-full h-full object-cover cursor-pointer"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Banner;
