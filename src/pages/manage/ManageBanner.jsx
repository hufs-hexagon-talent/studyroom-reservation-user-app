import React from 'react';
import { useActivatedBanner } from '../../api/banner.api';
import BannerUpload from '../admin/banner/BannerUpload';
import BannerDelete from '../admin/banner/BannerDelete';
import BannerEdit from '../admin/banner/BannerEdit';

const UploadBanner = () => {
  const { data: activatedBanner, refetch } = useActivatedBanner();

  return (
    <div className="flex flex-col md:flex-row mb-10 justify-center items-start gap-10 w-full px-10 mt-10">
      <div>
        <h3 className="text-2xl text-center mb-10">배너 업로드</h3>
        <BannerUpload refetch={refetch} />
      </div>
      <div>
        <h3 className="text-2xl text-center mb-10">배너 삭제하기</h3>
        <BannerDelete activatedBanner={activatedBanner} refetch={refetch} />
      </div>
      <div>
        <h3 className="text-2xl text-center mb-10">배너 수정</h3>
        <BannerEdit refetch={refetch} />
      </div>
    </div>
  );
};

export default UploadBanner;
