import React, { useState } from 'react';
import { Button, TextInput, Label, Checkbox } from 'flowbite-react';
import { useSnackbar } from 'react-simple-snackbar';
import { useEditBanner } from '../../api/banner.api';

const BannerEdit = ({ refetch }) => {
  const [editBannerType, setEditBannerType] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editLinkUrl, setEditLinkUrl] = useState('');
  const [isActive, setIsActive] = useState(false);
  const { mutateAsync: doEditBanner } = useEditBanner();

  const [openSuccessSnackbar] = useSnackbar({
    position: 'top-right',
    style: { backgroundColor: '#4CAF50', color: '#FFFFFF' },
  });

  const [openErrorSnackbar] = useSnackbar({
    position: 'top-right',
    style: { backgroundColor: '#FF3333' },
  });

  const handleCheckboxChange = e => {
    setIsActive(e.target.checked);
    console.log(isActive);
  };

  // 배너 수정
  const editBanner = async () => {
    try {
      await doEditBanner({
        bannerType: editBannerType,
        imageUrl: editImageUrl,
        linkUrl: editLinkUrl,
        active: isActive,
      });
      openSuccessSnackbar('배너 수정 성공', 2500);
      setEditImageUrl('');
      setEditBannerType('');
      setEditLinkUrl('');
      refetch();
    } catch (error) {
      console.error(error?.response?.data?.errors?.[0]?.message);
      openErrorSnackbar('배너 수정 실패!', 2500);
    }
  };

  return (
    <div className="w-1/3 min-w-[300px] flex flex-col items-center gap-4 mt-20 md:mt-10">
      <div>
        <h3 className="text-2xl text-center mb-10">배너 수정</h3>
      </div>
      <TextInput
        onChange={e => setEditBannerType(e.target.value)}
        value={editBannerType}
        id="bannerType"
        type="text"
        placeholder="수정될 배너의 타입을 입력하세요"
        className="w-full"
        required
      />
      <TextInput
        onChange={e => setEditImageUrl(e.target.value)}
        value={editImageUrl}
        id="imageUrl"
        type="text"
        placeholder="수정될 배너 이미지 URL을 입력하세요"
        className="w-full"
        required
      />
      <TextInput
        onChange={e => setEditLinkUrl(e.target.value)}
        value={editLinkUrl}
        id="linkUrl"
        type="text"
        placeholder="수정될 배너 링크 URL을 입력하세요"
        className="w-full"
        required
      />
      <div className="flex flex-row gap-6">
        <Label htmlFor="file" value="active" />
        <Checkbox
          id="active"
          checked={isActive}
          onChange={handleCheckboxChange}
        />
      </div>
      <Button onClick={editBanner} type="submit" className="bg-blue-900 w-full">
        배너 업로드
      </Button>
    </div>
  );
};

export default BannerEdit;
