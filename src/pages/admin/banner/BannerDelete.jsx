import React, { useState } from 'react';
import { Button, Checkbox, Label } from 'flowbite-react';
import { useSnackbar } from 'react-simple-snackbar';
import { useDeleteBanner } from '../../../api/banner.api';
import { useActivatedBanner } from '../../../api/banner.api';

const BannerDelete = () => {
  const { mutateAsync: doDeleteBanner } = useDeleteBanner();
  const { data: activatedBanner, refetch } = useActivatedBanner();
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
    <div className="max-w-[400px] flex flex-col px-4 gap-6">
      <div className="flex flex-row items-center justify-between">
        <div className="font-bold text-3xl text-black px-4 py-8">
          Delete Banner
        </div>
        {bannerId && (
          <div className="flex justify-end pr-4">
            <Button
              onClick={deleteBanner}
              color="dark"
              className="text-white rounded hover:bg-gray-600 transition">
              삭제
            </Button>
          </div>
        )}
      </div>
      <div className="flex flex-col items-center gap-4">
        {activatedBanner?.map((banner, index) => (
          <div key={index} className="flex items-center gap-4">
            <Checkbox
              className="rounded-none text-[#1D2430] focus:ring-[#1D2430]"
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
