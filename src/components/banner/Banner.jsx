import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Autoplay } from 'swiper/modules';

import banner_1 from '../../assets/banner/banner_1.png';
import banner_2 from '../../assets/banner/banner_2.png';

const Banner = () => {
  return (
    <div className="mt-5 mb-5 px-0 md:px-24 lg:px-96">
      <Swiper autoplay={{ delay: 3000 }} modules={[Autoplay]}>
        <SwiperSlide className="bg-gray-500">
          <img
            src={banner_1}
            alt="Banner 1"
            className="w-full h-full object-cover"
          />
        </SwiperSlide>
        <SwiperSlide>
          <img
            src={banner_2}
            alt="Banner 2"
            className="w-full h-full object-cover"
          />
        </SwiperSlide>
      </Swiper>
    </div>
  );
};

export default Banner;
