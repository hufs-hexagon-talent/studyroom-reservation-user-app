import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Modal } from 'flowbite-react';

const DivideAct = () => {
  const [openModal, setOpenModal] = useState(false);
  const navigate = useNavigate();

  return (
    <div>
      <h3 className="flex font-bold justify-center w-screen text-2xl text-center mt-20 mb-5">
        관리자 페이지
      </h3>
      <div className="flex flex-col justify-center items-center mt-16">
        <p
          onClick={() => navigate('/schedule')}
          className="inline-block text-xl hover:underline cursor-pointer pb-10">
          스케줄 설정하러 가기 &gt;
        </p>
        <p
          onClick={() => setOpenModal(true)}
          className="inline-block text-xl hover:underline cursor-pointer pb-10">
          예약 조회하러 가기 &gt;
        </p>
      </div>
      <Modal
        show={openModal}
        onClose={() => setOpenModal(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Modal.Header>예약 조회 방법 선택</Modal.Header>
        <Modal.Body>
          <div className="flex flex-col space-y-6">
            <p
              onClick={() => navigate('/selectPartition')}
              className="inline-block text-lg hover:underline cursor-pointer">
              호실 및 날짜로 예약 조회하러 가기 &gt;
            </p>
            <p
              onClick={() => navigate('/serialCheck')}
              className="inline-block text-lg hover:underline cursor-pointer">
              학번으로 예약 조회하러 가기 &gt;
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="gray" onClick={() => setOpenModal(false)}>
            취소
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DivideAct;
