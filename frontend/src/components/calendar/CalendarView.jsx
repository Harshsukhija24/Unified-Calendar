import React from "react";
import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  isSameDay,
} from "date-fns";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { HiClock, HiUserGroup, HiMail } from "react-icons/hi";

const CalendarView = ({ view, date, events, onEventClick, onDragEnd }) => {
  const getViewRange = () => {
    switch (view) {
      case "day":
        return [startOfDay(date), endOfDay(date)];
      case "week":
        return [startOfWeek(date), endOfWeek(date)];
      case "month":
        return [startOfMonth(date), endOfMonth(date)];
      default:
        return [startOfDay(date), endOfDay(date)];
    }
  };

  const [startDate, endDate] = getViewRange();
  const days = [];
  let currentDate = startDate;

  while (currentDate <= endDate) {
    days.push(currentDate);
    currentDate = addDays(currentDate, 1);
  }

  const getEventIcon = (type) => {
    switch (type) {
      case "meeting":
        return <HiUserGroup className="h-4 w-4" />;
      case "email":
        return <HiMail className="h-4 w-4" />;
      default:
        return <HiClock className="h-4 w-4" />;
    }
  };

  const renderDayView = () => (
    <div className="grid grid-cols-1 gap-4">
      {days.map((day) => {
        const dayEvents = events.filter((event) =>
          isSameDay(new Date(event.startDate), day)
        );

        return (
          <div
            key={day.toISOString()}
            className="bg-white rounded-lg shadow-sm p-4"
          >
            <h3 className="text-lg font-semibold mb-4">
              {format(day, "EEEE, MMMM d, yyyy")}
            </h3>
            <div className="space-y-2">
              {dayEvents.map((event, index) => (
                <div
                  key={event._id}
                  onClick={() => onEventClick(event)}
                  className="p-3 rounded-lg border hover:shadow-md cursor-pointer"
                  style={{
                    borderLeft: `4px solid ${event.color || "#3B82F6"}`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getEventIcon(event.type)}
                      <span className="font-medium">{event.title}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {format(new Date(event.startDate), "h:mm a")} -{" "}
                      {format(new Date(event.endDate), "h:mm a")}
                    </span>
                  </div>
                  {event.description && (
                    <p className="text-sm text-gray-600 mt-2">
                      {event.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderWeekView = () => (
    <div className="grid grid-cols-7 gap-4">
      {days.map((day) => {
        const dayEvents = events.filter((event) =>
          isSameDay(new Date(event.startDate), day)
        );

        return (
          <div
            key={day.toISOString()}
            className="bg-white rounded-lg shadow-sm p-4"
          >
            <h3 className="text-lg font-semibold mb-4">
              {format(day, "EEE")}
              <br />
              {format(day, "d")}
            </h3>
            <div className="space-y-2">
              {dayEvents.map((event) => (
                <div
                  key={event._id}
                  onClick={() => onEventClick(event)}
                  className="p-2 rounded-lg border hover:shadow-md cursor-pointer text-sm"
                  style={{
                    borderLeft: `4px solid ${event.color || "#3B82F6"}`,
                  }}
                >
                  <div className="flex items-center space-x-1">
                    {getEventIcon(event.type)}
                    <span className="truncate">{event.title}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {format(new Date(event.startDate), "h:mm a")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderMonthView = () => (
    <div className="grid grid-cols-7 gap-4">
      {days.map((day) => {
        const dayEvents = events.filter((event) =>
          isSameDay(new Date(event.startDate), day)
        );

        return (
          <div
            key={day.toISOString()}
            className="bg-white rounded-lg shadow-sm p-4"
          >
            <h3 className="text-lg font-semibold mb-4">{format(day, "d")}</h3>
            <div className="space-y-1">
              {dayEvents.map((event) => (
                <div
                  key={event._id}
                  onClick={() => onEventClick(event)}
                  className="p-1 rounded-lg border hover:shadow-md cursor-pointer text-xs"
                  style={{
                    borderLeft: `4px solid ${event.color || "#3B82F6"}`,
                  }}
                >
                  <div className="flex items-center space-x-1">
                    {getEventIcon(event.type)}
                    <span className="truncate">{event.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="calendar">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-4"
          >
            {view === "day" && renderDayView()}
            {view === "week" && renderWeekView()}
            {view === "month" && renderMonthView()}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default CalendarView;
