import React, { useState, useEffect } from "react";
import { HiX, HiUserGroup, HiMail, HiClock, HiCalendar } from "react-icons/hi";

const EventModal = ({
  isOpen,
  onClose,
  onSubmit,
  event,
  teams,
  teamMembers,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    type: "meeting",
    color: "#3B82F6",
    isAllDay: false,
    isRecurring: false,
    recurrenceRule: "",
    teamId: "",
    attendees: [],
    reminders: [],
    status: "pending",
    priority: "medium",
  });

  useEffect(() => {
    if (event) {
      setFormData({
        ...event,
        startDate: event.startDate
          ? new Date(event.startDate).toISOString().slice(0, 16)
          : "",
        endDate: event.endDate
          ? new Date(event.endDate).toISOString().slice(0, 16)
          : "",
      });
    }
  }, [event]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAttendeeChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      attendees: value ? [...prev.attendees, value] : prev.attendees,
    }));
  };

  const handleReminderChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      reminders: value
        ? [...prev.reminders, { time: value, type: "email" }]
        : prev.reminders,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">
            {event ? "Edit Event" : "Create Event"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <HiX className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  End Date
                </label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Event Type and Team */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Event Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="meeting">Meeting</option>
                <option value="task">Task</option>
                <option value="email">Email</option>
                <option value="personal">Personal</option>
                <option value="deadline">Deadline</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Team
              </label>
              <select
                name="teamId"
                value={formData.teamId}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select Team</option>
                {teams.map((team) => (
                  <option key={team._id} value={team._id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Attendees */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Attendees
            </label>
            <select
              name="attendees"
              onChange={handleAttendeeChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select Attendees</option>
              {teamMembers.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name}
                </option>
              ))}
            </select>
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.attendees.map((attendeeId) => {
                const member = teamMembers.find((m) => m._id === attendeeId);
                return member ? (
                  <span
                    key={attendeeId}
                    className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {member.name}
                  </span>
                ) : null;
              })}
            </div>
          </div>

          {/* Reminders */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Reminders
            </label>
            <select
              name="reminders"
              onChange={handleReminderChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Add Reminder</option>
              <option value="5">5 minutes before</option>
              <option value="15">15 minutes before</option>
              <option value="30">30 minutes before</option>
              <option value="60">1 hour before</option>
              <option value="1440">1 day before</option>
            </select>
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.reminders.map((reminder, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
                >
                  {reminder.time} minutes before
                </span>
              ))}
            </div>
          </div>

          {/* Advanced Options */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isAllDay"
                  checked={formData.isAllDay}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  All Day Event
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isRecurring"
                  checked={formData.isRecurring}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Recurring Event
                </span>
              </label>
            </div>

            {formData.isRecurring && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Recurrence Rule
                </label>
                <input
                  type="text"
                  name="recurrenceRule"
                  value={formData.recurrenceRule}
                  onChange={handleChange}
                  placeholder="e.g., FREQ=WEEKLY;INTERVAL=1"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {event ? "Update Event" : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;
