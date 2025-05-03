import React, { useState } from 'react';
import { TextInput } from 'flowbite-react';
import { useSnackbar } from 'react-simple-snackbar';
import { usePostBanner } from '../../../api/banner.api';
import UpLoad from '../../../assets/icons/upload.png';
import { Input } from '@mui/material';

const BannerUpload = () => {
  const [bannerType, setBannerType] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  const { mutateAsync: doPostBanner } = usePostBanner();

  const [openSuccessSnackbar] = useSnackbar({
    position: 'top-right',
    style: { backgroundColor: '#4CAF50', color: '#FFFFFF' },
  });

  const [openErrorSnackbar] = useSnackbar({
    position: 'top-right',
    style: { backgroundColor: '#FF3333' },
  });

  // 배너 업로드
  const uploadBanner = async () => {
    if (bannerType == '' || imageUrl == '' || linkUrl == '') {
      openErrorSnackbar('배너 값을 입력하세요');
      return;
    }

    await doPostBanner(
      {
        bannerType: bannerType,
        imageUrl: imageUrl,
        linkUrl: linkUrl,
      },
      {
        onSuccess: () => {
          openSuccessSnackbar('배너 업로드 성공!', 2500);
          setBannerType('');
          setImageUrl('');
          setLinkUrl('');
        },
        onError: error => {
          console.error(error);
          openErrorSnackbar('배너 업로드 실패!', 2500);
        },
      },
    );
  };

  return (
    <div className="w-full max-w-[400px] flex flex-col px-4 gap-6">
      <div className="flex flex-row gap-x-6 items-center">
        <div className="font-bold text-3xl text-black px-4 py-8">
          Upload Banner
        </div>
        <img
          onClick={uploadBanner}
          type="submit"
          className="w-4 h-4 cursor-pointer hover:scale-125"
          src={UpLoad}
        />
      </div>

      {/* 배너 타입 업로드 */}
      <div className="flex flex-row text-center">
        <div className="border bg-gray-200 text-gray-600 font-bold rounded-l-lg text-lg w-1/4 flex justify-center items-center">
          type
        </div>
        <div className="border bg-white w-full rounded-r-lg p-2">
          <input
            onChange={e => setBannerType(e.target.value)}
            required
            value={bannerType}
            id="bannerType"
            type="text"
            placeholder="배너 타입을 입력하세요"
            className="w-full border-none focus:outline-none focus:ring-0 focus:border-transparent"
          />
        </div>
      </div>
      {/* 배너 이미지 url 업로드 */}
      <div className="flex flex-row text-center">
        <div className="border bg-gray-200 rounded-l-lg text-lg text-gray-600 font-bold w-1/4 flex justify-center items-center">
          img
        </div>
        <div className="border bg-white w-full rounded-r-lg p-2">
          <input
            onChange={e => setImageUrl(e.target.value)}
            required
            value={imageUrl}
            id="imageUrl"
            type="text"
            placeholder="배너 이미지 URL을 입력하세요"
            className="w-full border-none focus:outline-none focus:ring-0 focus:border-transparent"
          />
        </div>
      </div>
      {/* 배너 링크 url 업로드 */}
      <div className="flex flex-row text-center">
        <div className="border bg-gray-200 rounded-l-lg text-gray-600 font-bold text-lg w-1/4 flex justify-center items-center">
          link
        </div>
        <div className="border bg-white w-full rounded-r-lg p-2">
          <input
            onChange={e => setLinkUrl(e.target.value)}
            required
            value={linkUrl}
            id="linkUrl"
            type="text"
            placeholder="배너 링크 URL을 입력하세요"
            className="w-full border-none focus:outline-none focus:ring-0 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
};

export default BannerUpload;
