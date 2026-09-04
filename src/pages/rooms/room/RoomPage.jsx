import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker, { registerLocale } from 'react-datepicker';
import { Typography } from '@mui/material';
import {
  addMinutes,
  format,
  parse,
  isBefore,
  differenceInMinutes,
} from 'date-fns';

import Banner from '../../admin/banner/Banner';
import { ko } from 'date-fns/locale';
import { useSnackbar } from 'react-simple-snackbar';
import 'react-datepicker/dist/react-datepicker.css';
import { CalendarX2 } from 'lucide-react';
import { fetchDate } from '../../../api/policySchedule.api';
import { useReservations, useReserve } from '../../../api/reservation.api';
import useUrlQuery from '../../../hooks/useUrlQuery';
import useAuth from '../../../hooks/useAuth';
import { fetchBlockedPeriod, isAuthError } from '../../../api/user.api';
import {
  createTimeTable,
  getReserveErrorMessage,
  hasReservedSlotInRange,
  isOutsideOperationHours,
  maxMinutesExceededMessage,
  normalizeErrorCode,
  RESERVE_AUTH_FAILED_MESSAGE,
} from './reservationSlot';
import ReservationTimeTable from './ReservationTimeTable';
import { SLOT_INTERVAL_MINUTE } from './slotState';
import TimeTableLegend from './TimeTableLegend';
import SelectionBar from './SelectionBar';
import CustomButton from '../../../components/button/Button';
import { Button } from 'flowbite-react';
import { Modal } from 'flowbite-react';
import { durationLabel } from './durationLabel';
import { shortDateLabel } from './dateLabel';

