import React, { useState } from 'react';
import { Button, TextInput } from 'flowbite-react';
import { useSnackbar } from 'react-simple-snackbar';
import { usePostBanner } from '../../api/banner.api';

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

  const uploadBanner = async () => {
    try {
      await doPostBanner({ bannerType, imageUrl, linkUrl });
      openSuccessSnackbar('배너 업로드 성공!', 2500);
      setBannerType('');
      setImageUrl('');
      setLinkUrl('');
      refetch();
    } catch (error) {
      console.error(error?.response?.data?.errors?.[0]?.message);
      openErrorSnackbar('배너 업로드 실패!', 2500);
    }
  };

  return (
    <div className="flex flex-col items-center w-full mt-20">
      <h3 className="text-2xl text-center mb-10">배너 업로드</h3>
      <div className="w-1/3 min-w-[300px] flex flex-col items-center gap-4">
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
          className="w-full"
          required
        />
        <Button
          onClick={uploadBanner}
          type="submit"
          className="bg-blue-900 w-full">
          배너 업로드
        </Button>
      </div>
    </div>
  );
};

export default BannerUpload;
