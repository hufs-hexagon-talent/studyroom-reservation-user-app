import React, { useState } from 'react';
import { TextInput, Label, Checkbox } from 'flowbite-react';
import { useSnackbar } from 'react-simple-snackbar';
import { useEditBanner } from '../../../api/banner.api';
import Edit from '../../../assets/icons/edit.png';

const BannerEdit = () => {
  const [editBannerType, setEditBannerType] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editLinkUrl, setEditLinkUrl] = useState('');
  const [editBannerId, setEditBannerId] = useState(null);
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
    if (
      editBannerId === '' ||
      editBannerType === '' ||
      editImageUrl === '' ||
      editLinkUrl === '' ||
      isActive === ''
    ) {
      openErrorSnackbar('배너 값을 입력하세요.');
      return;
    }
    await doEditBanner(
      {
        bannerId: editBannerId,
        bannerType: editBannerType,
        imageUrl: editImageUrl,
        linkUrl: editLinkUrl,
        active: isActive,
      },
      {
        onSuccess: () => {
          openSuccessSnackbar('배너 수정 성공', 2500);
          setEditImageUrl('');
          setEditBannerType('');
          setEditLinkUrl('');
        },
        onError: error => {
          console.error(error?.response?.data?.errors?.[0]?.message);
          openErrorSnackbar('배너 수정 실패!', 2500);
        },
      },
    );
  };

  return (
    <div className="w-full max-w-[400px] flex flex-col px-4 gap-6">
      <div className="flex flex-row items-center gap-x-4 pt-8">
        <div className="font-bold text-3xl text-black px-4">Edit Banner</div>
        <img
          onClick={editBanner}
          type="submit"
          className="w-5 h-5 cursor-pointer hover:scale-125"
          src={Edit}
        />
      </div>
      <div className="flex flex-col gap-y-4 px-4 pb-6">
        <div className="flex flex-row gap-6 px-1">
          <Label htmlFor="file" value="active" />
          <Checkbox
            id="active"
            checked={isActive}
            onChange={handleCheckboxChange}
          />
        </div>
        <TextInput
          onChange={e => setEditBannerId(e.target.value)}
          value={editBannerId}
          id="bannerId"
          type="text"
          placeholder="수정될 배너의 아이디를 입력하세요"
          className="w-full"
          required
        />
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
      </div>
    </div>
  );
};

export default BannerEdit;
