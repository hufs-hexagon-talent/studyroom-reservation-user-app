// 문의 category/status enum 의 한글 라벨. backoffice 앱
// (src/pages/inquiries/InquiryDetailPage.tsx 의 CATEGORY_LABELS·STATUS_LABEL)과 문구를
// 그대로 공유한다. 여기를 바꾸면 그쪽도 바꾼다.
export const CATEGORY_LABELS = {
  ATTENDANCE: '출석·예약 이의',
  FACILITY: '시설·키오스크 고장',
  ETC: '기타',
};

export const STATUS_LABELS = {
  OPEN: '접수됨',
  RESOLVED: '처리완료',
};
