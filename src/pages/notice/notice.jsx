import React from 'react';

const Notice = () => {
  return (
    <div className="flex-grow ml-10 mr-10 break-keep">
      <div className="font-bold mt-10 text-2xl text-center break-keep">
        컴퓨터공학부 세미나실 이용 규칙 및 예약 주의 사항
      </div>
      <div className="font-bold mt-10 text-xl">예약 주의 사항 :</div>
      <div className="mt-8 ml-5">
        <div>- 하루에 최대 두 번의 예약이 가능합니다.</div>
        <div className="mt-5">
          - 사용자는 한번에 한 개의 예약 만을 소유할 수 있습니다. <br />
          즉, 하나의 예약을 하고 해당 시간 (예약 시작 시간의 15분전 ~ 예약 종료
          시간)에 출석 체크를 한 뒤에 예약이 추가로 가능합니다.
        </div>
        <div className="mt-5">
          - 예약을 취소 하지 않고 세미나실을 방문하지 않아 출석 체크를 하지 않은
          경우 (노쇼)가 3번이 되면 3개월 동안 세미나실 예약 시스템을 사용할 수
          없도록 제한됩니다. <br />
          또한, 본인의 예약 및 노쇼 현황은 &apos;내 신청 현황&apos; 에서 확인할
          수 있습니다.
        </div>
      </div>
      <div className="font-bold mt-10 text-xl">출석 체크 :</div>
      <div className="mt-8 ml-5">
        <div>
          - 예약한 시간 (예약 시작 시간의 15분 전 ~ 예약 종료 시간)에 맞추어서
          해당 세미나실 (306호 또는 428호)에 방문 하여 비치되어있는 스캐너에
          본인의 QR코드를 찍으면 체크인이 이루어집니다.
        </div>
        <div className="mt-5">
          - 출석 여부는 &apos;내 신청현황&apos; 의 출석 여부에서 확인하실 수
          있습니다.
        </div>
      </div>
      <div className="font-bold mt-10 text-xl">계정 :</div>
      <div className="mt-8 ml-5 mb-20">
        <div>- 초기 설정은 ID : 학번, PW : 학번 으로 이루어져 있습니다.</div>
        <div className="mt-5">
          -로그인 후에 ‘비밀번호 변경’ 페이지에서 비밀번호를 변경하실 수
          있습니다.
        </div>
        <div className="mt-5">
          -비밀번호를 잊어버렸을 경우, 로그인 하단의 ‘비밀번호 재설정’ 에서
          자신의 ID (=학번)을 입력하고 ‘인증 코드 발송’ 을 누르면 본인의 학교
          이메일 (@hufs.ac.kr)로 인증 코드가 전송됩니다. 해당 인증 코드를 입력한
          후에 비밀번호를 재설정 하실 수 있습니다.
        </div>
      </div>
    </div>
  );
};

export default Notice;
