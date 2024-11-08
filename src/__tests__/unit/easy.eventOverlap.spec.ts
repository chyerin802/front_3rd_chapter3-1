import { Event, EventForm } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
} from '../../utils/eventOverlap';

describe('convertEventToDateRange', () => {
  const sampleEventForm: EventForm = {
    title: '테스트 이벤트',
    description: '설명',
    location: '장소',
    date: '2024-07-01',
    startTime: '14:30',
    endTime: '15:30',
    category: 'meeting',
    repeat: {
      type: 'none',
      interval: 1,
    },
    notificationTime: 30,
  };

  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const result = convertEventToDateRange(sampleEventForm);

    expect(result.start).toBeInstanceOf(Date);
    expect(result.end).toBeInstanceOf(Date);
    expect(result.start.getHours()).toBe(14);
    expect(result.start.getMinutes()).toBe(30);
    expect(result.end.getHours()).toBe(15);
    expect(result.end.getMinutes()).toBe(30);
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const invalidDateEvent: EventForm = {
      ...sampleEventForm,
      date: '2024-13-01', // 잘못된 월
    };

    const result = convertEventToDateRange(invalidDateEvent);
    expect(result.start.toString()).toBe('Invalid Date');
    expect(result.end.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const invalidTimeEvent: EventForm = {
      ...sampleEventForm,
      startTime: '25:00', // 잘못된 시간
    };

    const result = convertEventToDateRange(invalidTimeEvent);
    expect(result.start.toString()).toBe('Invalid Date');
  });
});

describe('isOverlapping', () => {
  const event1: EventForm = {
    title: '이벤트 1',
    description: '설명 1',
    location: '장소 1',
    date: '2024-07-01',
    startTime: '14:00',
    endTime: '16:00',
    category: 'meeting',
    repeat: {
      type: 'none',
      interval: 1,
    },
    notificationTime: 30,
  };

  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const overlappingEvent: EventForm = {
      ...event1,
      startTime: '15:00',
      endTime: '17:00',
    };

    expect(isOverlapping(event1, overlappingEvent)).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const nonOverlappingEvent: EventForm = {
      ...event1,
      startTime: '16:30',
      endTime: '17:30',
    };

    expect(isOverlapping(event1, nonOverlappingEvent)).toBe(false);
  });

  it('한 이벤트가 다른 이벤트를 완전히 포함할 때 true를 반환한다', () => {
    const containedEvent: EventForm = {
      ...event1,
      startTime: '14:30',
      endTime: '15:30',
    };

    expect(isOverlapping(event1, containedEvent)).toBe(true);
  });

  it('이벤트들이 정확히 같은 시간에 시작하고 끝날 때 true를 반환한다', () => {
    const sameTimeEvent: EventForm = { ...event1 };
    expect(isOverlapping(event1, sameTimeEvent)).toBe(true);
  });
});

describe('findOverlappingEvents', () => {
  const baseEvent: Event = {
    id: '1',
    title: '기준 이벤트',
    description: '설명',
    location: '장소',
    date: '2024-07-01',
    startTime: '14:00',
    endTime: '16:00',
    category: 'meeting',
    repeat: {
      type: 'none',
      interval: 1,
    },
    notificationTime: 30,
  };

  const existingEvents: Event[] = [
    baseEvent,
    {
      ...baseEvent,
      id: '2',
      startTime: '12:00',
      endTime: '14:00',
    },
    {
      ...baseEvent,
      id: '3',
      startTime: '16:00',
      endTime: '18:00',
    },
  ];

  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const newEvent: EventForm = {
      title: '새 이벤트',
      description: '설명',
      location: '장소',
      date: '2024-07-01',
      startTime: '13:30',
      endTime: '15:30',
      category: 'meeting',
      repeat: {
        type: 'none',
        interval: 1,
      },
      notificationTime: 30,
    };

    const overlapping = findOverlappingEvents(newEvent, existingEvents);
    expect(overlapping).toHaveLength(2);
    expect(overlapping.map((e) => e.id)).toEqual(['1', '2']);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const nonOverlappingEvent: EventForm = {
      ...baseEvent,
      startTime: '18:00',
      endTime: '19:00',
    };

    const overlapping = findOverlappingEvents(nonOverlappingEvent, existingEvents);
    expect(overlapping).toHaveLength(0);
  });

  it('이미 존재하는 이벤트를 수정할 때 자기 자신을 제외한다', () => {
    const updatedEvent: Event = {
      ...baseEvent,
      id: '2',
      startTime: '13:30',
      endTime: '15:30',
    };

    const overlapping = findOverlappingEvents(updatedEvent, existingEvents);
    expect(overlapping).toHaveLength(1);
    expect(overlapping[0].id).toBe('1');
  });
});
