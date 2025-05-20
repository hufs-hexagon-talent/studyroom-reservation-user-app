import React, { useState } from 'react';
import { useAllBanners, useEditBanner } from '../../../api/banner.api';
import { Button, Checkbox, Modal, Table } from 'flowbite-react';
import { HiXCircle, HiCheckCircle } from 'react-icons/hi';
import { useSnackbar } from 'react-simple-snackbar';

const FetchAllBanners = () => {
  const [selectedBannerId, setSelectedBannerId] = useState(null);
  const [editBannerType, setEditBannerType] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editLinkUrl, setEditLinkUrl] = useState('');
  const [editBannerId, setEditBannerId] = useState(null);
  const [isActive, setIsActive] = useState(false);

  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const { data: allBanners, refetch: allBannersRefetch } = useAllBanners();
  const { mutateAsync: doEditBanner } = useEditBanner();

  const [openErrorSnackbar] = useSnackbar({
    position: 'top-right',
    style: {
      backgroundColor: '#FF3333', // 빨간색
    },
  });
  const [openSuccessSnackbar] = useSnackbar({
    position: 'top-right',
    style: {
      backgroundColor: '#4CAF50', // 초록색
    },
  });

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
          setOpenEditModal(false);
          allBannersRefetch();
        },
        onError: error => {
          console.error(error?.response?.data?.errors?.[0]?.message);
          openErrorSnackbar('배너 수정 실패!', 2500);
        },
      },
    );
  };

  return (
    <div className="flex flex-col px-4 gap-6">
      <div className="flex flex-row justify-between items-center py-6">
        <div className="font-bold text-3xl text-black px-4">Fetch Banner</div>
        {selectedBannerId && (
          <div className="flex flex-row space-x-2">
            <Button
              onClick={() => {
                const banner = allBanners.find(
                  b => b.bannerId === selectedBannerId,
                );
                if (banner) {
                  setEditBannerId(banner.bannerId);
                  setEditBannerType(banner.bannerType);
                  setEditImageUrl(banner.imageUrl);
                  setEditLinkUrl(banner.linkUrl);
                  setIsActive(banner.active);
                }
                setOpenEditModal(true);
              }}
              color="dark">
              수정
            </Button>

            <Button className="bg-red-600 hover:bg-red-700">삭제</Button>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-4">
        <Table className="text-center text-lg">
          <Table.Head className="text-lg break-keep">
            <Table.HeadCell className="bg-gray-200"></Table.HeadCell>
            <Table.HeadCell className="bg-gray-200">배너 ID</Table.HeadCell>
            <Table.HeadCell className="bg-gray-200 lg:w-1/3">
              배너
            </Table.HeadCell>
            <Table.HeadCell className="bg-gray-200">연결 링크</Table.HeadCell>
            <Table.HeadCell className="bg-gray-200">활성화 여부</Table.HeadCell>
          </Table.Head>
          <Table.Body className="bg-white">
            {allBanners?.map(banner => (
              <Table.Row key={banner.bannerId}>
                <Table.Cell>
                  <Checkbox
                    checked={selectedBannerId === banner.bannerId}
                    onChange={() => {
                      setSelectedBannerId(prev =>
                        prev === banner.bannerId ? null : banner.bannerId,
                      );
                    }}
                    className="rounded-none text-[#1D2430] focus:ring-[#1D2430] cursor-pointer"
                  />
                </Table.Cell>
                <Table.Cell>{banner.bannerId}</Table.Cell>
                <Table.Cell className="items-center">
                  <img src={banner.imageUrl} />
                </Table.Cell>
                <Table.Cell
                  className="cursor-pointer"
                  onClick={() => window.open(banner.linkUrl, '_blank')}>
                  {banner.linkUrl}
                </Table.Cell>
                <Table.Cell className="items-center">
                  {banner.active ? (
                    <HiCheckCircle className="w-6 h-6 text-green-400" />
                  ) : (
                    <HiXCircle className="w-6 h-6 text-red-500" />
                  )}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
      <Modal show={openEditModal} onClose={() => setOpenEditModal(false)}>
        <Modal.Header>
          <strong>{selectedBannerId}</strong>번 배너 수정
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-6">
            {/* 배너 활성화 체크박스 */}
            <div className="flex flex-row items-center gap-6 px-1">
              <div className="text-lg">Active</div>
              <Checkbox
                className="rounded-none p-2 text-[#1D2430] focus:ring-[#1D2430]"
                id="active"
                checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
              />
            </div>
            {/* 배너 아이디 */}
            <div className="flex flex-row text-center">
              <div className="border py-3 bg-gray-200 rounded-l-lg text-gray-600 font-bold text-lg w-1/4 flex justify-center items-center">
                id
              </div>
              <div className="border py-3 text-start  bg-white w-full rounded-r-lg p-2">
                <p className="ml-3">{selectedBannerId}</p>
              </div>
            </div>
            {/* 배너 타입 */}
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
            {/* 이미지 URL */}
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
            {/* 링크 URL */}
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
          <div className="flex justify-end space-x-3 pt-8">
            <Button
              className="bg-gray-300 text-black"
              onClick={() => setOpenEditModal(false)}>
              취소
            </Button>
            <Button onClick={editBanner} color="dark">
              수정
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default FetchAllBanners;
