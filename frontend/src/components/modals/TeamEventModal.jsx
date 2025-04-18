import { useState, useEffect } from "react";
import { toast } from "react-toastify";

const TeamEventModal = ({
  isOpen,
  onClose,
  teamId,
  teamName,
  onEventCreate,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    type: "meeting",
    description: "",
  });
  const [errors, setErrors] = useState({});

  // Reset form when modal is opened
  const resetForm = () => {
    const today = new Date();
    setFormData({
      title: "",
      startDate: formatDateForInput(today),
      endDate: formatDateForInput(today),
      startTime: "09:00",
      endTime: "10:00",
      type: "meeting",
      description: "",
    });
    setErrors({});
  };

  // Format the date for the date input field
  const formatDateForInput = (date) => {
    const d = new Date(date);
    let month = "" + (d.getMonth() + 1);
    let day = "" + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear specific error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    }

    if (!formData.startTime) {
      newErrors.startTime = "Start time is required";
    }

    if (!formData.endTime) {
      newErrors.endTime = "End time is required";
    }

    // Validate that end date is not before start date
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        newErrors.endDate = "End date cannot be before start date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Combine dates and times for the backend
      const startDateTime = new Date(
        `${formData.startDate}T${formData.startTime}`
      );
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

      const eventData = {
        teamId,
        title: formData.title,
        date: startDateTime.toISOString(), // For backward compatibility
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        startTime: formData.startTime,
        endTime: formData.endTime,
        type: formData.type,
        description: formData.description,
      };

      const response = await fetch("http://localhost:5000/teams/event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(eventData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Team event created successfully!");

        // Call the onEventCreate callback with the new event data
        if (onEventCreate) {
          onEventCreate(data.event);
        }

        // Close the modal
        onClose();
        resetForm();
      } else {
        throw new Error(data.msg || "Failed to create team event");
      }
    } catch (error) {
      console.error("Error creating team event:", error);
      setErrors({
        submit:
          error.message || "Failed to create team event. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form when modal is opened
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gray-900/90 border border-white/20 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 backdrop-blur-md z-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            New Event for {teamName || "Team"}
          </h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Input */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-white mb-1"
            >
              Event Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full bg-white/10 border border-white/30 rounded-md py-3 px-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              placeholder="Enter event title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-400">{errors.title}</p>
            )}
          </div>

          {/* Start Date and Time Inputs */}
          <div>
            <h3 className="text-sm font-medium text-white/80 mb-2">Start</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="startDate"
                  className="block text-sm font-medium text-white mb-1"
                >
                  Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full bg-white/10 border border-white/30 rounded-md py-3 px-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.startDate}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="startTime"
                  className="block text-sm font-medium text-white mb-1"
                >
                  Time
                </label>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="w-full bg-white/10 border border-white/30 rounded-md py-3 px-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                />
                {errors.startTime && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.startTime}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* End Date and Time Inputs */}
          <div>
            <h3 className="text-sm font-medium text-white/80 mb-2">End</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="endDate"
                  className="block text-sm font-medium text-white mb-1"
                >
                  Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full bg-white/10 border border-white/30 rounded-md py-3 px-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-400">{errors.endDate}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="endTime"
                  className="block text-sm font-medium text-white mb-1"
                >
                  Time
                </label>
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className="w-full bg-white/10 border border-white/30 rounded-md py-3 px-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                />
                {errors.endTime && (
                  <p className="mt-1 text-sm text-red-400">{errors.endTime}</p>
                )}
              </div>
            </div>
          </div>

          {/* Event Type Select */}
          <div>
            <label
              htmlFor="type"
              className="block text-sm font-medium text-white mb-1"
            >
              Event Type
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full bg-white/10 border border-white/30 rounded-md py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
            >
              <option value="meeting">Meeting</option>
              <option value="task">Task</option>
              <option value="deadline">Deadline</option>
              <option value="personal">Team Event</option>
            </select>
          </div>

          {/* Description Textarea */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-white mb-1"
            >
              Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full bg-white/10 border border-white/30 rounded-md py-3 px-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              placeholder="Add details about the event"
            ></textarea>
          </div>

          {errors.submit && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-md">
              <p className="text-sm text-red-400">{errors.submit}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white transition-all ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? "Creating..." : "Create Team Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamEventModal;