// flowbite Modal 의 기본 테마(node_modules/flowbite-react/dist/esm/components/Modal/theme.mjs)에서
// 껍데기(반경·그림자·여백·구분선 제거·배경 블러)를 "타임레일" 디자인 값으로 바꾼다. 본문(크림 블록·
// 타임레일)은 순수 시각 요소라 테마가 아니라 아래 return 문의 JSX 로 직접 짠다.
//
// root — 오버레이(FloatingOverlay, data-testid="modal-overlay")
//   base 기본값: "fixed inset-x-0 top-0 z-50 h-screen overflow-y-auto overflow-x-hidden md:inset-0
//   md:h-full". 레이아웃 유틸은 그대로 두고 배경 그라데이션과 블러만 더한다 — 이건 오버레이
//   자신의 크기라 content.base 의 h-full 버그(아래)와는 무관하다. show.on 기본값
//   "flex bg-gray-900 bg-opacity-50 dark:bg-opacity-80" 은 배경을 root.base 의 그라데이션이
//   대신하므로 "flex" 만 남긴다(show.off "hidden" 은 Modal 이 !show 면 아예 null 을 반환해 쓰일
//   일이 없어 안 건드린다). sizes["2xl"] 기본값 "max-w-2xl" 은 d5.css 의
//   `[role="dialog"]{ max-width:26rem }` 값으로 바꾼다 — Modal 이 size prop 을 안 받으면 기본이
//   "2xl"이고, role="dialog" 는 floating-ui 의 useRole 이 content.base 래퍼(아래)에 얹는다.
//
// content.base — 기본값은 "relative h-full w-full p-4 md:h-auto" 인데, 여기서 h-full 과
//   md:h-auto 를 뺐다. dismissible 의 바깥 클릭은 floating-ui 가 document 에 리스너를 걸고
//   (@floating-ui/react 의 useDismiss) 누른 지점이 floating element 안인지로 판정하는데,
//   floating element 가 바로 이 래퍼다. h-full 이면 래퍼가 뷰포트를 다 덮어서 어두운 여백을
//   눌러도 "안쪽"으로 판정돼 모바일에서만 바깥 클릭이 안 먹었다. 래퍼를 내용 높이로 줄이면
//   해결된다. h-dvh·min-h-screen 등 다른 전체 높이 유틸로 되돌려도 같은 버그가 재발하니
//   손대지 말 것. 세로 가운데 정렬은 오버레이에 className 으로 준 flex items-center
//   justify-center 가 맡고, 내용이 길 때 스크롤은 오버레이의 overflow-y-auto(root.base)와
//   패널의 max-h-[90dvh]가 처리한다. 이 래퍼(role="dialog", tabindex="-1")는 아래 Modal 의
//   initialFocus 대상이라 열릴 때 포커스를 받는다 — 여기 focus:outline-none 을 더해 그때
//   테두리가 보이지 않게 한다.
//
// content.inner 기본값: "relative flex max-h-[90dvh] flex-col rounded-lg bg-white shadow
//   dark:bg-gray-700". 여기에 26px 반경·다층 그림자·overflow-hidden·antialiased 를 입힌다.
//   dark: 변형은 없앤다 — 이 디자인은 크림/남색 고정 팔레트라 OS 다크모드를 따라가면 깨진다
//   (d5.css 에도 다크 변형이 없다). w-full 은 보험이다. 패널의 부모(content.base)에 display
//   유틸이 없어 블록 박스라 auto 폭이 이미 부모를 채우므로 지금은 없어도 결과가 같다. 다만
//   <Modal> 에 style 이나 display 계열 className 을 주면 floating-ui 의 getFloatingProps 가 그
//   props 를 이 래퍼에도 얹어 flex 컨테이너로 만들고, 그러면 패널이 내용 크기로 줄어든다.
//   예전에 모달이 좁았던 원인이 그거였다(인라인 style={{display:'flex'}}). 그 실수가 반복돼도
//   폭은 유지되게 남겨 둔다.
//
// header — 기본값: "flex items-start justify-between rounded-t border-b p-5
//   dark:border-gray-600". 구분선·둥근 모서리를 없애고(패널이 이미 overflow-hidden 이라 자기
//   반경은 필요 없다) d5.css 의 padding/gap/정렬로 바꾼다.
//   title 기본값: "text-xl font-medium text-gray-900 dark:text-white" — Modal.Header 는
//   children 을 자기 <h3> 안에 넣는다(as 기본값 h3, ModalHeader.mjs). 그 안에 heading 을 또
//   쓰면 <h3><h2>..</h2></h3> 가 되어 heading 이 두 개로 잡히므로, 문구만 넘기고 모양은 계속
//   이 테마로 준다. 여기에 d5.css 의 크기·자간·색을 더한다.
//   close.base 기본값: "ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5
//   text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600
//   dark:hover:text-white" — 44px 탭 영역 안에 38px 크림 원반을 넣는다(padding 3px +
//   bg-clip-content 로 배경을 padding 안쪽에만 칠한다). 아이콘 색은 #3E4A58 로 바꾼다
//   (배경 #F1EEE9 대비 7.8:1 — WCAG 1.4.11 의 비텍스트 3:1 을 넉넉히 넘는다. 기존
//   text-gray-400 은 흰 배경에서 2.54:1 로 미달이었다). focus:outline-none +
//   focus-visible: 링으로 바꿔 모달이 열리며 이 버튼에 자동으로 가는 포커스가 마우스
//   사용자에게는 파란 기본 outline 으로 보이지 않고, 키보드 사용자에게는 여전히 보이게 한다.
//   close.icon 기본값 "h-5 w-5"(20px) 는 16px 로 줄인다(d5.css `[data-close] svg`).
//
// body 기본값: "flex-1 overflow-auto p-6"(popup: "pt-0", 안 씀). header 와 짝지어 4px 로
//   좁혀 제목과 카드 사이 간격을 d5.css 대로 맞춘다.
//
// footer 기본값: "flex items-center space-x-2 rounded-b border-gray-200 p-6
//   dark:border-gray-600"(popup: "border-t"). popup prop 을 안 주면 ModalFooter.mjs 의
//   `!popup && theme.popup` 이 항상 참이라 구분선이 기본으로 늘 붙는다 — 빈 문자열로 지운다.
export const reserveModalTheme = {
  root: {
    base: 'fixed inset-x-0 top-0 z-50 h-screen overflow-y-auto overflow-x-hidden md:inset-0 md:h-full bg-[image:radial-gradient(135%_105%_at_50%_0%,rgba(0,45,86,0.58)_0%,rgba(7,13,20,0.78)_100%)] backdrop-blur-[10px] backdrop-saturate-[115%]',
    show: {
      on: 'flex',
    },
    sizes: {
      '2xl': 'max-w-[26rem]',
    },
  },
  content: {
    base: 'relative w-full p-4 focus:outline-none',
    inner:
      'relative flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-[26px] bg-white antialiased shadow-[0_0_0_1px_rgba(0,45,86,0.07),0_2px_4px_rgba(9,20,32,0.06),0_16px_32px_-14px_rgba(9,20,32,0.24),0_44px_76px_-30px_rgba(0,45,86,0.45)]',
  },
  header: {
    base: 'flex items-center justify-between gap-[10px] rounded-none border-0 pl-5 pr-4 pt-[18px] pb-1',
    title:
      'min-w-0 text-[20px] font-bold leading-[26px] tracking-[-0.022em] text-[#101B26]',
    close: {
      base: 'ml-auto inline-flex h-[44px] w-[44px] flex-none min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-[#F1EEE9] bg-clip-content p-[3px] text-[#3E4A58] transition hover:bg-[#E4DFD8] hover:text-[#002D56] active:scale-[0.94] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#002D56]',
      icon: 'h-4 w-4',
    },
  },
  body: {
    base: 'flex-1 overflow-auto px-5 pb-0 pt-1',
  },
  footer: {
    base: 'flex items-center rounded-none border-0 px-5 pb-5 pt-4',
    popup: '',
  },
};

