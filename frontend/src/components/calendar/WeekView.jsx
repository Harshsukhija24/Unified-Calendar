import { format, isSameDay, parseISO } from "date-fns";

const WeekView = ({ weekDays, events, onEventClick }) => {
  // Function to get appropriate color styling based on event type
  const getEventTypeStyles = (type) => {
    switch (type) {
      case "meeting":
        return {
          bg: "bg-blue-500/30",
          border: "border-blue-500",
          text: "text-blue-100",
          dotColor: "bg-blue-400",
        };
      case "task":
        return {
          bg: "bg-green-500/30",
          border: "border-green-500",
          text: "text-green-100",
          dotColor: "bg-green-400",
        };
      case "deadline":
        return {
          bg: "bg-red-500/30",
          border: "border-red-500",
          text: "text-red-100",
          dotColor: "bg-red-400",
        };
      case "personal":
        return {
          bg: "bg-purple-500/30",
          border: "border-purple-500",
          text: "text-purple-100",
          dotColor: "bg-purple-400",
        };
      default:
        return {
          bg: "bg-gray-500/30",
          border: "border-gray-500",
          text: "text-gray-100",
          dotColor: "bg-gray-400",
        };
    }
  };

  // Get the type icon based on event type
  const getTypeIcon = (type) => {
    switch (type) {
      case "meeting":
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        );
      case "task":
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        );
      case "deadline":
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        );
      case "personal":
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="week-view">
      {/* Week header */}
      <div className="grid grid-cols-7 gap-3 mb-6 bg-white/5 p-3 rounded-lg">
        {weekDays.map((day, index) => (
          <div key={index} className="text-center py-2">
            <div className="text-sm text-white/70 mb-1">
              {format(day, "EEE")}
            </div>
            <div
              className={`text-xl font-medium ${
                isSameDay(day, new Date())
                  ? "text-cyan-400 bg-cyan-900/30 rounded-full w-10 h-10 flex items-center justify-center mx-auto"
                  : "text-white"
              }`}
            >
              {format(day, "d")}
            </div>
          </div>
        ))}
      </div>

      {/* Week grid */}
      <div className="grid grid-cols-7 gap-3 max-h-[calc(100vh-420px)] overflow-auto pr-2 custom-scrollbar">
        {weekDays.map((day, dayIndex) => {
          const dayEvents = events.filter((event) =>
            isSameDay(parseISO(event.date), day)
          );

          // Sort events by type
          const sortedEvents = [...dayEvents].sort((a, b) => {
            const typeOrder = { meeting: 1, task: 2, deadline: 3, personal: 4 };
            return typeOrder[a.type] - typeOrder[b.type];
          });

          return (
            <div
              key={dayIndex}
              className={`day-column min-h-[320px] max-h-[400px] overflow-y-auto ${
                isSameDay(day, new Date())
                  ? "bg-white/10 ring-1 ring-cyan-500/40"
                  : "bg-white/5"
              } rounded-lg p-3 transition-all hover:bg-white/10 custom-scrollbar`}
            >
              <h4
                className={`text-sm font-medium mb-3 ${
                  isSameDay(day, new Date()) ? "text-cyan-400" : "text-white/70"
                }`}
              >
                {format(day, "EEE, MMM d")}
              </h4>

              {dayEvents.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <span className="text-white/30 text-sm italic">
                    No events
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedEvents.map((event) => {
                    const styles = getEventTypeStyles(event.type);

                    return (
                      <div
                        key={event.id}
                        onClick={() => onEventClick(event)}
                        className={`event-item p-3 rounded-md cursor-pointer text-sm shadow-md transition-all hover:translate-y-[-2px] hover:shadow-lg ${styles.bg} ${styles.text} border-l-2 ${styles.border}`}
                      >
                        <div className="font-medium truncate">
                          {event.title}
                        </div>

                        <div className="flex justify-between items-center mt-1">
                          {event.startTime && (
                            <div className="text-xs opacity-80 flex items-center">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                              {event.startTime}
                            </div>
                          )}

                          <div className="text-xs opacity-80 flex items-center">
                            {getTypeIcon(event.type)}
                            {event.type.charAt(0).toUpperCase() +
                              event.type.slice(1)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeekView;
