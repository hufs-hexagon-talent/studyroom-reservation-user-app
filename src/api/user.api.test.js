import axios from 'axios';

import { apiClient } from './client';
import { fetchBlockedPeriod } from './user.api';

jest.mock('./session', () => ({ handleSessionExpired: jest.fn() }));
jest.mock('../config', () => ({ API_URL: 'http://api.test' }));

const httpError = (config, status, data) =>
  new axios.AxiosError(`HTTP ${status}`, 'ERR_BAD_REQUEST', config, null, {
    status,
    statusText: '',
    headers: {},
    config,
    data,
  });

const ok = (config, data) => ({
  status: 200,
  statusText: 'OK',
  headers: {},
  config,
  data,
});

describe('fetchBlockedPeriod', () => {
  test('제한 기간이 있으면 응답 본문을 그대로 돌려준다', async () => {
    const body = {
      isSuccess: true,
      data: { startBlockedDate: '2026-08-01', endBlockedDate: '2026-09-01' },
    };
    apiClient.defaults.adapter = jest.fn(async config => ok(config, body));

    await expect(fetchBlockedPeriod()).resolves.toEqual(body);
  });

  test('제한 상태가 아니면(USER-009) 오류가 아니라 null 을 돌려준다', async () => {
    apiClient.defaults.adapter = jest.fn(async config => {
      throw httpError(config, 400, {
        isSuccess: false,
        code: 'USER-009',
        message: '현재 유저는 블락 상태가 아닙니다.',
      });
    });

    await expect(fetchBlockedPeriod()).resolves.toBeNull();
  });

  test('그 밖의 실패는 그대로 던져 화면이 조회 실패를 알 수 있게 한다', async () => {
    apiClient.defaults.adapter = jest.fn(async config => {
      throw httpError(config, 502, { code: 'SYS-001', message: '서버 오류' });
    });

    const error = await fetchBlockedPeriod().catch(e => e);
    expect(error.response.status).toBe(502);
  });
});
