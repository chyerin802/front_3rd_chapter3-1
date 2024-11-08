import { act, renderHook } from '@testing-library/react';
import { beforeAll, afterAll, it, expect, describe, vi } from 'vitest';

import { useSearch } from '../../hooks/useSearch';
import { Event } from '../../types';

describe('useSearch', () => {
  const todayDate = new Date('2024-11-20');

  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(todayDate);
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  const events: Event[] = [
    {
      id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
      title: '팀 회의',
      date: '2024-11-20',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
    {
      id: '09702fb3-a478-40b3-905e-9ab3c8849dcd',
      title: '점심 약속',
      date: '2024-11-21',
      startTime: '12:30',
      endTime: '13:30',
      description: '동료와 점심 식사',
      location: '회사 근처 식당',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
    {
      id: 'da3ca408-836a-4d98-b67a-ca389d07552b',
      title: '프로젝트 마감',
      date: '2024-11-25',
      startTime: '09:00',
      endTime: '18:00',
      description: '분기별 프로젝트 마감',
      location: '사무실',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    },
  ];

  it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
    const { result } = renderHook(() => useSearch(events, todayDate, 'month'));

    expect(result.current.filteredEvents).toHaveLength(3);
  });

  it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
    const { result } = renderHook(() => useSearch(events, todayDate, 'month'));

    act(() => {
      result.current.setSearchTerm('회의');
    });

    expect(result.current.filteredEvents).toHaveLength(1);
    expect(result.current.filteredEvents[0].title).toBe('팀 회의');
  });

  it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
    const { result } = renderHook(() => useSearch(events, todayDate, 'month'));

    act(() => {
      result.current.setSearchTerm('사무실');
    });

    expect(result.current.filteredEvents).toHaveLength(1);
    expect(result.current.filteredEvents[0].title).toBe('프로젝트 마감');
  });

  it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
    const { result: monthResult } = renderHook(() => useSearch(events, todayDate, 'month'));
    expect(monthResult.current.filteredEvents).toHaveLength(3);

    const { result: weekResult } = renderHook(() => useSearch(events, todayDate, 'week'));
    expect(weekResult.current.filteredEvents).toHaveLength(2);
    expect(weekResult.current.filteredEvents.map((e) => e.title)).toEqual(['팀 회의', '점심 약속']);
  });

  it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
    const { result } = renderHook(() => useSearch(events, todayDate, 'month'));

    act(() => {
      result.current.setSearchTerm('회의');
    });
    expect(result.current.filteredEvents).toHaveLength(1);
    expect(result.current.filteredEvents[0].title).toBe('팀 회의');

    act(() => {
      result.current.setSearchTerm('점심');
    });
    expect(result.current.filteredEvents).toHaveLength(1);
    expect(result.current.filteredEvents[0].title).toBe('점심 약속');
  });
});
