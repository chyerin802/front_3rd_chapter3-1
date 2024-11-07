import { Event } from '../../types';
import { filterEventsByDay, getFilteredEvents } from '../../utils/eventUtils';

describe('filterEventsByDay', () => {
  const baseEvent: Event = {
    id: '1',
    title: '이벤트 1',
    description: '설명',
    location: '장소',
    date: '2024-07-01',
    startTime: '09:00',
    endTime: '10:00',
    category: 'meeting',
    repeat: {
      type: 'none',
      interval: 1,
    },
    notificationTime: 30,
  };

  const events: Event[] = [
    baseEvent,
    {
      ...baseEvent,
      id: '2',
      date: '2024-07-15',
    },
  ];

  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {
    const filtered = filterEventsByDay(events, 1);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('1');
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    const filtered = filterEventsByDay(events, 2);
    expect(filtered).toHaveLength(0);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    const filtered = filterEventsByDay(events, 0);
    expect(filtered).toHaveLength(0);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    const filtered = filterEventsByDay(events, 32);
    expect(filtered).toHaveLength(0);
  });
});

describe('getFilteredEvents', () => {
  const baseEvent: Event = {
    id: '1',
    title: '이벤트 1',
    description: '설명',
    location: '장소',
    date: '2024-07-01', // 월요일
    startTime: '09:00',
    endTime: '10:00',
    category: 'meeting',
    repeat: {
      type: 'none',
      interval: 1,
    },
    notificationTime: 30,
  };

  const events: Event[] = [
    baseEvent,
    {
      ...baseEvent,
      id: '2',
      title: '이벤트 2',
      description: '대문자 설명',
      date: '2024-07-03', // 수요일
    },
    {
      ...baseEvent,
      id: '3',
      title: 'MEETING',
      description: '대문자로 된 이벤트',
      date: '2024-07-15', // 다음 주
    },
  ];

  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const filtered = getFilteredEvents(events, '이벤트 2', new Date('2024-07-01'), 'month');
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('2');
  });

  it('주간 뷰에서 2024-07-01 주의 이벤트만 반환한다', () => {
    const filtered = getFilteredEvents(events, '', new Date('2024-07-01'), 'week');
    expect(filtered).toHaveLength(2);
    expect(filtered.map((e) => e.id)).toEqual(['1', '2']);
  });

  it('월간 뷰에서 2024년 7월의 모든 이벤트를 반환한다', () => {
    const filtered = getFilteredEvents(events, '', new Date('2024-07-01'), 'month');
    expect(filtered).toHaveLength(3);
    expect(filtered.map((e) => e.id)).toEqual(['1', '2', '3']);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const filtered = getFilteredEvents(events, '이벤트', new Date('2024-07-01'), 'week');
    expect(filtered).toHaveLength(2);
    expect(filtered.map((e) => e.id)).toEqual(['1', '2']);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const filtered = getFilteredEvents(events, '', new Date('2024-07-01'), 'month');
    expect(filtered).toHaveLength(3);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const upperCaseFiltered = getFilteredEvents(events, 'MEETING', new Date('2024-07-01'), 'month');
    expect(upperCaseFiltered).toHaveLength(1);
    expect(upperCaseFiltered[0].id).toBe('3');

    const lowerCaseFiltered = getFilteredEvents(events, 'meeting', new Date('2024-07-01'), 'month');
    expect(lowerCaseFiltered).toHaveLength(1);
    expect(lowerCaseFiltered[0].id).toBe('3');
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const boundaryEvents: Event[] = [
      {
        ...baseEvent,
        date: '2024-07-31', // 7월 마지막 날
      },
      {
        ...baseEvent,
        id: '2',
        date: '2024-08-01', // 8월 첫날
      },
    ];

    const julyFiltered = getFilteredEvents(boundaryEvents, '', new Date('2024-07-01'), 'month');
    expect(julyFiltered).toHaveLength(1);
    expect(julyFiltered[0].date).toBe('2024-07-31');

    const augustFiltered = getFilteredEvents(boundaryEvents, '', new Date('2024-08-01'), 'month');
    expect(augustFiltered).toHaveLength(1);
    expect(augustFiltered[0].date).toBe('2024-08-01');
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const filtered = getFilteredEvents([], '', new Date('2024-07-01'), 'month');
    expect(filtered).toHaveLength(0);
  });
});
