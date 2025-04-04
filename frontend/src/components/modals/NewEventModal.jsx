import { useState, useEffect } from "react";
import { HiX } from "react-icons/hi";
import { toast } from "react-toastify";

const NewEventModal = ({
  isOpen,
  onClose,
  calendarType,
  onEventCreate,
  formData = {},
  onFormChange,
  onSubmit,
  teamMembers = [], // For team events
}) => {
  const [localFormData, setLocalFormData] = useState({
    title: "",
    date: new Date().toISOString().split("T")[0],
    startDate: "",
    endDate: "",
    startTime: "09:00",
    endTime: "10:00",
    type: "meeting",
    description: "",
    location: "",
    status: "pending",
    priority: "medium",
    isAllDay: false,
    isRecurring: false,
    recurrenceRule: "",
    color: "#3B82F6",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    // Task specific
    taskData: {
      assignee: "",
      progress: 0,
      estimatedHours: 0,
    },
    // Email specific
    emailData: {
      subject: "",
      requiresResponse: false,
      responseDeadline: "",
    },
    // Team specific
    attendees: [],
    availability: "available",
    // Reminders
    reminders: [],
    // Attachments
    attachments: [],
  });

  const [localErrors, setLocalErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split("T")[0];
      setLocalFormData({
        ...localFormData,
        date: today,
        startDate: today,
        endDate: today,
        ...formData,
      });
      setLocalErrors({});
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setLocalFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else if (name.startsWith("taskData.") || name.startsWith("emailData.")) {
      const [parent, child] = name.split(".");
      setLocalFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setLocalFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (localErrors[name]) {
      setLocalErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (onFormChange) {
      onFormChange(e);
    }
  };

  const addReminder = () => {
    setLocalFormData((prev) => ({
      ...prev,
      reminders: [
        ...prev.reminders,
        { method: "email", minutesBefore: 30, sent: false },
      ],
    }));
  };

  const removeReminder = (index) => {
    setLocalFormData((prev) => ({
      ...prev,
      reminders: prev.reminders.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!localFormData.title.trim()) {
      errors.title = "Title is required";
    }

    if (!localFormData.date) {
      errors.date = "Date is required";
    }

    if (
      localFormData.startTime &&
      localFormData.endTime &&
      localFormData.startTime > localFormData.endTime
    ) {
      errors.endTime = "End time cannot be before start time";
    }

    if (localFormData.type === "task" && !localFormData.taskData.assignee) {
      errors.taskAssignee = "Task assignee is required";
    }

    if (localFormData.type === "email" && !localFormData.emailData.subject) {
      errors.emailSubject = "Email subject is required";
    }

    setLocalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const startDate = localFormData.date;
      const endDate = localFormData.date;

      const eventData = {
        ...localFormData,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        calendarType,
      };

      if (onSubmit) {
        await onSubmit(eventData);
        return;
      }

      const response = await fetch("http://localhost:5000/events/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(eventData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || "Failed to create event");
      }

      if (data.success) {
        toast.success("Event created successfully!");
        if (onEventCreate) {
          onEventCreate(data.event);
        }
        onClose();
      } else {
        throw new Error(data.msg || "Failed to create event");
      }
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error(error.message || "Failed to create event. Please try again.");
      setLocalErrors({
        submit: error.message || "Failed to create event. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-800/90 border border-white/10 rounded-xl w-full max-w-2xl shadow-2xl p-6 animate-fade-in overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">
            Create New {calendarType === "team" ? "Team " : ""}Event
          </h2>
          <button
            className="text-white/60 hover:text-white transition-colors"
            onClick={onClose}
          >
            <HiX className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block text-white/80 mb-1 text-sm font-medium"
              >
                Title
              </label>
              <input
                id="title"
                type="text"
                name="title"
                value={localFormData.title}
                onChange={handleChange}
                className={`w-full bg-white/5 border ${
                  localErrors.title ? "border-red-500" : "border-white/10"
                } rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                placeholder="Enter event title"
                required
              />
              {localErrors.title && (
                <p className="text-red-500 text-xs mt-1">{localErrors.title}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="type"
                  className="block text-white/80 mb-1 text-sm font-medium"
                >
                  Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={localFormData.type}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="meeting">Meeting</option>
                  <option value="task">Task</option>
                  <option value="email">Email</option>
                  <option value="personal">Personal</option>
                  <option value="deadline">Deadline</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="priority"
                  className="block text-white/80 mb-1 text-sm font-medium"
                >
                  Priority
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={localFormData.priority}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            {/* Date and Time Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="date"
                  className="block text-white/80 mb-1 text-sm font-medium"
                >
                  Date
                </label>
                <input
                  id="date"
                  type="date"
                  name="date"
                  value={localFormData.date}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isAllDay"
                  name="isAllDay"
                  checked={localFormData.isAllDay}
                  onChange={handleChange}
                  className="rounded border-white/10 text-cyan-500 focus:ring-cyan-500"
                />
                <label htmlFor="isAllDay" className="text-white/80 text-sm">
                  All Day Event
                </label>
              </div>
            </div>

            {!localFormData.isAllDay && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="startTime"
                    className="block text-white/80 mb-1 text-sm font-medium"
                  >
                    Start Time
                  </label>
                  <input
                    id="startTime"
                    type="time"
                    name="startTime"
                    value={localFormData.startTime}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="endTime"
                    className="block text-white/80 mb-1 text-sm font-medium"
                  >
                    End Time
                  </label>
                  <input
                    id="endTime"
                    type="time"
                    name="endTime"
                    value={localFormData.endTime}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>
            )}

            {/* Type-specific Fields */}
            {localFormData.type === "task" && (
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="taskAssignee"
                    className="block text-white/80 mb-1 text-sm font-medium"
                  >
                    Assignee
                  </label>
                  <select
                    id="taskAssignee"
                    name="taskData.assignee"
                    value={localFormData.taskData.assignee}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="">Select Assignee</option>
                    {teamMembers.map((member) => (
                      <option key={member._id} value={member._id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="estimatedHours"
                    className="block text-white/80 mb-1 text-sm font-medium"
                  >
                    Estimated Hours
                  </label>
                  <input
                    id="estimatedHours"
                    type="number"
                    name="taskData.estimatedHours"
                    value={localFormData.taskData.estimatedHours}
                    onChange={handleChange}
                    min="0"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>
            )}

            {localFormData.type === "email" && (
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="emailSubject"
                    className="block text-white/80 mb-1 text-sm font-medium"
                  >
                    Subject
                  </label>
                  <input
                    id="emailSubject"
                    type="text"
                    name="emailData.subject"
                    value={localFormData.emailData.subject}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="Enter email subject"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="requiresResponse"
                    name="emailData.requiresResponse"
                    checked={localFormData.emailData.requiresResponse}
                    onChange={handleChange}
                    className="rounded border-white/10 text-cyan-500 focus:ring-cyan-500"
                  />
                  <label
                    htmlFor="requiresResponse"
                    className="text-white/80 text-sm"
                  >
                    Requires Response
                  </label>
                </div>
              </div>
            )}

            {/* Description and Location */}
            <div>
              <label
                htmlFor="description"
                className="block text-white/80 mb-1 text-sm font-medium"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={localFormData.description}
                onChange={handleChange}
                rows="3"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Enter event description"
              />
            </div>

            <div>
              <label
                htmlFor="location"
                className="block text-white/80 mb-1 text-sm font-medium"
              >
                Location
              </label>
              <input
                id="location"
                type="text"
                name="location"
                value={localFormData.location}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Enter event location"
              />
            </div>

            {/* Advanced Options Toggle */}
            <button
              type="button"
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="text-cyan-500 hover:text-cyan-400 text-sm font-medium"
            >
              {showAdvancedOptions
                ? "Hide Advanced Options"
                : "Show Advanced Options"}
            </button>

            {/* Advanced Options */}
            {showAdvancedOptions && (
              <div className="space-y-4">
                {/* Recurring Event */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isRecurring"
                    name="isRecurring"
                    checked={localFormData.isRecurring}
                    onChange={handleChange}
                    className="rounded border-white/10 text-cyan-500 focus:ring-cyan-500"
                  />
                  <label
                    htmlFor="isRecurring"
                    className="text-white/80 text-sm"
                  >
                    Recurring Event
                  </label>
                </div>

                {localFormData.isRecurring && (
                  <div>
                    <label
                      htmlFor="recurrenceRule"
                      className="block text-white/80 mb-1 text-sm font-medium"
                    >
                      Recurrence Rule
                    </label>
                    <input
                      id="recurrenceRule"
                      type="text"
                      name="recurrenceRule"
                      value={localFormData.recurrenceRule}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="e.g., FREQ=WEEKLY;BYDAY=MO,WE,FR"
                    />
                  </div>
                )}

                {/* Reminders */}
                <div>
                  <label className="block text-white/80 mb-1 text-sm font-medium">
                    Reminders
                  </label>
                  <div className="space-y-2">
                    {localFormData.reminders.map((reminder, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <select
                          value={reminder.method}
                          onChange={(e) => {
                            const newReminders = [...localFormData.reminders];
                            newReminders[index].method = e.target.value;
                            setLocalFormData((prev) => ({
                              ...prev,
                              reminders: newReminders,
                            }));
                          }}
                          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                          <option value="email">Email</option>
                          <option value="push">Push Notification</option>
                          <option value="sms">SMS</option>
                        </select>
                        <input
                          type="number"
                          value={reminder.minutesBefore}
                          onChange={(e) => {
                            const newReminders = [...localFormData.reminders];
                            newReminders[index].minutesBefore = parseInt(
                              e.target.value
                            );
                            setLocalFormData((prev) => ({
                              ...prev,
                              reminders: newReminders,
                            }));
                          }}
                          className="w-24 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          placeholder="Minutes"
                        />
                        <button
                          type="button"
                          onClick={() => removeReminder(index)}
                          className="text-red-500 hover:text-red-400"
                        >
                          <HiX className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addReminder}
                      className="text-cyan-500 hover:text-cyan-400 text-sm font-medium"
                    >
                      Add Reminder
                    </button>
                  </div>
                </div>

                {/* Color */}
                <div>
                  <label
                    htmlFor="color"
                    className="block text-white/80 mb-1 text-sm font-medium"
                  >
                    Color
                  </label>
                  <input
                    id="color"
                    type="color"
                    name="color"
                    value={localFormData.color}
                    onChange={handleChange}
                    className="w-full h-10 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-white/80 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewEventModal;
