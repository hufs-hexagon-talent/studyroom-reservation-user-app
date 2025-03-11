import React from 'react';
import { useActivatedBanner } from '../../api/banner.api';
import BannerUpload from '../../components/banner/BannerUpload';
import BannerDelete from '../../components/banner/BannerDelete';
import BannerEdit from '../../components/banner/BannerEdit';

const UploadBanner = () => {
  const { data: activatedBanner, refetch } = useActivatedBanner();

  return (
    <div className="flex flex-col md:flex-row mb-10 justify-center items-start gap-10 w-full px-10 mt-10">
      <BannerUpload refetch={refetch} />
      <BannerDelete activatedBanner={activatedBanner} refetch={refetch} />
      <BannerEdit refetch={refetch} />
    </div>
  );
};

export default UploadBanner;
