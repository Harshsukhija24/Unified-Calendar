import React, { useState, useEffect, useCallback } from "react";
import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  isSameMonth,
  isSameWeek,
} from "date-fns";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { toast } from "react-toastify";
import {
  HiCalendar,
  HiClock,
  HiUserGroup,
  HiFilter,
  HiPlus,
  HiRefresh,
} from "react-icons/hi";
import { useSocket } from "../../hooks/useSocket";
import EventModal from "./EventModal";
import TaskModal from "./TaskModal";
import EmailModal from "./EmailModal";
import TeamAvailability from "./TeamAvailability";
import CalendarControls from "./CalendarControls";
import CalendarView from "./CalendarView";
import CalendarSidebar from "./CalendarSidebar";
import CalendarFilters from "./CalendarFilters";
import CalendarViewSelector from "./CalendarViewSelector";
import TimezoneSelector from "./TimezoneSelector";
import ExportCalendar from "./ExportCalendar";
import ShareCalendar from "./ShareCalendar";

const UnifiedCalendar = () => {
  // State management
  const [view, setView] = useState("month");
  const [date, setDate] = useState(new Date());
  const [calendarType, setCalendarType] = useState("personal");
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [conflicts, setConflicts] = useState([]);

  // Filters
  const [filters, setFilters] = useState({
    meeting: true,
    task: true,
    email: true,
    personal: true,
    deadline: true,
  });

  // Socket connection for real-time updates
  const socket = useSocket();

  // Fetch events from the backend
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const startDate = new Date(date);
      let endDate = new Date(date);

      // Adjust date range based on view
      if (view === "month") {
        startDate.setDate(1);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(0);
      } else if (view === "week") {
        const weekStart = startOfWeek(date);
        startDate.setTime(weekStart.getTime());
        endDate.setTime(weekStart.getTime());
        endDate.setDate(endDate.getDate() + 6);
      }

      let eventsData = [];

      // Fetch personal events
      if (calendarType === "personal") {
        const response = await fetch(
          `http://localhost:5000/events?type=personal&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&timezone=${timezone}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch personal events");
        const data = await response.json();
        if (data.success) eventsData = data.events || [];
      }

      // Fetch team events
      if (calendarType === "team" && selectedTeam) {
        const teamResponse = await fetch(
          `http://localhost:5000/teams/${selectedTeam}/events?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&timezone=${timezone}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        if (!teamResponse.ok) throw new Error("Failed to fetch team events");
        const teamData = await teamResponse.json();
        if (teamData.success)
          eventsData = [...eventsData, ...(teamData.events || [])];
      }

      // Check for conflicts
      const conflicts = checkConflicts(eventsData);
      setConflicts(conflicts);

      // Apply filters
      const filteredEvents = eventsData.filter((event) => filters[event.type]);
      setEvents(filteredEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to load events. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [date, view, calendarType, selectedTeam, timezone, filters]);

  // Check for event conflicts
  const checkConflicts = (events) => {
    const conflicts = [];
    events.forEach((event1, i) => {
      events.forEach((event2, j) => {
        if (i !== j && isOverlapping(event1, event2)) {
          conflicts.push({ event1, event2 });
        }
      });
    });
    return conflicts;
  };

  // Check if two events overlap
  const isOverlapping = (event1, event2) => {
    const start1 = new Date(event1.startDate);
    const end1 = new Date(event1.endDate);
    const start2 = new Date(event2.startDate);
    const end2 = new Date(event2.endDate);

    return (
      (start1 <= end2 && end1 >= start2) || (start2 <= end1 && end2 >= start1)
    );
  };

  // Handle real-time updates
  useEffect(() => {
    if (socket) {
      socket.on("eventCreated", (newEvent) => {
        setEvents((prev) => [...prev, newEvent]);
      });

      socket.on("eventUpdated", (updatedEvent) => {
        setEvents((prev) =>
          prev.map((event) =>
            event._id === updatedEvent._id ? updatedEvent : event
          )
        );
      });

      socket.on("eventDeleted", (deletedEventId) => {
        setEvents((prev) =>
          prev.filter((event) => event._id !== deletedEventId)
        );
      });

      return () => {
        socket.off("eventCreated");
        socket.off("eventUpdated");
        socket.off("eventDeleted");
      };
    }
  }, [socket]);

  // Handle drag and drop
  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const event = events.find((e) => e._id === draggableId);

    if (!event) return;

    const newStartDate = new Date(destination.droppableId);
    const newEndDate = new Date(destination.droppableId);

    // Update event dates
    const updatedEvent = {
      ...event,
      startDate: newStartDate.toISOString(),
      endDate: newEndDate.toISOString(),
    };

    try {
      const response = await fetch(
        `http://localhost:5000/events/${event._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify(updatedEvent),
        }
      );

      if (!response.ok) throw new Error("Failed to update event");

      setEvents((prev) =>
        prev.map((e) => (e._id === event._id ? updatedEvent : e))
      );

      toast.success("Event rescheduled successfully");
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error("Failed to reschedule event");
    }
  };

  // Render calendar view based on selected view type
  const renderCalendarView = () => {
    switch (view) {
      case "day":
        return (
          <DayView
            events={events}
            date={date}
            onEventClick={setSelectedEvent}
          />
        );
      case "week":
        return (
          <WeekView
            events={events}
            date={date}
            onEventClick={setSelectedEvent}
          />
        );
      case "month":
        return (
          <MonthView
            events={events}
            date={date}
            onEventClick={setSelectedEvent}
          />
        );
      default:
        return (
          <MonthView
            events={events}
            date={date}
            onEventClick={setSelectedEvent}
          />
        );
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <CalendarViewSelector view={view} onViewChange={setView} />
            <TimezoneSelector
              timezone={timezone}
              onTimezoneChange={setTimezone}
            />
            <CalendarFilters filters={filters} onFilterChange={setFilters} />
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowEventModal(true)}
              className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              <HiPlus className="h-5 w-5" />
              <span>New Event</span>
            </button>
            <button
              onClick={() => setShowTaskModal(true)}
              className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
            >
              <HiPlus className="h-5 w-5" />
              <span>New Task</span>
            </button>
            <button
              onClick={() => setShowEmailModal(true)}
              className="flex items-center space-x-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600"
            >
              <HiPlus className="h-5 w-5" />
              <span>New Email</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm p-4">
          <TeamAvailability teamMembers={teamMembers} />
          <div className="mt-4">
            <ShareCalendar
              calendarType={calendarType}
              selectedTeam={selectedTeam}
            />
          </div>
          <div className="mt-4">
            <ExportCalendar events={events} />
          </div>
        </div>

        {/* Calendar View */}
        <div className="flex-1 overflow-auto p-4">
          <DragDropContext onDragEnd={handleDragEnd}>
            {renderCalendarView()}
          </DragDropContext>
        </div>
      </div>

      {/* Modals */}
      {showEventModal && (
        <EventModal
          isOpen={showEventModal}
          onClose={() => setShowEventModal(false)}
          calendarType={calendarType}
          onEventCreate={handleEventCreate}
          teamMembers={teamMembers}
        />
      )}
      {showTaskModal && (
        <TaskModal
          isOpen={showTaskModal}
          onClose={() => setShowTaskModal(false)}
          calendarType={calendarType}
          onTaskCreate={handleTaskCreate}
          teamMembers={teamMembers}
        />
      )}
      {showEmailModal && (
        <EmailModal
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          calendarType={calendarType}
          onEmailCreate={handleEmailCreate}
          teamMembers={teamMembers}
        />
      )}
    </div>
  );
};

export default UnifiedCalendar;
