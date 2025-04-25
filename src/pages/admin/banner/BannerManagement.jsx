import React from 'react';
import { useActivatedBanner } from '../../../api/banner.api';

import BannerUpload from './BannerUpload';
import BannerEdit from './BannerEdit';
import BannerDelete from './BannerDelete';

const BannerManagement = () => {
  const { data: activatedBanner, refetch } = useActivatedBanner();

  return (
    <div>
      <div className="font-bold text-3xl text-black p-8">Banner</div>
      <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
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
