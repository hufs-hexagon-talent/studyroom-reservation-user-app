import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Autoplay } from 'swiper/modules';
import { useActivatedBanner } from '../../api/banner.api';

const Banner = () => {
  const notionUrl = 'https://hwangbbang.notion.site/';
  const siteUrl = 'https://studyroom.computer.hufs.ac.kr/';
  const qaUrl = 'https://studyroom-qa.alpaon.net/';

  const navigate = useNavigate();
  const { data: banners = [] } = useActivatedBanner();

  return (
    <div className="mt-5 mb-5 px-0 md:px-24 lg:px-96">
      <Swiper autoplay={{ delay: 3000 }} modules={[Autoplay]}>
        {banners.map((banner, index) => (
          <SwiperSlide key={index} className="bg-gray-500">
            <img
              onClick={() => {
                if (banner.linkUrl) {
                  if (banner.linkUrl.startsWith(notionUrl)) {
                    window.open(banner.linkUrl, '_blank');
                  } else if (banner.linkUrl.startsWith(siteUrl)) {
                    const path = banner.linkUrl.replace(siteUrl, '');
                    navigate(path);
                  } else if (banner.linkUrl.startsWith(qaUrl)) {
                    const path = banner.linkUrl.replace(qaUrl, '');
                    navigate(path);
                  }
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
