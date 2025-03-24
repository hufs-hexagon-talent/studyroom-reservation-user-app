import React from 'react';
import Github from '../../assets/icons/github.png';
import requestNotion from '../../assets/icons/request_notion.png';
import FeedBackNotion from '../../assets/icons/feedback_notion.png';

const TopText = () => {
  const githubUrl = 'https://github.com/orgs/hufs-hexagon-talent/repositories';
  const notionRequestUrl =
    'https://www.notion.so/hwangbbang/1ac6628bcfd1807cb572f099d3ca2b26?v=1ac6628bcfd1800aae28000caf0d2bc7&pvs=4';
  const notionFeedbackUrl =
    'https://www.notion.so/hwangbbang/1ac6628bcfd1803d9555d42436d92b6e?v=1ac6628bcfd18060ba42000cf955334e&pvs=4';
  return (
    <>
      <div className="flex justify-between font-bold text-left pt-10 px-8 mb-5">
        {/* 제목 */}
        <h3 className="text-3xl">
          <div className="flex flex-row">
            <div>관리자 페이지.</div>
            <div className="text-gray-600">세미나실 예약 시스템을</div>
          </div>
          <div className="text-gray-600">지금 바로 운영해보세요.</div>
        </h3>
        {/* 이동하기 */}
        <div className="flex flex-col gap-y-2">
          <div className="flex flex-row">
            <img className="w-8 h-8 mr-3" src={Github} />
            <div>
              <div className="mb-1 text-xs">
                Github Repository로 가고 싶다면 ?
              </div>
              <div
                onClick={() => window.open(githubUrl, '_blank')}
                className="text-blue-500 text-xs font-medium cursor-pointer">
                Github로 이동하기 &gt;
              </div>
            </div>
          </div>
          <div className="flex flex-row items-center cursor-pointer">
            <img className="w-8 h-8 mr-3" src={requestNotion} />
            <div className="flex flex-row items-center">
              <div
                onClick={() => window.open(notionRequestUrl, '_blank')}
                className="text-xs">
                예약 정정 요청 응답을 확인해보세요
              </div>
              <div className="text-sm ml-1 text-blue-600">↗</div>
            </div>
          </div>
          <div className="flex flex-row justify-center items-center cursor-pointer">
            <img className="w-8 h-8 mr-3" src={FeedBackNotion} />
            <div className="flex flex-row items-center">
              <div
                onClick={() => window.open(notionFeedbackUrl, '_blank')}
                className="text-xs">
                사용자들이 제출한 피드백을 읽어보세요
              </div>
              <div className="text-sm ml-1 text-blue-600">↗</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TopText;
