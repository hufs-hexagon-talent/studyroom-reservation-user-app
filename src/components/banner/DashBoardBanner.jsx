import React from 'react';
import BannerUpload from './BannerUpload';
import BannerEdit from './BannerEdit';
import BannerDelete from './BannerDelete';

const DashBoardBanner = () => {
  return (
    <div className="flex flex-row gap-x-6">
      {/* 업로드 */}
      <div className="bg-white rounded-xl p-4 hover:shadow-2xl w-full max-w-sm">
        <BannerUpload />
      </div>

      {/* 수정 */}
      <div className="bg-white rounded-xl p-4 hover:shadow-2xl w-full max-w-sm">
        <BannerEdit />
      </div>

      {/* 삭제 */}
      <div className="bg-white rounded-xl p-4 hover:shadow-2xl w-full max-w-sm">
        <BannerDelete />
      </div>
    </div>
  );
};

export default DashBoardBanner;
