import React, { useState } from "react";
import { HiX } from "react-icons/hi";

const UserStatusModal = ({
  isOpen,
  onClose,
  currentStatus,
  onStatusChange,
}) => {
  const [status, setStatus] = useState(currentStatus);

  const handleSubmit = (e) => {
    e.preventDefault();
    onStatusChange(status);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Update Status</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <HiX className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="out-of-office">Out of Office</option>
              <option value="tentative">Tentative</option>
            </select>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Update Status
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserStatusModal;
