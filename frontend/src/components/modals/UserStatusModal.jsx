import { useState, useEffect } from "react";

const UserStatusModal = ({
  isOpen,
  onClose,
  currentStatus,
  onStatusChange,
}) => {
  const [status, setStatus] = useState(currentStatus || "available");

  // Update local state when the prop changes
  useEffect(() => {
    if (currentStatus) {
      setStatus(currentStatus);
    }
  }, [currentStatus]);

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
  };

  const handleSave = () => {
    onStatusChange(status);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gray-900/90 border border-white/20 rounded-xl shadow-xl max-w-md w-full p-6 backdrop-blur-md z-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Update Status</h2>
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

        <div className="mb-6">
          <p className="text-white/70 mb-4">Select your availability status:</p>

          <div className="space-y-3">
            <button
              className={`w-full flex items-center px-4 py-4 rounded-lg text-base font-medium transition-all ${
                status === "available"
                  ? "bg-green-600/30 border-2 border-green-500 text-white"
                  : "bg-white/10 border border-white/20 text-white/80 hover:bg-white/20"
              }`}
              onClick={() => handleStatusChange("available")}
            >
              <span className="h-3 w-3 rounded-full bg-green-500 mr-3"></span>
              <div className="flex flex-col items-start">
                <span>Available</span>
                <span className="text-xs text-white/60 mt-1">
                  You are visible to team members and can receive notifications
                </span>
              </div>
            </button>

            <button
              className={`w-full flex items-center px-4 py-4 rounded-lg text-base font-medium transition-all ${
                status === "unavailable"
                  ? "bg-red-600/30 border-2 border-red-500 text-white"
                  : "bg-white/10 border border-white/20 text-white/80 hover:bg-white/20"
              }`}
              onClick={() => handleStatusChange("unavailable")}
            >
              <span className="h-3 w-3 rounded-full bg-red-500 mr-3"></span>
              <div className="flex flex-col items-start">
                <span>Unavailable</span>
                <span className="text-xs text-white/60 mt-1">
                  You appear offline to team members
                </span>
              </div>
            </button>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white transition-all"
          >
            Save Status
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserStatusModal;
