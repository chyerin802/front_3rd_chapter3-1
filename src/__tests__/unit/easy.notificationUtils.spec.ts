import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

describe('getUpcomingEvents', () => {
  const baseEvent: Event = {
    id: '1',
    title: '회의',
    description: '설명',
    location: '회의실',
    date: '2024-07-01',
    startTime: '14:00',
    endTime: '15:00',
    category: 'meeting',
    repeat: {
      type: 'none',
      interval: 1,
    },
    notificationTime: 30, // 30분 전에 알림
  };

  const events: Event[] = [
    baseEvent,
    {
      ...baseEvent,
      id: '2',
      startTime: '15:00',
      endTime: '16:00',
      notificationTime: 10, // 10분 전에 알림
    },
  ];

  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    // 이벤트 시작 30분 전 시점
    const now = new Date('2024-07-01T13:30:00');
    const upcomingEvents = getUpcomingEvents(events, now, []);

    expect(upcomingEvents).toHaveLength(1);
    expect(upcomingEvents[0].id).toBe('1');
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const now = new Date('2024-07-01T13:30:00');
    const notifiedEvents = ['1']; // id가 1인 이벤트는 이미 알림이 갔음

    const upcomingEvents = getUpcomingEvents(events, now, notifiedEvents);
    expect(upcomingEvents).toHaveLength(0);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    // 이벤트 시작 40분 전 시점 (알림 시간 30분보다 이름)
    const now = new Date('2024-07-01T13:20:00');
    const upcomingEvents = getUpcomingEvents(events, now, []);

    expect(upcomingEvents).toHaveLength(0);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    // 이벤트 시작 시간 이후
    const now = new Date('2024-07-01T14:01:00');
    const upcomingEvents = getUpcomingEvents(events, now, []);

    expect(upcomingEvents).toHaveLength(0);
  });

  it('여러 이벤트의 알림 시간이 동시에 도래한 경우 모두 반환한다', () => {
    const multipleEvents: Event[] = [
      {
        ...baseEvent,
        startTime: '14:00',
        notificationTime: 20,
      },
      {
        ...baseEvent,
        id: '2',
        startTime: '14:10',
        notificationTime: 30,
      },
    ];

    // 첫 번째 이벤트 시작 20분 전, 두 번째 이벤트 시작 30분 전 시점
    const now = new Date('2024-07-01T13:40:00');
    const upcomingEvents = getUpcomingEvents(multipleEvents, now, []);

    expect(upcomingEvents).toHaveLength(2);
    expect(upcomingEvents.map((e) => e.id)).toEqual(['1', '2']);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const event: Event = {
      id: '1',
      title: '중요 회의',
      description: '설명',
      location: '회의실',
      date: '2024-07-01',
      startTime: '14:00',
      endTime: '15:00',
      category: 'meeting',
      repeat: {
        type: 'none',
        interval: 1,
      },
      notificationTime: 30,
    };

    const message = createNotificationMessage(event);
    expect(message).toBe('30분 후 중요 회의 일정이 시작됩니다.');
  });
});
