import { format, isSameDay, parseISO } from "date-fns";

const DayView = ({ date, events, onEventClick }) => {
  // Filter events for the selected day
  const dayEvents = events.filter((event) =>
    isSameDay(parseISO(event.date), date)
  );

  // Group events by type
  const groupedEvents = {
    meeting: dayEvents.filter((e) => e.type === "meeting"),
    task: dayEvents.filter((e) => e.type === "task"),
    deadline: dayEvents.filter((e) => e.type === "deadline"),
    personal: dayEvents.filter((e) => e.type === "personal"),
  };

  // Function to get the appropriate color class based on event type
  const getEventTypeColor = (type) => {
    switch (type) {
      case "meeting":
        return "bg-blue-500/30 border-blue-500 text-blue-100";
      case "task":
        return "bg-green-500/30 border-green-500 text-green-100";
      case "deadline":
        return "bg-red-500/30 border-red-500 text-red-100";
      case "personal":
        return "bg-purple-500/30 border-purple-500 text-purple-100";
      default:
        return "bg-gray-500/30 border-gray-500 text-gray-100";
    }
  };

  // Type display labels
  const typeLabels = {
    meeting: "Meetings",
    task: "Tasks",
    deadline: "Deadlines",
    personal: "Personal",
  };

  // Type icon components
  const typeIcons = {
    meeting: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
      />
    ),
    task: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
      />
    ),
    deadline: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
    personal: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    ),
  };

  return (
    <div className="day-view">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
        <span className="h-6 w-1 bg-cyan-500 rounded-full"></span>
        <span>{format(date, "EEEE, MMMM d, yyyy")}</span>
      </h3>

      {dayEvents.length === 0 ? (
        <div className="flex items-center justify-center h-48 bg-white/5 rounded-xl border border-white/10">
          <p className="text-white/60">No events scheduled for this day</p>
        </div>
      ) : (
        <div className="event-groups space-y-6">
          {Object.entries(groupedEvents).map(([type, events]) => {
            if (events.length === 0) return null;

            return (
              <div key={type} className="event-group">
                <h4 className="text-md font-medium text-white/80 mb-3 flex items-center">
                  {typeIcons[type]}
                  {typeLabels[type]} ({events.length})
                </h4>

                <div className="events-list space-y-2">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => onEventClick(event)}
                      className={`event-item p-4 rounded-md cursor-pointer shadow-md transition-all flex items-start hover:translate-x-1 hover:shadow-lg border-l-2 ${getEventTypeColor(
                        event.type
                      )}`}
                    >
                      <div className="event-details flex-1">
                        <div className="font-medium text-lg">{event.title}</div>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center text-sm opacity-80">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                            {event.startTime || "All day"}
                            {event.endTime && ` - ${event.endTime}`}
                          </div>

                          {event.location && (
                            <div className="text-sm opacity-80 flex items-center">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              {event.location}
                            </div>
                          )}
                        </div>
                        {event.description && (
                          <div className="mt-2 text-sm opacity-80">
                            {event.description.length > 100
                              ? `${event.description.substring(0, 100)}...`
                              : event.description}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DayView;
