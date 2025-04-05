import React from 'react';
import { useActivatedBanner } from '../../api/banner.api';

import BannerUpload from './BannerUpload';
import BannerEdit from './BannerEdit';
import BannerDelete from './BannerDelete';

const DashBoardBanner = () => {
  const { data: activatedBanner, refetch } = useActivatedBanner();

  return (
    <div className="flex flex-row gap-x-6">
      {/* 업로드 */}
      <div className="bg-white rounded-xl p-4 hover:shadow-2xl w-full max-w-sm">
        <div className="font-bold text-xl p-4">배너 업로드</div>
        <BannerUpload refetch={refetch} />
      </div>

      {/* 수정 */}
      <div className="bg-white rounded-xl p-4 hover:shadow-2xl w-full max-w-sm">
        <div className="font-bold text-xl p-4">배너 수정</div>
        <BannerEdit refetch={refetch} />
      </div>

      {/* 삭제 */}
      <div className="bg-white rounded-xl p-4 hover:shadow-2xl w-full max-w-sm">
        <div className="font-bold text-xl p-4">배너 삭제</div>
        <BannerDelete refetch={refetch} activatedBanner={activatedBanner} />
      </div>
    </div>
  );
};

export default DashBoardBanner;
