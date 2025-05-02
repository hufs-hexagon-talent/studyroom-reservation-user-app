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
      <div className="space-y-6">
        {/* 배너 활성화 체크박스 */}
        <div className="flex flex-row items-center gap-6 px-1 pt-4">
          <div className="text-lg">Active</div>
          <Checkbox
            className="rounded-none p-2"
            id="active"
            checked={isActive}
            onChange={handleCheckboxChange}
          />
        </div>
        {/* 배너 타입 업로드 */}
        <div className="flex flex-row text-center">
          <div className="border bg-gray-200 rounded-l-lg text-gray-600 font-bold text-lg w-1/4 flex justify-center items-center">
            id
          </div>
          <div className="border bg-white w-full rounded-r-lg p-2">
            <input
              onChange={e => setEditBannerId(e.target.value)}
              required
              value={editBannerId}
              id="bannerId"
              type="text"
              placeholder="수정될 배너의 아이디를 입력하세요"
              className="w-full border-none focus:outline-none focus:ring-0 focus:border-transparent"
            />
          </div>
        </div>
        {/* 배너 타입 업로드 */}
        <div className="flex flex-row text-center">
          <div className="border bg-gray-200 rounded-l-lg text-gray-600 font-bold text-lg w-1/4 flex justify-center items-center">
            type
          </div>
          <div className="border bg-white w-full rounded-r-lg p-2">
            <input
              onChange={e => setEditBannerType(e.target.value)}
              required
              value={editBannerType}
              id="bannerType"
              type="text"
              placeholder="수정될 배너의 타입을 입력하세요"
              className="w-full border-none focus:outline-none focus:ring-0 focus:border-transparent"
            />
          </div>
        </div>
        {/* 이미지 URL 업로드 */}
        <div className="flex flex-row text-center">
          <div className="border bg-gray-200 rounded-l-lg text-gray-600 font-bold text-lg w-1/4 flex justify-center items-center">
            img
          </div>
          <div className="border bg-white w-full rounded-r-lg p-2">
            <input
              onChange={e => setEditImageUrl(e.target.value)}
              required
              value={editImageUrl}
              id="imageUrl"
              type="text"
              placeholder="수정될 배너 이미지 URL을 입력하세요"
              className="w-full border-none focus:outline-none focus:ring-0 focus:border-transparent"
            />
          </div>
        </div>
        {/* 링크 URL 업로드 */}
        <div className="flex flex-row text-center">
          <div className="border bg-gray-200 rounded-l-lg text-gray-600 font-bold text-lg w-1/4 flex justify-center items-center">
            link
          </div>
          <div className="border bg-white w-full rounded-r-lg p-2">
            <input
              onChange={e => setEditLinkUrl(e.target.value)}
              required
              value={editLinkUrl}
              id="linkUrl"
              type="text"
              placeholder="수정될 배너 링크 URL을 입력하세요"
              className="w-full border-none focus:outline-none focus:ring-0 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerEdit;