// 취소·예약 버튼(flowbite Button, node_modules/flowbite-react/dist/esm/components/Button/theme.mjs)
// 의 색은 theme.color 를 통째로 바꾼다 — className 으로 hover 색만 덧붙이면 theme.color.light/
// dark 기본 문자열에 남아 있는 dark:bg-gray-600 등 다크모드 클래스가 지워지지 않고 그대로
// 남는다(className 은 twMerge 순서상 맨 뒤라 같은 성질끼리만 덮어쓴다). 이 디자인은 다크모드가
// 없으므로 색 문자열 자체를 다크 변형 없이 새로 준다. 크기(50px·16px 반경 등)는 다크모드와
// 무관해 className 에 둔다.
// inner.base 기본값: "flex items-stretch transition-all duration-200" — 안쪽 <span> 을 버튼
// 정중앙에 놓도록 h-full/w-full/items-center/justify-center 로 바꾼다.
// size.md 기본값: "px-4 py-2 text-sm" — d5.css 의 padding:0, font-size:15px, font-weight:700,
// line-height:1 로 바꾼다(letter-spacing 은 바깥 button 클래스에 두면 상속되어 span 에도
// 적용된다).
const reserveActionButtonTheme = {
  color: {
    light:
      'border border-[#D9D4CD] bg-white text-[#39434F] shadow-none enabled:hover:border-[#CBC5BD] enabled:hover:bg-[#F7F5F2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#002D56]',
    dark: 'border-0 bg-[#002D56] text-white shadow-[0_8px_18px_-9px_rgba(0,45,86,0.85),inset_0_1px_0_rgba(255,255,255,0.1)] enabled:hover:bg-[#013C6E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#002D56]',
  },
  inner: {
    base: 'flex h-full w-full items-center justify-center',
  },
  size: {
    md: 'p-0 text-[15px] font-bold leading-none',
  },
};

