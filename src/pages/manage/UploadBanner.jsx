import React from 'react';
import { useActivatedBanner } from '../../api/banner.api';
import BannerUpload from '../../components/banner/BannerUpload';
import BannerDelete from '../../components/banner/BannerDelete';

const UploadBanner = () => {
  const { data: activatedBanner, refetch } = useActivatedBanner();

  return (
    <div className="flex flew-row">
      <BannerUpload refetch={refetch} />
      <BannerDelete activatedBanner={activatedBanner} refetch={refetch} />
    </div>
  );
};

export default UploadBanner;
