import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Autoplay } from 'swiper/modules';
import { useActivatedBanner } from '../../api/banner.api';

const Banner = () => {
  const { data: banners, isLoading, error } = useActivatedBanner();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading banners</div>;
  if (!banners || banners.length === 0) return <div>No banners available</div>;

  return (
    <div className="mt-5 mb-5 px-0 md:px-24 lg:px-96">
      <Swiper autoplay={{ delay: 3000 }} modules={[Autoplay]}>
        {banners?.map((banner, index) => (
          <SwiperSlide key={index} className="bg-gray-500">
            <img
              src={banner.imageUrl}
              alt={`Banner ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Banner;
