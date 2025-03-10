import React, { useState } from 'react';
import { Button, Checkbox, Label } from 'flowbite-react';
import { useSnackbar } from 'react-simple-snackbar';
import { useDeleteBanner } from '../../api/banner.api';

const BannerDelete = ({ activatedBanner, refetch }) => {
  const [bannerId, setBannerId] = useState(null);

  const { mutateAsync: doDeleteBanner } = useDeleteBanner();

  const [openSuccessSnackbar] = useSnackbar({
    position: 'top-right',
    style: { backgroundColor: '#4CAF50', color: '#FFFFFF' },
  });

  const [openErrorSnackbar] = useSnackbar({
    position: 'top-right',
    style: { backgroundColor: '#FF3333' },
  });

  const handleCheckboxChange = bannerId => {
    setBannerId(bannerId);
  };

  const deleteBanner = async () => {
    if (bannerId === null) {
      openErrorSnackbar('삭제할 배너를 선택하세요.', 2500);
      return;
    }

    try {
      await doDeleteBanner(bannerId);
      openSuccessSnackbar('배너 삭제 성공!', 2500);
      setBannerId(null);
      refetch();
    } catch (error) {
      openErrorSnackbar('배너 삭제 실패!', 2500);
    }
  };

  return (
    <div className="flex flex-col items-center w-full mt-20">
      <h3 className="text-2xl text-center mb-10">배너 삭제하기</h3>
      <div className="w-1/3 min-w-[300px] flex flex-col items-center gap-4">
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
      <Button
        onClick={deleteBanner}
        type="submit"
        className="bg-blue-900 mt-10 w-2/3">
        배너 삭제
      </Button>
    </div>
  );
};

export default BannerDelete;