const RoomPage = () => {
  // snackBar
  const [openSnackbar, closeSnackbar] = useSnackbar({
    position: 'top-right',
    style: {
      backgroundColor: '#FF3333',
    },
  });

  // react-simple-snackbar 는 매 렌더 새 함수를 돌려준다. 그대로 의존성에 넣으면
  // 아래 useCallback 들이 매번 새로 만들어져 표의 memo 가 무력해진다.
  const openSnackbarRef = useRef(openSnackbar);
  openSnackbarRef.current = openSnackbar;
  const showSnackbar = useCallback(message => {
    openSnackbarRef.current(message);
  }, []);

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedRangeFrom, setSelectedRangeFrom] = useState(null);
  const [selectedRangeTo, selSelectedRangeTo] = useState(null);
  // 조회 실패 시 null 로 두면 달력 제한이 풀려 학생이 날짜를 직접 고를 수 있다
  const [availableDate, setAvailableDate] = useState([]);
  const [earliestStartTime, setEarliestStartTime] = useState(null);
  const [startHour, setStartHour] = useState(null);
  const [startMinute, setStartMinute] = useState(null);
  const [endHour, setEndHour] = useState(null);
  const [endMinute, setEndMinute] = useState(null);
  const [maxReservationMinute, setMaxReservationMinute] = useState(null);
  const [openReserveModal, setOpenReserveModal] = useState(false);
  // 모달이 열리며 닫기 버튼에 자동 포커스가 가면 마우스 사용자에게도 focus-visible 링이
  // 보인다(flowbite Modal 이 FloatingFocusManager 로 initialFocus 대상에 포커스를 준다).
  // 대신 대화상자 컨테이너(role="dialog")를 initialFocus 로 지정한다 — WAI-ARIA APG 권장
  // 방식이고, 스크린리더는 aria-labelledby 로 제목을 읽으므로 안내가 끊기지 않는다.
  const reserveDialogRef = useRef(null);

  const navigate = useNavigate();
  const today = new Date();
  const departmentId = 1;

  const [selectedDate, setSelectedDate] = useUrlQuery(
    'date',
    format(new Date(), 'yyyy-MM-dd'),
  );

  const { mutateAsync: doReserve, isPending: isReserving } = useReserve();
  // isPending 은 다음 렌더에서야 true 가 되어 같은 tick 의 두 번째 클릭을 막지 못한다.
  // 실제 차단은 동기 래치가 한다.
  const reservingRef = useRef(false);
  const {
    data: reservationsByRooms,
    isPending: isReservationsPending,
    isError: isReservationsError,
    refetch: refetchReservations,
  } = useReservations({
    date: selectedDate,
    departmentId: departmentId,
  });
  const { loggedIn: isLoggedIn } = useAuth();

  const hasRooms =
    !isReservationsPending &&
    !isReservationsError &&
    reservationsByRooms?.length > 0;

  // 화면을 열어둔 채 시간이 지나면 지난 칸이 저절로 잠기도록 현재 시각을 갱신한다
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  // 선택해 둔 첫 칸이 시간이 지나 잠기면 선택을 푼다. 잠긴 칸을 예약하려다 실패하는 일을 막는다
  useEffect(() => {
    if (!selectedRangeFrom) return;
    if (now > addMinutes(selectedRangeFrom, 30)) {
      setSelectedRoom(null);
      setSelectedRangeFrom(null);
      selSelectedRangeTo(null);
    }
  }, [now, selectedRangeFrom]);

  useEffect(() => {
    if (reservationsByRooms && reservationsByRooms.length > 0) {
      const startTimes = reservationsByRooms?.map(
        room => room.operationStartTime,
      );
      // operationStartTime들에서 서로 비교해서 제일 작은 값이 earliest가 되게
      const earliestTime = startTimes.reduce((earliest, current) => {
        return earliest < current ? earliest : current;
      });
      setEarliestStartTime(earliestTime);

      // ':' 분리해서 시와 분으로 나눠서 저장
      const [startHour, startMinute] = earliestTime.split(':');
      setStartHour(parseInt(startHour, 10));
      setStartMinute(parseInt(startMinute, 10));

      const endTimes = reservationsByRooms?.map(room => room.operationEndTime);

      // operationEndTime들에서 서로 비교해서 제일 큰 값이 latest가 되게
      const latestTime = endTimes.reduce((latest, current) => {
        return latest > current ? latest : current;
      });
      // ':' 분리해서 시와 분으로 나눠서 저장
      const [endHour, endMinute] = latestTime.split(':');
      setEndHour(parseInt(endHour, 10));
      setEndMinute(parseInt(endMinute, 10));

      // eachMaxMinute들을 배열로 저장
      const eachMaxMinutes = reservationsByRooms?.map(
        partition => partition.eachMaxMinute,
      );
      // 배열들 중에 가장 큰 값을 maxEachMaxMinute으로 저장
      const maxEachMaxMinute = Math.max(...eachMaxMinutes);
      setMaxReservationMinute(maxEachMaxMinute);
    }
  }, [reservationsByRooms]);

  // 날짜 변경 시 기존 선택 초기화.
  // 예약 현황은 30초마다 다시 불러오므로 조회 결과가 아니라 날짜에만 반응해야
  // 남이 예약하는 순간 학생이 고르던 칸이 풀리지 않는다.
  useEffect(() => {
    setSelectedRoom(null);
    setSelectedRangeFrom(null);
    selSelectedRangeTo(null);
  }, [selectedDate]);

  // 계산해놓은 시간들을 timeTableConfig에 객체로 선언
  const timeTableConfig = {
    startTime: {
      hour: startHour,
      minute: startMinute,
    },
    endTime: {
      hour: endHour,
      minute: endMinute,
    },
    intervalMinute: SLOT_INTERVAL_MINUTE,
    maxReservationMinute: maxReservationMinute,
  };

  const times = useMemo(
    () =>
      startHour !== null && startMinute !== null
        ? createTimeTable(timeTableConfig)
        : [],
    [startHour, startMinute, endHour, endMinute, maxReservationMinute],
  );

  // date-picker에서 날짜 선택할 때마다 실행되는 함수
  const handleDateChange = date => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    // date picker에서 선택한 날짜 저장
    setSelectedDate(formattedDate);
  };

  // 슬롯의 상태 토글하는 함수
  const toggleSlot = useCallback(
    (partition, time) => {
      const targetStartAt = parse(
        `${selectedDate} ${time}`,
        'yyyy-MM-dd HH:mm',
        new Date(),
      );
      const targetEndAt = addMinutes(
        targetStartAt,
        timeTableConfig.intervalMinute,
      );

      const isFirstSelect = !selectedRangeFrom && !selectedRangeTo;
      // 예약 현황은 30초마다 다시 불러온다. 남이 예약하면 그 방 객체만 새 참조로 바뀌므로
      // 객체를 그대로 비교하면 고르던 칸이 연장되지 않고 새 선택으로 접힌다. 식별자로 비교한다.
      const isSameRoom =
        !!selectedRoom && selectedRoom.partitionId === partition.partitionId;
      const isDifferentRoom = !isSameRoom;

      const isSelectPast = isBefore(targetStartAt, selectedRangeFrom);
      const isOverDue =
        differenceInMinutes(targetEndAt, selectedRangeFrom) >
        selectedRoom?.eachMaxMinute;

      if (
        isSameRoom &&
        selectedRangeFrom?.getTime() === targetStartAt.getTime() &&
        selectedRangeTo?.getTime() === targetEndAt.getTime()
      ) {
        setSelectedRoom(null);
        setSelectedRangeFrom(null);
        selSelectedRangeTo(null);
        return;
      }

      // 새롭게 시간을 선택함
      if (isFirstSelect || isDifferentRoom || isSelectPast) {
        setSelectedRoom(partition);
        setSelectedRangeFrom(targetStartAt);
        selSelectedRangeTo(targetEndAt);
        return;
      }

      // 연장 범위 안에 남의 예약이 있으면 건너뛰지 않고 클릭한 칸부터 새로 선택한다.
      // 남의 예약을 가로지르는 범위는 연장이 될 수 없으니 최대 시간 검사보다 먼저 본다.
      if (
        hasReservedSlotInRange(
          partition.reservationTimeRanges,
          selectedRangeFrom,
          targetEndAt,
        )
      ) {
        setSelectedRoom(partition);
        setSelectedRangeFrom(targetStartAt);
        selSelectedRangeTo(targetEndAt);
        return;
      }

      // 최대 예약 시간을 넘는 연장은 안내만 하고 선택은 그대로 둔다
      if (isOverDue) {
        showSnackbar(maxMinutesExceededMessage(selectedRoom?.eachMaxMinute));
        return;
      }

      // 시간을 연장함
      setSelectedRoom(partition);
      selSelectedRangeTo(targetEndAt);
    },
    [
      selectedDate,
      setSelectedRangeFrom,
      selSelectedRangeTo,
      selectedRoom,
      selectedRangeFrom,
      selectedRangeTo,
      showSnackbar,
    ],
  );

  // 자신의 예약 생성
  const handleReservation = useCallback(
    async ({ roomPartitionId, startDateTime, endDateTime }) => {
      if (reservingRef.current) return;
      if (!isLoggedIn) {
        openSnackbar('로그인 후에 세미나실 예약이 가능합니다.');
        setTimeout(() => {
          closeSnackbar();
          navigate('/login');
        }, 5000);
        return;
      }
      if (!selectedRoom || !selectedRangeFrom || !selectedRangeTo) {
        openSnackbar(
          '원하는 호실과 시간대를 선택하고 예약하기 버튼을 눌러주세요',
        );
        setTimeout(() => {
          closeSnackbar();
        }, 5000);
        return;
      }
      // 요청이 끝나기 전에 다시 누르면 같은 예약이 두 번 전송된다
      if (reservingRef.current) return;
      reservingRef.current = true;
      try {
        await doReserve({
          roomPartitionId,
          startDateTime,
          endDateTime,
        });
        navigate('/check');
      } catch (error) {
        // 인터셉터가 세션 만료로 확정한 경우만 SessionExpiryWatcher 가 안내한다.
        // 그 밖의 인증 오류(403 권한 없음 등)는 인터셉터가 손대지 않으므로 여기서 안내한다.
        if (error?.sessionExpired) return;
        if (isAuthError(error)) {
          openSnackbar(RESERVE_AUTH_FAILED_MESSAGE);
          return;
        }

        const status = error?.response?.status;
        const code = normalizeErrorCode(error?.response?.data?.code);

        // 노쇼 차단이면 해제일을 조회해 문구에 넣는다. 조회에 실패해도 안내는 한다
        let blockedUntil = null;
        if (code === 'RESERVATION-004') {
          try {
            const blocked = await fetchBlockedPeriod();
            blockedUntil = blocked?.data?.endBlockedDate ?? null;
          } catch {
            blockedUntil = null;
          }
        }

        openSnackbar(getReserveErrorMessage(code, { blockedUntil }));

        // 업무 규칙에 걸린 선택은 그대로 두면 같은 실패가 반복된다
        if (status === 412) {
          setSelectedRoom(null);
          setSelectedRangeFrom(null);
          selSelectedRangeTo(null);
        }
      } finally {
        reservingRef.current = false;
      }
    },
    [doReserve, isLoggedIn, selectedRoom, selectedRangeFrom, selectedRangeTo],
  );

  const openReserveConfirm = () => {
    if (isReserving) return;
    if (selectedRoom && selectedRangeFrom && selectedRangeTo) {
      setOpenReserveModal(true);
    } else {
      showSnackbar('원하는 호실과 시간대를 선택해주세요.');
    }
  };

  // 최대 예약 시간에 부합하는지 계산하는 함수
  const handleCellClick = useCallback(
    (partition, timeIndex) => {
      const slotDateFrom = parse(
        `${selectedDate} ${times[timeIndex]}`,
        'yyyy-MM-dd HH:mm',
        new Date(),
      );

      // 갱신 주기 사이에 지나가 버린 칸이 눌리지 않게 클릭 시점으로 한 번 더 확인한다
      const clickedAt = new Date();
      if (clickedAt > addMinutes(slotDateFrom, SLOT_INTERVAL_MINUTE)) {
        setNow(clickedAt);
        return;
      }

      // 표의 공통 범위가 아니라 방별 운영시간으로 검사한다
      const isClosed = isOutsideOperationHours(
        format(slotDateFrom, 'HH:mm'),
        partition.operationStartTime,
        partition.operationEndTime,
      );

      if (!isClosed) {
        toggleSlot(partition, times[timeIndex]);
      }
    },
    [selectedDate, times, toggleSlot],
  );

  const handleSlotClick = useCallback(
    (room, timeIndex, state) => {
      if (!state.selectable) return;
      handleCellClick(room, timeIndex);
    },
    [handleCellClick],
  );

  // 매 렌더 새 객체를 만들면 표에 넘기는 selection prop 이 계속 바뀌어 표의 memo 가 무력해진다.
  const selection = useMemo(
    () =>
      selectedRoom && selectedRangeFrom && selectedRangeTo
        ? {
            partitionId: selectedRoom.partitionId,
            from: selectedRangeFrom,
            to: selectedRangeTo,
          }
        : null,
    [selectedRoom, selectedRangeFrom, selectedRangeTo],
  );

  // 예약 확인 모달의 타임레일에 쓰는 값. 순수 함수 결과라 useMemo 는 필요 없다.
  const modalDateLabel = shortDateLabel(selectedDate);
  const modalFromLabel = selectedRangeFrom
    ? format(selectedRangeFrom, 'HH:mm')
    : '';
  const modalToLabel = selectedRangeTo ? format(selectedRangeTo, 'HH:mm') : '';
  const modalDurationText =
    selectedRangeFrom && selectedRangeTo
      ? durationLabel(differenceInMinutes(selectedRangeTo, selectedRangeFrom))
      : '';
  // 타임레일은 시각 표현이라 시작/종료 라벨과 점선이 스크린리더에 조각으로 읽힌다.
  // 블록 전체를 한 문장으로 읽도록 aria-label 을 만든다.
  const modalTimeAriaLabel =
    modalFromLabel && modalToLabel
      ? `${modalDateLabel} ${modalFromLabel}부터 ${modalToLabel}까지${
          modalDurationText ? `, ${modalDurationText}` : ''
        }`
      : '';

  // date-picker 설정
  registerLocale('ko', ko);

  // 현재로부터 예약 가능한 방들의 날짜 목록 가져오기
  useEffect(() => {
    const getDate = async () => {
      try {
        const dates = await fetchDate(departmentId);
        setAvailableDate(dates);
      } catch {
        // 목록이 비어 있으면 달력의 모든 날짜가 잠기므로 제한을 풀고 안내한다
        setAvailableDate(null);
        openSnackbar(
          '예약 가능한 날짜를 불러오지 못했습니다. 달력에서 날짜를 직접 골라 주세요.',
        );
      }
    };
    getDate();
  }, []);

  return (
    <>
      <div id="container">
        <div id="head-container">
          <Typography
            marginTop="50px"
            variant="h5"
            fontWeight={450}
            component="div"
            align="center">
            일자별 세미나실 예약 현황
          </Typography>
          <div
            id="text"
            className="mt-5 mx-3 justify-center text-center break-keep"
            style={{ color: '#9D9FA2' }}>
            아래 예약 현황의 예약가능 시간을 선택하면 해당 세미나실을 예약하여
            사용할 수 있습니다.
          </div>
          {/* 배너 */}
          <Banner />
          {/* date-picker 부분 */}
          <div className="flex justify-center">
            <div id="datepicker-container">
              <DatePicker
                id="date"
                className={'text-center flex'}
                selected={selectedDate}
                locale={ko}
                minDate={today}
                includeDates={availableDate}
                onChange={handleDateChange}
                dateFormat="yyyy년 MM월 dd일"
                showIcon
              />
            </div>
          </div>
        </div>
        {hasRooms && <TimeTableLegend />}
        {/* timeTable 시작 */}
        {isReservationsPending && (
          <div className="text-center mx-8 md:mx-12 lg:mx-96 py-12 my-12 rounded-lg bg-gray-100 text-gray-900">
            예약 현황을 불러오는 중입니다.
          </div>
        )}
        {!isReservationsPending && isReservationsError && (
          <div className="text-center mx-8 md:mx-12 lg:mx-96 py-12 my-12 rounded-lg bg-gray-100 text-gray-900">
            예약 현황을 불러오지 못했습니다.
            <div className="mt-4 flex justify-center">
              <Button
                size="sm"
                color="dark"
                onClick={() => refetchReservations()}>
                다시 시도
              </Button>
            </div>
          </div>
        )}
        {hasRooms && times.length > 0 && (
          <div>
            <ReservationTimeTable
              rooms={reservationsByRooms}
              times={times}
              selectedDate={selectedDate}
              now={now}
              selection={selection}
              onCellClick={handleSlotClick}
            />
          </div>
        )}
        {!isReservationsPending && !isReservationsError && !hasRooms && (
          <div className="text-center mx-8 md:mx-12 lg:mx-96 py-12 my-12 rounded-lg bg-gray-100 text-gray-900">
            선택한 날짜에는 예약할 수 있는 방이 없습니다. <br />
            다른 날짜를 선택해 주세요.
          </div>
        )}
        {hasRooms && (
          <div className="hidden p-10 md:flex md:justify-end">
            <CustomButton
              disabled={isReserving}
              onClick={openReserveConfirm}
              text="예약하기"
            />
          </div>
        )}
        {hasRooms && (
          <SelectionBar
            roomLabel={
              selectedRoom
                ? `${selectedRoom.roomName}-${selectedRoom.partitionNumber}`
                : null
            }
            from={selectedRangeFrom}
            to={selectedRangeTo}
            disabled={isReserving}
            onReserve={openReserveConfirm}
          />
        )}
      </div>

      {/* 선택된 예약 정보 모달 — "타임레일" 디자인. 크림 블록·시간 레일은 시각 표현이라
          시작/종료 라벨과 점선 조각이 아니라 이 블록 전체를 한 문장 aria-label 로 읽는다
          (modalTimeAriaLabel, 위에서 계산). */}
      <Modal
        ref={reserveDialogRef}
        initialFocus={reserveDialogRef}
        className="flex items-center justify-center"
        theme={reserveModalTheme}
        dismissible
        show={openReserveModal}
        onClose={() => setOpenReserveModal(false)}>
        <Modal.Header>이대로 예약할까요?</Modal.Header>
        <Modal.Body>
          <div className="flex flex-col gap-[13px] rounded-[18px] bg-[#F1EEE9] px-4 pb-[17px] pt-[15px] shadow-[inset_0_0_0_1px_rgba(0,45,86,0.06)]">
            <div className="flex min-w-0 items-center justify-between gap-[10px]">
              <span className="whitespace-nowrap text-[13.5px] font-semibold leading-[1.2] tracking-[-0.012em] text-[#566072]">
                {modalDateLabel}
              </span>
              <span className="flex-none whitespace-nowrap rounded-full border border-[rgba(0,45,86,0.14)] bg-white px-[11px] py-[6px] text-[14px] font-bold leading-none tracking-[-0.012em] text-[#002D56] shadow-[0_1px_1px_rgba(0,45,86,0.05)]">
                {selectedRoom?.roomName}-{selectedRoom?.partitionNumber}
              </span>
            </div>

            <div
              role="group"
              aria-label={modalTimeAriaLabel}
              className="flex items-end gap-2 pt-px">
              <div
                aria-hidden="true"
                className="flex min-w-0 flex-none flex-col gap-[3px]">
                <span className="h-[14px] text-[11px] font-bold leading-[14px] tracking-[0.09em] text-[#566072]">
                  시작
                </span>
                <span className="h-7 text-[25px] font-extrabold leading-7 tracking-[-0.03em] tabular-nums text-[#002D56] max-[359px]:text-[22px]">
                  {modalFromLabel}
                </span>
              </div>

              <div
                aria-hidden="true"
                className="relative flex h-7 min-w-[62px] flex-1 items-center justify-center self-end">
                <span
                  className="absolute left-0 right-0 top-1/2 -mt-px h-[2px] rounded-[2px]"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(90deg, rgba(0,45,86,.34) 0 5px, rgba(0,45,86,0) 5px 9px)',
                  }}
                />
                {modalDurationText && (
                  <span className="relative z-[1] mx-[10px] whitespace-nowrap rounded-full border border-[rgba(0,45,86,0.14)] bg-white px-[10px] py-[6px] text-[12px] font-extrabold leading-none tracking-[-0.01em] text-[#002D56] shadow-[0_1px_2px_rgba(0,45,86,0.07)] max-[359px]:mx-[6px] max-[359px]:px-[8px] max-[359px]:py-[5px]">
                    {modalDurationText}
                  </span>
                )}
              </div>

              <div
                aria-hidden="true"
                className="flex min-w-0 flex-none flex-col items-end gap-[3px] text-right">
                <span className="h-[14px] text-[11px] font-bold leading-[14px] tracking-[0.09em] text-[#566072]">
                  종료
                </span>
                <span className="h-7 text-[25px] font-extrabold leading-7 tracking-[-0.03em] tabular-nums text-[#002D56] max-[359px]:text-[22px]">
                  {modalToLabel}
                </span>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="flex w-full gap-2.5">
            <Button
              color="light"
              theme={reserveActionButtonTheme}
              className="h-[50px] min-h-[50px] w-[104px] flex-none rounded-[16px] p-0 tracking-[-0.012em] transition duration-150 enabled:active:translate-y-px enabled:active:scale-[0.995] max-[359px]:w-[88px]"
              onClick={() => {
                setOpenReserveModal(false);
              }}>
              취소
            </Button>
            <Button
              disabled={isReserving}
              theme={reserveActionButtonTheme}
              onClick={() => {
                if (isReserving) return;
                handleReservation({
                  roomPartitionId: selectedRoom
                    ? selectedRoom.partitionId
                    : null,
                  startDateTime: selectedRangeFrom,
                  endDateTime: selectedRangeTo,
                });
                setOpenReserveModal(false);
              }}
              color="dark"
              className="h-[50px] min-h-[50px] flex-1 rounded-[16px] p-0 tracking-[-0.012em] transition duration-150 enabled:active:translate-y-px enabled:active:scale-[0.995]">
              예약
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default RoomPage;
