import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdErrorOutline,
  MdCheckCircleOutline,
  MdOutlineAccountCircle,
} from 'react-icons/md';

const Notice = () => {
  const navigate = useNavigate();
  return (
    <div className="px-8 break-keep">
      <div className="font-bold text-3xl text-black px-4 pt-10 pb-8">
        NOTICE
      </div>
      {/* 예약 주의 사항 */}
      <div className="bg-white p-8 inline-block rounded-xl mb-8 shadow-md w-full lg:w-2/3">
        <div className="flex items-center space-x-2 font-bold text-xl">
          <MdErrorOutline className="text-blue-500 w-6 h-6" />
          <div>예약 주의 사항</div>
        </div>
        <div className="mt-6 ml-3">
          <div className="mt-5">
            사용자는 하나의 예약을 하고 해당 시간에 출석 체크를 한 뒤에 예약이
            추가로 가능합니다. <br />
          </div>
          <div className="mt-5">하루에 최대 두 번의 예약이 가능합니다.</div>
          <div className="mt-5">
            3번 노쇼 시 1개월 동안 세미나실 예약 시스템을 사용할 수 없도록
            제한됩니다. 본인의 예약 및 노쇼 현황은{' '}
            <span
              className="cursor-pointer hover:underline"
              onClick={() => navigate('/check')}>
              내 신청 현황
            </span>{' '}
            에서 확인할 수 있습니다.
          </div>
        </div>
      </div>
      {/* 출석 체크 */}
      <div className="bg-white p-8 inline-block rounded-xl mb-8 shadow-md w-full lg:w-2/3">
        <div className="flex items-center space-x-2">
          <MdCheckCircleOutline className="text-blue-500 w-6 h-6" />
          <div className="text-xl font-bold">출석 체크</div>
        </div>
        <div className="mt-6 ml-3">
          <div>
            예약한 시간 (예약 시작 시간의 15분 전 ~ 예약 종료 시간)에 맞추어서
            해당 세미나실에 방문한 후, 비치되어 있는 스캐너에 본인의 QR코드를
            찍으면 출석 체크가 이루어집니다.
          </div>
        </div>
      </div>
      {/* 계정 */}
      <div className="bg-white p-8 inline-block rounded-xl mb-8 shadow-md w-full lg:w-2/3">
        <div className="flex items-center space-x-2">
          <MdOutlineAccountCircle className="text-blue-500 w-6 h-6" />
          <div className="text-xl font-bold">계정</div>
        </div>
        <div className="mt-6 ml-3 mb-10">
          <div>
            초기 설정은{' '}
            <span className="text-blue-600">ID : 학번, PW : 학번</span>
            으로 이루어져 있습니다.
          </div>

          <div className="mt-5">
            로그인 후에{' '}
            <span
              className="cursor-pointer hover:underline"
              onClick={() => navigate('/password')}>
              비밀번호 변경
            </span>{' '}
            페이지에서 비밀번호를 변경하실 수 있습니다.
          </div>
          <div className="mt-5">
            비밀번호를 잊어버렸을 경우, 로그인 하단의 비밀번호 재설정 에서
            재설정이 가능합니다.
          </div>
          <div className="mt-5">
            회원 부여를 받지 못한 학생은 학부 사무실로 연락 주시기 바랍니다.
          </div>
        </div>
        <div>* 사용 관련 건의 및 문의 : ces@hufs.ac.kr</div>
      </div>
    </div>
  );
};

export default Notice;
