import React from "react";
import {
  HiCalendar,
  HiFilter,
  HiViewGrid,
  HiViewList,
  HiViewBoards,
} from "react-icons/hi";

const CalendarControls = ({
  view,
  setView,
  filters,
  setFilters,
  calendarType,
  setCalendarType,
  selectedTeam,
  setSelectedTeam,
  teams,
}) => {
  const handleFilterChange = (type) => {
    setFilters((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* View Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setView("day")}
            className={`p-2 rounded-lg ${
              view === "day" ? "bg-blue-100 text-blue-600" : "text-gray-600"
            }`}
          >
            <HiViewList className="h-5 w-5" />
          </button>
          <button
            onClick={() => setView("week")}
            className={`p-2 rounded-lg ${
              view === "week" ? "bg-blue-100 text-blue-600" : "text-gray-600"
            }`}
          >
            <HiViewBoards className="h-5 w-5" />
          </button>
          <button
            onClick={() => setView("month")}
            className={`p-2 rounded-lg ${
              view === "month" ? "bg-blue-100 text-blue-600" : "text-gray-600"
            }`}
          >
            <HiViewGrid className="h-5 w-5" />
          </button>
        </div>

        {/* Calendar Type Toggle */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCalendarType("personal")}
            className={`px-3 py-1 rounded-lg ${
              calendarType === "personal"
                ? "bg-blue-100 text-blue-600"
                : "text-gray-600"
            }`}
          >
            Personal
          </button>
          <button
            onClick={() => setCalendarType("team")}
            className={`px-3 py-1 rounded-lg ${
              calendarType === "team"
                ? "bg-blue-100 text-blue-600"
                : "text-gray-600"
            }`}
          >
            Team
          </button>
        </div>

        {/* Team Selection */}
        {calendarType === "team" && (
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="px-3 py-1 border rounded-lg"
          >
            <option value="">Select Team</option>
            {teams.map((team) => (
              <option key={team._id} value={team._id}>
                {team.name}
              </option>
            ))}
          </select>
        )}

        {/* Filters */}
        <div className="flex items-center space-x-2">
          <HiFilter className="h-5 w-5 text-gray-600" />
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([type, enabled]) => (
              <button
                key={type}
                onClick={() => handleFilterChange(type)}
                className={`px-3 py-1 rounded-lg text-sm ${
                  enabled ? "bg-blue-100 text-blue-600" : "text-gray-600"
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarControls;
