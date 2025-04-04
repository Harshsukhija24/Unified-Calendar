import { useState, useEffect } from "react";
import { startOfWeek, addDays } from "date-fns";
import { toast } from "react-toastify";
import {
  DayView,
  WeekView,
  MonthView,
  CalendarHeader,
  CalendarLegend,
  UpcomingEvents,
  CalendarSidebar,
} from "../components/calendar";

const CalendarDashboard = () => {
  // State for calendar view and date
  const [view, setView] = useState("month");
  const [date, setDate] = useState(new Date());
  // State for calendar type (personal or team)
  const [calendarType, setCalendarType] = useState("personal");
  // User availability status - load from localStorage or default to "available"
  const [userStatus, setUserStatus] = useState(() => {
    return localStorage.getItem("userStatus") || "available";
  });
  // State for events
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Event filters
  const [filters, setFilters] = useState({
    meeting: true,
    task: true,
    personal: true,
    deadline: true,
  });

  // Generate week days for the week view
  const getWeekDays = (date) => {
    const start = startOfWeek(date);
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(start, i));
    }
    return days;
  };

  const [weekDays, setWeekDays] = useState(getWeekDays(date));

  // Update week days when date changes
  useEffect(() => {
    if (view === "week") {
      setWeekDays(getWeekDays(date));
    }
  }, [date, view]);

  // Get today's and tomorrow's dates
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  // Fetch events from the backend
  const getEvents = async () => {
    setLoading(true);
    try {
      // Create a start date and end date range for fetching events
      const startDate = new Date(date);
      let endDate = new Date(date);

      if (view === "month") {
        // For month view, start from first day of month and end at last day
        startDate.setDate(1);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(0); // Last day of current month
      } else if (view === "week") {
        // For week view, get the start of week and end of week
        const weekStart = startOfWeek(date);
        startDate.setTime(weekStart.getTime());
        endDate.setTime(weekStart.getTime());
        endDate.setDate(endDate.getDate() + 6);
      }
      // For day view, startDate and endDate are the same (current date)

      let eventsData = [];

      // Fetch personal events
      if (calendarType === "personal") {
        const response = await fetch(
          `http://localhost:5000/events?type=personal&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Personal events API error: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
          eventsData = data.events || [];
        }
      }

      // Fetch team events if in team calendar mode
      if (calendarType === "team") {
        const teamId = localStorage.getItem("selectedTeam");
        if (!teamId) {
          console.warn("No team selected for team calendar view");
          setEvents([]);
          setLoading(false);
          return;
        }

        try {
          const teamResponse = await fetch(
            `http://localhost:5000/teams/${teamId}/events?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
              },
            }
          );

          if (!teamResponse.ok) {
            throw new Error(`Team events API error: ${teamResponse.status}`);
          }

          const teamData = await teamResponse.json();
          if (teamData.success) {
            eventsData = [...eventsData, ...(teamData.events || [])];
          }
        } catch (error) {
          console.error("Error fetching team events:", error);
          toast.error("Failed to load team events. Please try again.");
        }
      }

      // Apply filters
      const filteredEvents = eventsData.filter((event) => {
        return filters[event.type];
      });

      setEvents(filteredEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to load events. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Load events when component mounts or dependencies change
  useEffect(() => {
    getEvents();
  }, [calendarType, date, view]);

  // Handle creating a new event
  const handleEventCreate = (newEvent) => {
    // Make sure new events have startDate and endDate fields
    if (!newEvent.startDate) {
      newEvent.startDate = newEvent.date;
    }
    if (!newEvent.endDate) {
      newEvent.endDate = newEvent.date;
    }

    setEvents((prevEvents) => [...prevEvents, newEvent]);
    toast.success(`New ${newEvent.type} event created successfully!`);
    // Refresh events after creating a new one
    getEvents();
  };

  // Select events based on calendar type and filter them
  const filteredEvents = events.filter((event) => filters[event.type]);

  // Toggle user availability status
  const toggleUserStatus = (newStatus) => {
    setUserStatus(newStatus);
    // Save to localStorage
    localStorage.setItem("userStatus", newStatus);
  };

  // Handle event click
  const handleEventClick = (event) => {
    // Create a descriptive message with event details and format
    const typeLabels = {
      meeting: "Meeting",
      task: "Task",
      deadline: "Deadline",
      personal: "Personal Event",
    };

    const eventType = typeLabels[event.type] || "Event";

    // Get date display info
    let dateInfo;
    if (event.startDate && event.endDate && event.startDate !== event.endDate) {
      // For multi-day events, show the date range
      const startDate = new Date(event.startDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      });
      const endDate = new Date(event.endDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
      dateInfo = `${startDate} - ${endDate}`;
    } else {
      // For single-day events
      dateInfo = new Date(event.date || event.startDate).toLocaleDateString(
        "en-US",
        {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      );
    }

    const eventTimeInfo = event.startTime
      ? `Time: ${event.startTime}${event.endTime ? ` - ${event.endTime}` : ""}`
      : "All day event";

    toast.info(
      <div>
        <div className="text-lg font-semibold mb-1">{event.title}</div>
        <div className="text-sm mb-1">
          <span
            className={`inline-block w-2 h-2 rounded-full mr-1 ${
              event.type === "meeting"
                ? "bg-blue-400"
                : event.type === "task"
                ? "bg-green-400"
                : event.type === "deadline"
                ? "bg-red-400"
                : "bg-purple-400"
            }`}
          ></span>
          {eventType}
        </div>
        <div className="text-sm">{dateInfo}</div>
        <div className="text-sm">{eventTimeInfo}</div>
        {event.description && (
          <div className="text-sm mt-2">{event.description}</div>
        )}
      </div>,
      {
        position: "top-right",
        autoClose: 5000,
        closeOnClick: true,
        pauseOnHover: true,
      }
    );
  };

  // Handle filter toggle
  const handleFilterChange = (filterType) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: !prev[filterType],
    }));
  };

  // Handle today button click
  const handleTodayClick = () => {
    setDate(new Date());
  };

  return (
    <div className="w-full rounded-xl overflow-hidden border border-white/20">
      <div className="flex flex-col md:flex-row min-h-[80vh]">
        {/* Sidebar */}
        <CalendarSidebar
          filters={filters}
          onFilterChange={handleFilterChange}
          calendarType={calendarType}
          userStatus={userStatus}
          onToggleStatus={toggleUserStatus}
          onEventCreate={handleEventCreate}
        />

        {/* Main Content */}
        <div className="flex-1 p-5 lg:p-8 overflow-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-3 md:mb-0">
              {calendarType === "personal"
                ? "Personal Calendar"
                : "Team Calendar"}
              <span
                className={`ml-2 text-sm px-2 py-0.5 rounded-md inline-flex items-center ${
                  userStatus === "available"
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                <span
                  className={`mr-1.5 h-2 w-2 rounded-full ${
                    userStatus === "available" ? "bg-green-500" : "bg-red-500"
                  }`}
                ></span>
                {userStatus === "available" ? "Available" : "Unavailable"}
              </span>
            </h1>
            <div className="flex space-x-3">
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm hover:shadow-md ${
                  calendarType === "personal"
                    ? "bg-cyan-600 text-white"
                    : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                }`}
                onClick={() => setCalendarType("personal")}
              >
                Personal Calendar
              </button>
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm hover:shadow-md ${
                  calendarType === "team"
                    ? "bg-cyan-600 text-white"
                    : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                }`}
                onClick={() => setCalendarType("team")}
              >
                Team Calendar
              </button>
            </div>
          </div>

          {/* Calendar Header with Navigation */}
          <CalendarHeader
            date={date}
            view={view}
            onViewChange={setView}
            onDateChange={setDate}
            onTodayClick={handleTodayClick}
          />

          {/* Calendar Legend */}
          <CalendarLegend
            filters={filters}
            onFilterChange={handleFilterChange}
          />

          {/* Calendar Views */}
          <div className="calendar-container mt-6 bg-white/5 p-4 rounded-xl border border-white/10 shadow-inner">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
              </div>
            ) : (
              <>
                {view === "day" && (
                  <DayView
                    date={date}
                    events={filteredEvents}
                    onEventClick={handleEventClick}
                    calendarType={calendarType}
                    userStatus={userStatus}
                  />
                )}

                {view === "week" && (
                  <WeekView
                    weekDays={weekDays}
                    events={filteredEvents}
                    onEventClick={handleEventClick}
                    calendarType={calendarType}
                    userStatus={userStatus}
                  />
                )}

                {view === "month" && (
                  <MonthView
                    date={date}
                    events={filteredEvents}
                    onDateChange={setDate}
                    onEventClick={handleEventClick}
                    calendarType={calendarType}
                    userStatus={userStatus}
                  />
                )}
              </>
            )}
          </div>

          {/* Upcoming Events */}
          <div className="mt-8">
            <UpcomingEvents
              events={filteredEvents}
              onEventClick={handleEventClick}
              calendarType={calendarType}
              userStatus={userStatus}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarDashboard;
