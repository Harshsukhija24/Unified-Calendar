import React, { useState } from "react";
import { UserStatusModal, NewEventModal } from "../modals";
import { useNavigate } from "react-router-dom";
import { HiShare, HiDownload, HiUserGroup, HiCalendar } from "react-icons/hi";

const CalendarSidebar = ({
  filters,
  onFilterChange,
  calendarType,
  userStatus,
  onToggleStatus,
  onEventCreate,
  teams,
  onShare,
  onExport,
}) => {
  const navigate = useNavigate();
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [shareData, setShareData] = useState({
    teamId: "",
    permission: "view",
    startDate: "",
    endDate: "",
  });

  const openStatusModal = () => {
    setIsStatusModalOpen(true);
  };

  const closeStatusModal = () => {
    setIsStatusModalOpen(false);
  };

  const openNewEventModal = () => {
    setIsNewEventModalOpen(true);
  };

  const closeNewEventModal = () => {
    setIsNewEventModalOpen(false);
  };

  const handleShareChange = (e) => {
    const { name, value } = e.target;
    setShareData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleShareSubmit = (e) => {
    e.preventDefault();
    onShare(shareData);
    setShareModalOpen(false);
  };

  const handleExportSubmit = (e) => {
    e.preventDefault();
    onExport({
      format: e.target.format.value,
      startDate: e.target.startDate.value,
      endDate: e.target.endDate.value,
    });
    setExportModalOpen(false);
  };

  // Get user name from localStorage or use default
  const userName = localStorage.getItem("userName") || "User";
  // Get first letter of first and last name for avatar
  const nameParts = userName.split(" ");
  const initials =
    nameParts.length > 1 ? `${nameParts[0][0]}${nameParts[1][0]}` : userName[0];

  return (
    <div className="calendar-sidebar w-full md:w-72 bg-gray-900/30 backdrop-blur-md border-r border-white/10 p-6">
      <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
        <span className="text-cyan-400 mr-2">Uni</span>Cal
        <span className="ml-2 text-sm bg-white/10 px-2 py-0.5 rounded-md text-white/70">
          {calendarType === "personal" ? "Personal" : "Team"}
        </span>
      </h2>

      {/* User Status */}
      <div className="mb-8 bg-white/5 p-3 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-white font-medium mr-3">
              {initials}
            </div>
            <div>
              <h3 className="text-white text-sm font-medium">{userName}</h3>
              <p className="text-white/60 text-xs">
                {calendarType === "team" ? "Team Member" : "Calendar User"}
              </p>
            </div>
          </div>
          <button
            onClick={openStatusModal}
            className={`px-2 py-1 rounded-full flex items-center ${
              userStatus === "available"
                ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
            } transition-all`}
          >
            <span
              className={`h-2 w-2 rounded-full mr-1.5 ${
                userStatus === "available" ? "bg-green-500" : "bg-red-500"
              }`}
            ></span>
            <span className="text-xs font-medium">
              {userStatus === "available" ? "Available" : "Unavailable"}
            </span>
          </button>
        </div>
      </div>

      <nav className="space-y-2 mb-10">
        <button
          onClick={() => navigate("/dashboard")}
          className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg bg-cyan-600/40 text-white shadow-md"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-3 text-cyan-300"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
              clipRule="evenodd"
            />
          </svg>
          Calendar
        </button>

        <button
          onClick={() => navigate("/teams")}
          className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all group"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-3 text-white/60 group-hover:text-cyan-300 transition-colors"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
          </svg>
          Teams
        </button>

        {calendarType === "team" && (
          <button
            onClick={() => navigate("/teams")}
            className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-3 text-white/60 group-hover:text-cyan-300 transition-colors"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            Team Members
          </button>
        )}

        <button className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all group">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-3 text-white/60 group-hover:text-cyan-300 transition-colors"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path
              fillRule="evenodd"
              d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
              clipRule="evenodd"
            />
          </svg>
          Tasks
        </button>

        <button className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all group">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-3 text-white/60 group-hover:text-cyan-300 transition-colors"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
          Messages
        </button>
      </nav>

      <div className="calendar-filters mb-10">
        <h3 className="text-xs uppercase tracking-wider text-white/50 font-semibold mb-4 px-2">
          Calendar Filters
        </h3>
        <div className="space-y-3 bg-white/5 rounded-lg p-3">
          <label className="flex items-center text-sm text-white/80 cursor-pointer group">
            <input
              type="checkbox"
              className="form-checkbox mr-3 h-4 w-4 rounded bg-white/10 border-white/30 text-cyan-500 focus:ring-cyan-500"
              checked={filters.meeting}
              onChange={() => onFilterChange("meeting")}
            />
            <span className="group-hover:text-white transition-colors">
              Meetings
            </span>
          </label>

          <label className="flex items-center text-sm text-white/80 cursor-pointer group">
            <input
              type="checkbox"
              className="form-checkbox mr-3 h-4 w-4 rounded bg-white/10 border-white/30 text-cyan-500 focus:ring-cyan-500"
              checked={filters.task}
              onChange={() => onFilterChange("task")}
            />
            <span className="group-hover:text-white transition-colors">
              Tasks
            </span>
          </label>

          <label className="flex items-center text-sm text-white/80 cursor-pointer group">
            <input
              type="checkbox"
              className="form-checkbox mr-3 h-4 w-4 rounded bg-white/10 border-white/30 text-cyan-500 focus:ring-cyan-500"
              checked={filters.personal}
              onChange={() => onFilterChange("personal")}
            />
            <span className="group-hover:text-white transition-colors">
              {calendarType === "personal" ? "Personal" : "Team Events"}
            </span>
          </label>

          <label className="flex items-center text-sm text-white/80 cursor-pointer group">
            <input
              type="checkbox"
              className="form-checkbox mr-3 h-4 w-4 rounded bg-white/10 border-white/30 text-cyan-500 focus:ring-cyan-500"
              checked={filters.deadline}
              onChange={() => onFilterChange("deadline")}
            />
            <span className="group-hover:text-white transition-colors">
              Deadlines
            </span>
          </label>
        </div>
      </div>

      <div className="quick-actions">
        <h3 className="text-xs uppercase tracking-wider text-white/50 font-semibold mb-4 px-2">
          Quick Actions
        </h3>
        <div className="space-y-3">
          <button
            onClick={openNewEventModal}
            className="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white py-3 px-4 rounded-lg text-sm font-medium transition-all shadow-lg hover:shadow-xl flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            New {calendarType === "personal" ? "Event" : "Team Event"}
          </button>

          {calendarType === "team" && (
            <button
              onClick={() => navigate("/teams")}
              className="w-full bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
              </svg>
              Invite Team Member
            </button>
          )}

          <button
            onClick={onToggleStatus}
            className={`w-full py-3 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center border ${
              userStatus === "available"
                ? "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
                : "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full mr-2 ${
                userStatus === "available" ? "bg-red-500" : "bg-green-500"
              }`}
            ></span>
            {userStatus === "available"
              ? "Set as Unavailable"
              : "Set as Available"}
          </button>
        </div>
      </div>

      {/* User Status Modal */}
      <UserStatusModal
        isOpen={isStatusModalOpen}
        onClose={closeStatusModal}
        currentStatus={userStatus}
        onStatusChange={onToggleStatus}
      />

      {/* New Event Modal */}
      <NewEventModal
        isOpen={isNewEventModalOpen}
        onClose={closeNewEventModal}
        calendarType={calendarType}
        onEventCreate={onEventCreate}
      />

      {/* Share Calendar */}
      <div>
        <button
          onClick={() => setShareModalOpen(true)}
          className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <HiShare className="h-5 w-5 mr-2" />
          Share Calendar
        </button>
      </div>

      {/* Export Calendar */}
      <div>
        <button
          onClick={() => setExportModalOpen(true)}
          className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <HiDownload className="h-5 w-5 mr-2" />
          Export Calendar
        </button>
      </div>

      {/* Share Modal */}
      {shareModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Share Calendar</h3>
              <button
                onClick={() => setShareModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleShareSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Team
                </label>
                <select
                  name="teamId"
                  value={shareData.teamId}
                  onChange={handleShareChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Team</option>
                  {teams.map((team) => (
                    <option key={team._id} value={team._id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Permission
                </label>
                <select
                  name="permission"
                  value={shareData.permission}
                  onChange={handleShareChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="view">View Only</option>
                  <option value="edit">Can Edit</option>
                  <option value="manage">Can Manage</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={shareData.startDate}
                    onChange={handleShareChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={shareData.endDate}
                    onChange={handleShareChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Share
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {exportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Export Calendar</h3>
              <button
                onClick={() => setExportModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleExportSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Format
                </label>
                <select
                  name="format"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="ics">iCalendar (.ics)</option>
                  <option value="csv">CSV</option>
                  <option value="json">JSON</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Export
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarSidebar;
