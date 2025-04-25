import React, { useState } from 'react';
import { Button, Checkbox, Label } from 'flowbite-react';
import { useSnackbar } from 'react-simple-snackbar';
import { useDeleteBanner } from '../../../api/banner.api';
import Delete from '../../../assets/icons/delete.png';

const BannerDelete = ({ activatedBanner, refetch }) => {
  const { mutateAsync: doDeleteBanner } = useDeleteBanner();
  const [bannerId, setBannerId] = useState(null);

  const [openSuccessSnackbar] = useSnackbar({
    position: 'top-right',
    style: { backgroundColor: '#4CAF50', color: '#FFFFFF' },
  });

  const [openErrorSnackbar] = useSnackbar({
    position: 'top-right',
    style: { backgroundColor: '#FF3333' },
  });

  const handleCheckboxChange = selectedBannerId => {
    // 같은 배너를 다시 클릭하면 선택 해제
    setBannerId(prevId =>
      prevId === selectedBannerId ? null : selectedBannerId,
    );
  };

  const deleteBanner = async () => {
    if (bannerId === null) {
      openErrorSnackbar('삭제할 배너를 선택하세요.', 2500);
      return;
    }
    await doDeleteBanner(bannerId, {
      onSuccess: () => {
        openSuccessSnackbar('배너 삭제 성공!', 2500);
        setBannerId(null);
        refetch();
      },
      onError: () => {
        openErrorSnackbar('배너 삭제 실패!', 2500);
      },
    });
  };

  return (
    <div className="max-w-[400px] flex flex-col gap-6">
      <div className="flex flex-row items-center">
        <div className="font-bold text-xl p-4">배너 삭제</div>
        <img
          onClick={deleteBanner}
          className="w-5 h-6 cursor-pointer hover:scale-125"
          src={Delete}
        />
      </div>
      <div className="flex flex-col items-center gap-4">
        {activatedBanner?.map((banner, index) => (
          <div key={index} className="flex items-center gap-4">
            <Checkbox
              id={`checkbox-${index}`}
              checked={bannerId === banner.bannerId}
              onChange={() => handleCheckboxChange(banner.bannerId)}
            />
            <Label>{banner.bannerId}</Label>
            <Label htmlFor={`checkbox-${index}`}>
              <img src={banner.imageUrl} alt={`Banner ${index}`} />
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BannerDelete;
