import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import isIntersect from './helpers/isIntersect';

interface CalendarDay {
  day: number;
}

interface Event {
  date: number | null;
  startTime: number;
  duration: number;
  title: string;
  eventId: string;
}
// Here this array also could save in some mock DB
const days = ['Mon.', 'Tues.', 'Wed.', 'Thurs.', 'Fri.', 'Sat.', 'Sun.'];

// The app itself uses existing event from mock db
// user can interact with events, can schedule in some particular day if timeslot of the day is available
// also user can delete event or unschedule by dragging back from calendar to the events list
// I leave some comments please check them )
// in package.json there are some libraries that i planed to use, for example uuid or dayjs.

function App() {
  const [dates, setDates] = useState<CalendarDay[]>([]);
  const [scheduledEvents, setScheduledEvents] = useState<Event[]>([]);
  const [unscheduledEvents, setUnscheduledEvents] = useState<Event[]>([]);
  const [currentDragEvent, setCurrentDragEvent] = useState<Event | null>(null);
  // I'd like to create some separate  "requests" function to handle response errors and on success give the data
  useEffect(() => {
    fetch('mockDB/month.json')
      .then((res) => res.json())
      .then((res) => setDates(res));

    fetch('mockDB/events.json')
      .then((res) => res.json())
      .then((res) => {
        const scheduled = [];
        const unscheduled = [];
        for (let i = 0; i < res.length; i++) {
          if (res[i].date === null) {
            unscheduled.push(res[i]);
          } else {
            scheduled.push(res[i]);
          }
        }
        setScheduledEvents(scheduled);
        setUnscheduledEvents(unscheduled);
      });
  }, []);
  // this logic also could optimise, but it's work
  const onDropEventHandler = (day: number | null, events: Event[]) => {
    if (currentDragEvent) {
      let addEvent = true;
      events.forEach((event) => {
        if (
          isIntersect(
            currentDragEvent.startTime,
            currentDragEvent.duration,
            event.startTime,
            event.duration,
          )
        ) {
          addEvent = false;
        }
      });

      if (addEvent) {
        currentDragEvent.date = day;
        setScheduledEvents((state) => Array.from(new Set([...state, currentDragEvent])));
        setUnscheduledEvents((state) =>
          state.filter((event) => event.eventId !== currentDragEvent.eventId),
        );
      }
    }
  };

  const deleteEventHandler = (event: Event) => {
    setScheduledEvents((s) => s.filter((oldEvent) => oldEvent !== event));
  };
  return (
    <Wrapper>
      {/* If it was a real useful project I'd like to spend time to split components into small ones*/}
      <Events
        onDrop={(e) => {
          e.preventDefault();
          setUnscheduledEvents((state) =>
            currentDragEvent ? Array.from(new Set([...state, currentDragEvent])) : state,
          );
          setScheduledEvents((state) => state.filter((event) => event !== currentDragEvent));
        }}
        onDragOver={(e) => e.preventDefault()}
      >
        {unscheduledEvents.map((event) => {
          const time = `${event.startTime}:00 - ${event.startTime + event.duration}:00`;
          return (
            <div
              key={event.eventId}
              className="event"
              draggable
              onDragStart={() => setCurrentDragEvent(event)}
              onDragEnd={() => setCurrentDragEvent(null)}
            >
              {event.title}
              <p>{time}</p>
            </div>
          );
        })}
      </Events>
      <Calendar>
        {days.map((day) => (
          <div className="day" key={`day_name_${day}`}>
            {day}
          </div>
        ))}

        {dates.map((date) => {
          const eventsForToday = scheduledEvents.filter((event) => event.date === date.day);

          return (
            <div
              className="day"
              onDrop={(e) => {
                e.preventDefault();
                onDropEventHandler(date.day, eventsForToday);
              }}
              onDragOver={(e) => e.preventDefault()}
              key={`calendar_day_${date.day}`}
            >
              {date.day}
              {eventsForToday.map((event) => {
                return (
                  <p key={event.eventId} draggable>
                    {event?.title}
                    <button onClick={() => deleteEventHandler(event)}>x</button>
                  </p>
                );
              })}
            </div>
          );
        })}
      </Calendar>
    </Wrapper>
  );
}

export default App;

//
const Calendar = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border: 1px solid #bbbbbb;

  .day {
    height: 30px;
    border-right: 1px solid #bbbbbb;
    padding-top: 10px;
    border-bottom: 1px solid #bbbbbb;
    :nth-child(7n + 0) {
      border-right: none;
    }
    :nth-child(n + 36) {
      border-bottom: none;
    }
    :nth-child(n + 8) {
      height: 80px;
    }
  }
`;
const Events = styled.div`
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  margin-bottom: 80px;
  grid-column-gap: 10px;
  .event {
    border: 1px solid #bbbbbb;
    padding: 8px;
  }
`;

const Wrapper = styled.div`
  text-align: center;
  margin: 40px 100px;
`;
