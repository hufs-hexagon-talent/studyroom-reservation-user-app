import React from 'react';
import { useDomain } from '../../contexts/DomainContext';

const Notice = () => {
  const { domain } = useDomain();

  const translatedDomain = domain === 'ces' ? '컴퓨터공학부' : '정보통신공학과';
  const roomDomain = domain === 'ces' ? ['306', '428'] : ['305', '409'];

  return (
    <div className="flex-grow px-8 break-keep">
      <div className="font-bold mt-10 text-2xl text-center break-keep">
        {translatedDomain} 세미나실 이용 규칙 및 예약 주의 사항
      </div>

      <div>
        <div className="font-bold mt-10 text-xl">예약 주의 사항 :</div>
        <div className="mt-6 ml-3">
          <div className="mt-5">
            사용자는 한 번에 한 개의 예약 만을 소유할 수 있습니다. <br />
            <span className="text-red-600">
              즉, 하나의 예약을 하고 해당 시간에 출석 체크를 한 뒤에 예약이
              추가로 가능합니다.
            </span>
          </div>
          <div className="mt-5">하루에 최대 두 번의 예약이 가능합니다.</div>
          <div className="mt-5">
            예약을 취소하지 않고 세미나실을 방문하지 않아 출석 체크를 하지 않은
            경우 (노쇼) 가 3번이 되면 3개월 동안 세미나실 예약 시스템을 사용할
            수 없도록 제한됩니다. <br />
            또한, 본인의 예약 및 노쇼 현황은 &apos;내 신청 현황&apos; 에서
            확인할 수 있습니다.
          </div>
        </div>
        <div className="font-bold mt-10 text-xl">출석 체크 :</div>
        <div className="mt-6 ml-3">
          <div>
            예약한 시간 (예약 시작 시간의 15분 전 ~ 예약 종료 시간)에 맞추어서
            해당 세미나실 ({roomDomain[0]}호 또는 {roomDomain[1]}호) 에 방문
            하여 비치되어 있는 스캐너에 본인의 QR코드를 찍으면 출석 체크가
            이루어집니다.
          </div>
          <div className="mt-5">
            출석 여부는 &apos;내 신청현황&apos; 의 출석 여부에서 확인하실 수
            있습니다.
          </div>
        </div>
        <div className="font-bold mt-10 text-xl">계정 :</div>
        <div className="mt-6 ml-3 mb-10">
          <div>
            초기 설정은{' '}
            <span className="text-red-600">ID : 학번, PW : 학번</span>
            으로 이루어져 있습니다.
          </div>

          <div className="mt-5">
            로그인 후에 &apos;비밀번호 변경&apos; 페이지에서 비밀번호를 변경하실
            수 있습니다.
          </div>
          <div className="mt-5">
            비밀번호를 잊어버렸을 경우, 로그인 하단의 &apos;비밀번호
            재설정&apos; 에서 자신의 ID(=학번) 을 입력하고 &apos;인증 코드
            발송&apos; 을 누르면 종합정보시스템에 등록된 이메일로 인증 코드가
            전송됩니다. <br />
            해당 인증 코드를 입력한 후에 비밀번호를 재설정 하실 수 있습니다.
          </div>
          <div className="mt-5">
            회원 부여를 받지 못한 학생은 학부 사무실로 연락 주시기 바랍니다.
          </div>
        </div>
        <div className="mb-20">
          * 사용 관련 건의 및 문의 : {domain}@hufs.ac.kr
        </div>
      </div>
    </div>
  );
};

export default Notice;
