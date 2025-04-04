import {
  format,
  isFuture,
  parseISO,
  isToday,
  addDays,
  isWithinInterval,
  isSameDay,
  isBefore,
  isAfter,
} from "date-fns";

const UpcomingEvents = ({ events, onEventClick, calendarType, userStatus }) => {
  // Function to check if an event will occur in the upcoming period (today to next 7 days)
  const isEventUpcoming = (event) => {
    try {
      // Skip events without a valid date
      if (!event.date && !event.startDate) return false;

      const today = new Date();
      const nextWeek = addDays(today, 7);

      // If we have startDate and endDate, check if any day in the range overlaps with our upcoming period
      if (event.startDate && event.endDate) {
        const startDate = parseISO(event.startDate);
        const endDate = parseISO(event.endDate);

        // If the event has already started but ends in our period
        if (
          isBefore(startDate, today) &&
          isWithinInterval(endDate, { start: today, end: nextWeek })
        ) {
          return true;
        }

        // If the event starts in our period
        if (isWithinInterval(startDate, { start: today, end: nextWeek })) {
          return true;
        }

        // If the event spans our entire period
        if (isBefore(startDate, today) && isAfter(endDate, nextWeek)) {
          return true;
        }
      }

      // For simple event dates, check if they fall within our period
      const eventDate = parseISO(event.date || event.startDate);
      return (
        (isToday(eventDate) || isFuture(eventDate)) &&
        isWithinInterval(eventDate, { start: today, end: nextWeek })
      );
    } catch (error) {
      console.error("Error checking if event is upcoming:", error, event);
      return false;
    }
  };

  // Function to display date range for multi-day events
  const formatDateRange = (event) => {
    try {
      if (
        event.startDate &&
        event.endDate &&
        !isSameDay(parseISO(event.startDate), parseISO(event.endDate))
      ) {
        const startDateStr = format(parseISO(event.startDate), "MMM d");
        const endDateStr = format(parseISO(event.endDate), "MMM d");
        return `${startDateStr} - ${endDateStr}`;
      }
      return null;
    } catch (error) {
      console.error("Error formatting date range:", error);
      return null;
    }
  };

  // Filter and sort events for display in the upcoming section
  const getUpcomingEvents = () => {
    try {
      if (!events || events.length === 0) {
        return [];
      }

      // Filter upcoming events
      return events
        .filter(isEventUpcoming)
        .sort((a, b) => {
          try {
            // Sort by start date
            const dateA = parseISO(a.startDate || a.date);
            const dateB = parseISO(b.startDate || b.date);
            return dateA - dateB;
          } catch (error) {
            console.error("Error sorting events:", error);
            return 0;
          }
        })
        .slice(0, 3); // Show only the next 3 events
    } catch (error) {
      console.error("Error processing upcoming events:", error);
      return [];
    }
  };

  const upcomingEvents = getUpcomingEvents();

  // Helper function to format the date for display
  const formatEventDate = (event) => {
    try {
      // For multi-day events, display a date range
      if (
        event.startDate &&
        event.endDate &&
        !isSameDay(parseISO(event.startDate), parseISO(event.endDate))
      ) {
        return formatDateRange(event);
      }

      // For single-day events, use the standard formatting
      const eventDate = parseISO(event.date || event.startDate);

      if (isToday(eventDate)) {
        return "Today";
      } else if (isToday(addDays(eventDate, -1))) {
        return "Tomorrow";
      } else {
        return format(eventDate, "EEEE, MMMM d");
      }
    } catch (error) {
      console.error("Error formatting date:", error, event);
      return "Date unknown";
    }
  };

  return (
    <div className="upcoming-events bg-white/5 rounded-xl border border-white/10 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center">
          <span className="h-6 w-1 bg-cyan-500 rounded-full mr-3"></span>
          Upcoming {calendarType === "team" ? "Team " : ""}Events
        </h3>
        <div
          className={`flex items-center px-2 py-0.5 rounded ${
            userStatus === "available"
              ? "bg-green-500/20 text-green-400"
              : "bg-red-500/20 text-red-400"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full mr-1.5 ${
              userStatus === "available" ? "bg-green-500" : "bg-red-500"
            }`}
          ></span>
          <span className="text-xs font-medium">
            {userStatus === "available" ? "Available" : "Unavailable"}
          </span>
        </div>
      </div>

      {!events || events.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto text-white/30 mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-white/60 text-sm">
            No events found. Please create an event to view it here.
          </p>
        </div>
      ) : upcomingEvents.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto text-white/30 mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-white/60 text-sm">
            No upcoming {calendarType === "team" ? "team " : ""}events in the
            next 7 days
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {upcomingEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center transition-all hover:bg-white/10 hover:shadow-md cursor-pointer group"
              onClick={() => onEventClick(event)}
            >
              <div
                className={`w-1.5 h-16 rounded-full mr-4 ${
                  event.type === "meeting"
                    ? "bg-blue-500"
                    : event.type === "task"
                    ? "bg-green-500"
                    : event.type === "deadline"
                    ? "bg-red-500"
                    : "bg-purple-500"
                }`}
              ></div>
              <div className="flex-1 overflow-hidden">
                <h4 className="text-white font-medium text-lg truncate group-hover:text-cyan-300 transition-colors">
                  {event.title}
                  {event.startDate &&
                    event.endDate &&
                    !isSameDay(
                      parseISO(event.startDate),
                      parseISO(event.endDate)
                    ) && (
                      <span className="text-xs font-normal ml-2 bg-white/10 px-1.5 py-0.5 rounded">
                        Multi-day
                      </span>
                    )}
                </h4>
                <div className="flex items-center mt-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-white/50 mr-1.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-white/70 text-sm">
                    {formatEventDate(event)}
                  </p>
                </div>
              </div>
              <button className="text-white/50 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {calendarType === "team" && (
        <div className="mt-4 flex items-center justify-between">
          <a
            href="#"
            className="text-cyan-400 hover:text-cyan-300 text-sm font-medium flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
            </svg>
            Share Team Calendar
          </a>
          <a
            href="#"
            className="text-cyan-400 hover:text-cyan-300 text-sm font-medium flex items-center"
          >
            View All Team Events
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 ml-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </a>
        </div>
      )}
    </div>
  );
};

export default UpcomingEvents;
