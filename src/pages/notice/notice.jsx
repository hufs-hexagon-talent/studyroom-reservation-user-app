import React from 'react';

const Notice = () => {
  return (
    <div className="ml-10 mr-10">
      <div className="font-bold mt-10 text-2xl text-center">
        컴퓨터공학부 세미나실 이용 규칙 및 예약 주의 사항
      </div>
      <div className="font-bold mt-10 text-xl">이용 규칙 :</div>
      <div className="mt-8 ml-5">
        <div>
          1. 운영시간은 오전 8시부터 밤 10시까지 입니다. 퇴실 시간을 정확히
          지켜주시기 바랍니다.
        </div>
        <div className="mt-5">
          2. 음료를 제외한 음식 섭취는 엄격하게 금지합니다. 적발 시 해당 학생의
          학부 공간 사용이 (컴퓨터공학부 학부장 명의로) 제한 됩니다.
        </div>
        <div className="mt-5">
          3. 함께 사용하는 공간 이므로 깨끗하게 사용해주시고 공공 에티켓을 지켜
          주시기 바랍니다. 그렇지 않은 경우에는 이후 학부 공간 사용을 제한할
          수도 있습니다.
        </div>
      </div>
      <div className="font-bold mt-10 text-xl">주의 사항 :</div>
      <div className="mt-8 ml-5">
        <div>1. 세미나실을 예약 가능한 시간은 2시간으로 제한됩니다.</div>
        <div className="mt-5">
          2. 한 사람 당 하루에 2번까지 세미나실 예약을 할 수 있습니다.
        </div>
        <div className="mt-5">
          3. 예약을 취소하고 싶다면 `내 신청 현황` 에 가서 예약 취소를 할 수
          있습니다.
        </div>
        <div className="mt-5 mb-20">
          4. 예약 취소 없이 세미나실을 방문하지 않을 경우가{' '}
          <span className="text-red-500">
            3번이 초과될 시에는 1년간 세미나실 예약이 제한
          </span>
          되니 유념하시기 바랍니다.
        </div>
      </div>
    </div>
  );
};

export default Notice;
