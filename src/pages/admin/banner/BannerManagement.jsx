import React from 'react';
import { useActivatedBanner, useAllBanners } from '../../../api/banner.api';

import BannerUpload from './BannerUpload';
import BannerEdit from './BannerEdit';
import BannerDelete from './BannerDelete';
import FetchAllBanners from './FetchAllBanners';

const BannerManagement = () => {
  const { data: activatedBanner, refetch } = useActivatedBanner();
  const { data: allBanners } = useAllBanners();

  return (
    <div>
      <div className="font-bold text-3xl text-black p-8">Banner</div>
      <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
        {/* 모든 배너 조회 */}
        <div className="bg-white rounded-xl p-4 hover:shadow-2xl w-full">
          <FetchAllBanners refetch={refetch} allBanners={allBanners} />
        </div>

        {/* 업로드 */}
        <div className="bg-white rounded-xl p-4 hover:shadow-2xl w-full">
          <BannerUpload refetch={refetch} />
        </div>

        {/* 수정 */}
        <div className="bg-white rounded-xl p-4 hover:shadow-2xl w-full">
          <BannerEdit refetch={refetch} />
        </div>

        {/* 삭제 */}
        <div className="bg-white rounded-xl p-4 hover:shadow-2xl w-full">
          <BannerDelete refetch={refetch} activatedBanner={activatedBanner} />
        </div>
      </div>
    </div>
  );
};

export default BannerManagement;
