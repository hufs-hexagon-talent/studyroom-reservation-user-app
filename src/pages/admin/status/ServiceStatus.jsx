import React from 'react';

import {
  STATUS_PAGE_URL,
  summarizeStatus,
  useServiceStatus,
} from '../../../api/serviceStatus.api';

const DOT_CLASS = {
  up: 'bg-green-500',
  warn: 'bg-yellow-400',
  down: 'bg-red-500',
  unknown: 'bg-gray-300',
};

const DAY_CLASS = {
  up: 'bg-green-500',
  warn: 'bg-yellow-400',
  down: 'bg-red-500',
  none: 'bg-gray-200',
};

const formatRatio = ratio =>
  typeof ratio === 'number' ? `${ratio.toFixed(2)}%` : '-';

const formatDayTooltip = day => {
  if (day.ratio === null) return `${day.date} 감시 전`;
  return `${day.date} ${day.ratio.toFixed(2)}%`;
};

const StatusPageLink = () => (
  <a
    href={STATUS_PAGE_URL}
    target="_blank"
    rel="noreferrer"
    className="text-sm text-blue-600 underline">
    UptimeRobot 상태 페이지 열기
  </a>
);

const MonitorCard = ({ monitor }) => (
  <div className="bg-white shadow-md rounded-2xl p-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <span
          className={`mr-2 inline-block h-3 w-3 shrink-0 rounded-full ${
            monitor.up ? DOT_CLASS.up : DOT_CLASS.down
          }`}
        />
        <span className="font-semibold text-gray-700">{monitor.name}</span>
      </div>
      <span className="text-sm text-gray-500">
        {monitor.up ? '정상' : '정상 아님'}
      </span>
    </div>

    <div className="mt-4 flex gap-x-8">
      <div>
        <div className="text-gray-500 text-sm">최근 30일 가동률</div>
        <div className="text-xl font-bold">{formatRatio(monitor.ratio30d)}</div>
      </div>
      <div>
        <div className="text-gray-500 text-sm">최근 90일 가동률</div>
        <div className="text-xl font-bold">{formatRatio(monitor.ratio90d)}</div>
      </div>
    </div>

    {monitor.days.length > 0 && (
      <div className="mt-4">
        <div className="flex h-8 items-stretch gap-px">
          {monitor.days.map(day => (
            <div
              key={day.date}
              title={formatDayTooltip(day)}
              className={`flex-1 rounded-sm ${DAY_CLASS[day.level]}`}
            />
          ))}
        </div>
        <div className="mt-1 flex justify-between text-xs text-gray-400">
          <span>{monitor.days[0]?.date}</span>
          <span>{monitor.days[monitor.days.length - 1]?.date}</span>
        </div>
      </div>
    )}
  </div>
);

const ServiceStatus = () => {
  const { data, isPending, isError, isFetching, dataUpdatedAt, refetch } =
    useServiceStatus();

  const summary = isError
    ? { level: 'unknown', text: '상태 확인 불가' }
    : summarizeStatus(data);

  const level = isPending ? 'unknown' : summary.level;
  const text = isPending ? '확인 중' : summary.text;

  return (
    <div>
      <div className="font-bold text-3xl text-black p-8">서비스 상태</div>

      <div className="flex flex-col gap-y-6">
        <div className="bg-white shadow-md rounded-2xl p-8">
          <div className="flex items-center">
            <span
              className={`mr-3 inline-block h-4 w-4 shrink-0 rounded-full ${DOT_CLASS[level]}`}
            />
            <span className="text-2xl font-bold">{text}</span>
          </div>

          <div className="mt-4 flex items-center gap-x-4">
            <span className="text-sm text-gray-500">
              {dataUpdatedAt
                ? `마지막 확인 ${new Date(dataUpdatedAt).toLocaleTimeString(
                    'ko-KR',
                  )}`
                : '아직 확인 전'}
            </span>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="text-sm text-blue-600 underline disabled:text-gray-400 disabled:no-underline">
              {isFetching ? '확인 중' : '다시 확인'}
            </button>
            <StatusPageLink />
          </div>
        </div>

        {isError && (
          <div className="bg-white shadow-md rounded-2xl p-8">
            <div className="font-semibold text-gray-700">
              상태 정보를 가져오지 못했습니다
            </div>
            <div className="mt-2 text-sm text-gray-500">
              이 화면은 UptimeRobot 상태 페이지의 데이터를 그대로 받아 그립니다.
              그쪽 경로가 바뀌었거나 일시적으로 닿지 않는 상태입니다. 아래
              링크로 원래 상태 페이지에서 확인할 수 있습니다.
            </div>
            <div className="mt-4">
              <StatusPageLink />
            </div>
          </div>
        )}

        {isPending && (
          <div className="bg-white shadow-md rounded-2xl p-8 text-gray-500">
            상태를 확인하고 있습니다
          </div>
        )}

        {data?.monitors.map(monitor => (
          <MonitorCard key={monitor.id} monitor={monitor} />
        ))}
      </div>
    </div>
  );
};

export default ServiceStatus;
