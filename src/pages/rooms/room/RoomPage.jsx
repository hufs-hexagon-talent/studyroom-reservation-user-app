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

// flowbite Modal 의 기본 테마(node_modules/flowbite-react 의 Modal/theme.mjs)에서 두 가지를
// 바꾼다.
//
// 1) content.base — 기본값은 "relative h-full w-full p-4 md:h-auto" 인데, 여기서 h-full 과
//    md:h-auto 를 뺐다. dismissible 의 바깥 클릭은 floating-ui 가 document 에 리스너를 걸고
//    (@floating-ui/react 의 useDismiss) 누른 지점이 floating element 안인지로 판정하는데,
//    floating element 가 바로 이 래퍼다. h-full 이면 래퍼가 뷰포트를 다 덮어서 어두운 여백을
//    눌러도 "안쪽"으로 판정돼 모바일에서만 바깥 클릭이 안 먹었다. 래퍼를 내용 높이로 줄이면
//    해결된다. 세로 가운데 정렬은 오버레이에 className 으로 준 flex items-center
//    justify-center 가 맡고, 내용이 길 때 스크롤은 오버레이의 overflow-y-auto(root.base)와
//    패널의 max-h-[90dvh]가 처리한다.
//
// 2) header.title — Modal.Header 는 children 을 자기 <h3> 안에 넣는다(as 기본값 h3,
//    ModalHeader.mjs). 그래서 여기에 <h2> 를 넣으면 <h3><h2>..</h2></h3> 가 되어
//    heading 이 두 개로 잡힌다. 문구는 그대로 넘기고 모양만 이 테마로 준다.
//
// 3) header.close — 닫기 버튼 기본이 32px 라 탭 영역 44px 를 채우도록 키웠다.
//
// content.inner 의 w-full 은 보험이다. 패널의 부모(content.base)에 display 유틸이 없어
// 블록 박스라 auto 폭이 이미 부모를 채우므로 지금은 없어도 결과가 같다. 다만 <Modal> 에
// style 이나 display 계열 className 을 주면 floating-ui 의 getFloatingProps 가 그 props 를
// 이 래퍼에도 얹어 flex 컨테이너로 만들고, 그러면 패널이 내용 크기로 줄어든다. 예전에
// 모달이 좁았던 원인이 그거였다(인라인 style={{display:'flex'}}). 그 실수가 반복돼도
// 폭은 유지되게 남겨 둔다.
export const reserveModalTheme = {
  content: {
    base: 'relative w-full p-4',
    inner:
      'relative flex max-h-[90dvh] w-full flex-col rounded-lg bg-white shadow dark:bg-gray-700',
  },
  header: {
    title: 'text-xl font-semibold text-gray-900 dark:text-white',
    close: {
      base: 'ml-auto inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white',
    },
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
    intervalMinute: 30,
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

      {/* 선택된 예약 정보 모달 */}
      <Modal
        className="flex items-center justify-center"
        theme={reserveModalTheme}
        dismissible
        show={openReserveModal}
        onClose={() => setOpenReserveModal(false)}>
        <Modal.Header>현재 선택한 예약 정보</Modal.Header>
        <Modal.Body>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900">
              {selectedRoom?.roomName}-{selectedRoom?.partitionNumber}
            </p>
            <p className="text-sm text-gray-500">
              {shortDateLabel(selectedDate)}
            </p>
            <p className="flex items-baseline gap-2 pt-2">
              <span className="text-xl font-bold text-gray-900">
                {selectedRangeFrom && format(selectedRangeFrom, 'HH:mm')} ~{' '}
                {selectedRangeTo && format(selectedRangeTo, 'HH:mm')}
              </span>
              <span className="text-sm text-gray-500">
                {selectedRangeFrom &&
                  selectedRangeTo &&
                  durationLabel(
                    differenceInMinutes(selectedRangeTo, selectedRangeFrom),
                  )}
              </span>
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="flex w-full gap-2">
            <Button
              color="light"
              className="min-h-[44px]"
              onClick={() => {
                setOpenReserveModal(false);
              }}>
              취소
            </Button>
            <Button
              disabled={isReserving}
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
              className="min-h-[44px] flex-1">
              예약
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default RoomPage;
