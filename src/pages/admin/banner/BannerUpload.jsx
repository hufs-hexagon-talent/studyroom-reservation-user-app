import React, { useState } from 'react';
import { Button, TextInput } from 'flowbite-react';
import { useSnackbar } from 'react-simple-snackbar';
import { usePostBanner } from '../../../api/banner.api';
import UpLoad from '../../../assets/icons/upload.png';

const BannerUpload = ({ refetch }) => {
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
          refetch();
        },
        onError: error => {
          console.error(error);
          openErrorSnackbar('배너 업로드 실패!', 2500);
        },
      },
    );
  };

  return (
    <div className="w-full max-w-[400px] flex flex-col gap-6">
      <div className="flex flex-row items-center">
        <div className="font-bold text-xl p-4">배너 업로드</div>
        <img
          onClick={uploadBanner}
          type="submit"
          className="w-4 h-4 cursor-pointer hover:scale-125"
          src={UpLoad}
        />
      </div>
      <div className=" flex flex-col items-center gap-4">
        <TextInput
          onChange={e => setBannerType(e.target.value)}
          value={bannerType}
          id="bannerType"
          type="text"
          placeholder="배너 타입을 입력하세요"
          className="w-full"
          required
        />
        <TextInput
          onChange={e => setImageUrl(e.target.value)}
          value={imageUrl}
          id="imageUrl"
          type="text"
          placeholder="배너 이미지 URL을 입력하세요"
          className="w-full"
          required
        />
        <TextInput
          onChange={e => setLinkUrl(e.target.value)}
          value={linkUrl}
          id="linkUrl"
          type="text"
          placeholder="배너 링크 URL을 입력하세요"
          className="w-full mb-6"
          required
        />
      </div>
    </div>
  );
};

export default BannerUpload;
