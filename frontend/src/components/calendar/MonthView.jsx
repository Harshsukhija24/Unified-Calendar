import Calendar from "react-calendar";
import {
  isSameDay,
  parseISO,
  isWithinInterval,
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addDays,
  differenceInDays,
  getDay,
} from "date-fns";
// import "react-calendar/dist/Calendar.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";
import { useState, useEffect } from "react";

const MonthView = ({ date, events, onDateChange, onEventClick }) => {
  const [hoveredDate, setHoveredDate] = useState(null);
  const [multiDayEventLayout, setMultiDayEventLayout] = useState({});
  const [singleDayEvents, setSingleDayEvents] = useState({});

  // Calculate multi-day event layout when events or date changes
  useEffect(() => {
    if (!events || events.length === 0) return;

    // First, separate multi-day events from single-day events
    const multiDayEvents = [];
    const singleDayEventsMap = {};

    events.forEach((event) => {
      // Skip events without start and end dates
      if (!event.startDate || !event.endDate) return;

      const startDate = parseISO(event.startDate);
      const endDate = parseISO(event.endDate);

      // Check if it's a multi-day event
      if (differenceInDays(endDate, startDate) > 0) {
        multiDayEvents.push({
          ...event,
          startDateObj: startDate,
          endDateObj: endDate,
          duration: differenceInDays(endDate, startDate) + 1,
        });
      } else {
        // Single day events are grouped by date
        const dateKey = format(startDate, "yyyy-MM-dd");
        if (!singleDayEventsMap[dateKey]) {
          singleDayEventsMap[dateKey] = [];
        }
        singleDayEventsMap[dateKey].push(event);
      }
    });

    // Calculate the layout for multi-day events
    const eventLayout = {};
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const daysInView = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Group events by week to maintain event continuity
    const weeks = [];
    let currentWeek = [];
    let currentWeekStart = null;

    daysInView.forEach((day) => {
      if (!currentWeekStart || getDay(day) === 0) {
        if (currentWeek.length > 0) {
          weeks.push({
            days: currentWeek,
            start: currentWeekStart,
            end: currentWeek[currentWeek.length - 1],
          });
        }
        currentWeek = [day];
        currentWeekStart = day;
      } else {
        currentWeek.push(day);
      }
    });

    // Add the last week
    if (currentWeek.length > 0) {
      weeks.push({
        days: currentWeek,
        start: currentWeekStart,
        end: currentWeek[currentWeek.length - 1],
      });
    }

    // Process each week
    weeks.forEach((week) => {
      const weekEvents = multiDayEvents.filter((event) => {
        const eventStartsBeforeWeekEnds = event.startDateObj <= week.end;
        const eventEndsAfterWeekStarts = event.endDateObj >= week.start;
        return eventStartsBeforeWeekEnds && eventEndsAfterWeekStarts;
      });

      // Sort events by duration (longer events first)
      weekEvents.sort((a, b) => b.duration - a.duration);

      // Assign row index to each event in the week
      const takenSlots = new Map(); // Maps date string to set of row indices taken

      weekEvents.forEach((event) => {
        // Find the dates in this week that the event spans
        const eventStart =
          event.startDateObj < week.start ? week.start : event.startDateObj;
        const eventEnd =
          event.endDateObj > week.end ? week.end : event.endDateObj;

        // Check which row indices are taken for these dates
        const eventDates = eachDayOfInterval({
          start: eventStart,
          end: eventEnd,
        });

        // Find the first available row index for all dates
        let rowIndex = 0;
        let foundRow = false;

        while (!foundRow) {
          foundRow = true;
          for (const eventDate of eventDates) {
            const dateKey = format(eventDate, "yyyy-MM-dd");
            if (!takenSlots.has(dateKey)) {
              takenSlots.set(dateKey, new Set());
            }
            if (takenSlots.get(dateKey).has(rowIndex)) {
              foundRow = false;
              rowIndex++;
              break;
            }
          }
        }

        // Mark these slots as taken
        eventDates.forEach((eventDate) => {
          const dateKey = format(eventDate, "yyyy-MM-dd");
          takenSlots.get(dateKey).add(rowIndex);
        });

        // Store the layout information for this event
        eventDates.forEach((eventDate) => {
          const dateKey = format(eventDate, "yyyy-MM-dd");
          const isStart = isSameDay(eventDate, event.startDateObj);
          const isEnd = isSameDay(eventDate, event.endDateObj);

          if (!eventLayout[dateKey]) {
            eventLayout[dateKey] = [];
          }

          eventLayout[dateKey].push({
            event,
            isStart,
            isEnd,
            rowIndex,
            weekStartDay: getDay(week.start),
            totalDays:
              differenceInDays(event.endDateObj, event.startDateObj) + 1,
            daysInThisWeek: eventDates.length,
          });
        });
      });
    });

    setMultiDayEventLayout(eventLayout);
    setSingleDayEvents(singleDayEventsMap);
  }, [events, date]);

  // Function to get type color based on event type
  const getEventTypeColor = (type) => {
    switch (type) {
      case "meeting":
        return "bg-blue-500";
      case "task":
        return "bg-green-500";
      case "deadline":
        return "bg-red-500";
      case "personal":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const getEventDot = (type) => {
    switch (type) {
      case "meeting":
        return "bg-blue-500";
      case "task":
        return "bg-green-500";
      case "deadline":
        return "bg-red-500";
      case "personal":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  // Function to check if an event occurs on a specific date
  const isEventOnDate = (event, date) => {
    try {
      // If the event doesn't have startDate/endDate fields, use the regular date field
      if (!event.startDate && !event.endDate && event.date) {
        return isSameDay(parseISO(event.date), date);
      }

      // If we have startDate and endDate, check if the current date falls within the range
      if (event.startDate && event.endDate) {
        const startDate = parseISO(event.startDate);
        const endDate = parseISO(event.endDate);
        return isWithinInterval(date, { start: startDate, end: endDate });
      }

      // If we only have startDate, use that
      if (event.startDate) {
        return isSameDay(parseISO(event.startDate), date);
      }

      // Fallback to the event.date field
      return isSameDay(parseISO(event.date), date);
    } catch (error) {
      console.error("Error checking if event is on date:", error, event);
      return false;
    }
  };

  // Function to render tile content in the calendar
  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;

    const dateKey = format(date, "yyyy-MM-dd");
    const multiDayEventsForDate = multiDayEventLayout[dateKey] || [];
    const singleDayEventsForDate = singleDayEvents[dateKey] || [];
    
    const allEventsForDate = [...multiDayEventsForDate.map(item => item.event), ...singleDayEventsForDate];
    
    // If no events for this date, return null
    if (allEventsForDate.length === 0) {
      return null;
    }

    // Show color dots for events on this date (traditional calendar style)
    return (
      <div className="calendar-events w-full">
        {/* Just show event dots for a cleaner monthly view */}
        <div className="event-dots flex flex-wrap gap-1 mt-1 justify-center">
          {allEventsForDate.slice(0, 3).map((event, idx) => (
            <div 
              key={`dot-${event.id || idx}`}
              className={`${getEventDot(event.type)} w-1.5 h-1.5 rounded-full`}
              title={event.title}
            ></div>
          ))}
          {allEventsForDate.length > 3 && (
            <div className="text-xs text-white/70">+{allEventsForDate.length - 3}</div>
          )}
        </div>
      </div>
    );
  };

  // Function for handling tile click to show event details
  const handleTileClick = (date) => {
    onDateChange(date);
  };

  return (
    <div className="month-view">
      <div className="custom-calendar-wrapper bg-white/5 p-4 rounded-xl shadow-inner">
        <Calendar
          onChange={onDateChange}
          value={date}
          tileContent={tileContent}
          onClickDay={handleTileClick}
          className="bg-transparent border-0 shadow-none rounded-lg overflow-hidden traditional-calendar"
          prevLabel={
            <FaChevronLeft className="text-white/80 hover:text-white" />
          }
          nextLabel={
            <FaChevronRight className="text-white/80 hover:text-white" />
          }
          prev2Label={
            <FaAngleDoubleLeft className="text-white/80 hover:text-white" />
          }
          next2Label={
            <FaAngleDoubleRight className="text-white/80 hover:text-white" />
          }
          showNeighboringMonth={true}
          tileClassName={({ date: tileDate }) => 
            `calendar-tile ${isSameDay(tileDate, date) ? 'selected-date' : ''}`
          }
          formatDay={(locale, date) => format(date, 'd')}
        />
      </div>
      
      {/* Event details for selected date */}
      <div className="selected-date-events mt-4 p-4 bg-white/5 rounded-xl">
        <h3 className="text-lg font-medium mb-2">{format(date, 'MMMM d, yyyy')}</h3>
        
        <div className="events-list space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
          {(() => {
            const dateKey = format(date, "yyyy-MM-dd");
            const multiDayEventsForDate = multiDayEventLayout[dateKey] || [];
            const singleDayEventsForDate = singleDayEvents[dateKey] || [];
            const allEvents = [...multiDayEventsForDate.map(item => {
              return {
                ...item.event,
                isStart: item.isStart,
                isEnd: item.isEnd
              };
            }), ...singleDayEventsForDate];
            
            if (allEvents.length === 0) {
              return <div className="text-white/70 text-center py-2">No events scheduled for this day</div>;
            }
            
            return allEvents.map((event, index) => {
              const isMultiDay = event.startDate && event.endDate && 
                differenceInDays(parseISO(event.endDate), parseISO(event.startDate)) > 0;
                
              return (
                <div 
                  key={`event-${event.id}-${index}`}
                  className={`event-item ${event.type}-event rounded p-2 cursor-pointer`}
                  onClick={() => onEventClick(event)}
                >
                  <div className="flex justify-between items-start">
                    <div className="font-semibold">{event.title}</div>
                    <div className="text-xs bg-white/10 px-2 py-0.5 rounded capitalize">
                      {event.type}
                    </div>
                  </div>
                  
                  {isMultiDay && (
                    <div className="text-sm mt-1 flex items-center text-white/80">
                      <span className="mr-1">
                        {format(parseISO(event.startDate), "MMM d")} - {format(parseISO(event.endDate), "MMM d")}
                      </span>
                      {event.isStart && <span className="text-xs bg-blue-500/30 px-1 rounded">Starts</span>}
                      {event.isEnd && <span className="text-xs bg-purple-500/30 px-1 rounded ml-1">Ends</span>}
                      {!event.isStart && !event.isEnd && <span className="text-xs bg-gray-500/30 px-1 rounded">Ongoing</span>}
                    </div>
                  )}
                  
                  {event.startTime && event.endTime && (
                    <div className="text-sm mt-1 text-white/80">
                      {event.startTime} - {event.endTime}
                    </div>
                  )}
                  
                  {event.location && (
                    <div className="text-sm mt-1 text-white/80">
                      📍 {event.location}
                    </div>
                  )}
                </div>
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
};

export default MonthView;
