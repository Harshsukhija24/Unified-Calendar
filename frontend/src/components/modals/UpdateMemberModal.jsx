import { useState, useEffect } from "react";
import { toast } from "react-toastify";

const UpdateMemberModal = ({
  isOpen,
  onClose,
  teamId,
  member,
  onMemberUpdated,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    role: "member",
    permissions: "view",
  });
  const [errors, setErrors] = useState({});

  // Initialize form data when member changes
  useEffect(() => {
    if (member) {
      setFormData({
        role: member.role || "member",
        permissions: member.permissions || "view",
      });
    }
  }, [member]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/teams/members/update",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({
            teamId,
            memberId: member.user._id,
            role: formData.role,
            permissions: formData.permissions,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Team member updated successfully!");

        if (onMemberUpdated) {
          onMemberUpdated(data.team);
        }

        onClose();
      } else {
        throw new Error(data.msg || "Failed to update team member");
      }
    } catch (error) {
      console.error("Error updating team member:", error);
      setErrors({
        submit:
          error.message || "Failed to update team member. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !member) return null;

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
            Update Member Settings
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

        <div className="mb-6">
          <h3 className="text-xl font-medium text-white">{member.user.name}</h3>
          <p className="text-white/70">{member.user.email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Select */}
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-white mb-1"
            >
              Role
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full bg-white/10 border border-white/30 rounded-md py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Permissions Select */}
          <div>
            <label
              htmlFor="permissions"
              className="block text-sm font-medium text-white mb-1"
            >
              Permissions
            </label>
            <select
              id="permissions"
              name="permissions"
              value={formData.permissions}
              onChange={handleChange}
              className="w-full bg-white/10 border border-white/30 rounded-md py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
            >
              <option value="view">View Only</option>
              <option value="edit">Can Edit Events</option>
            </select>
            <p className="mt-1 text-xs text-white/60">
              View Only: Member can only view team events
              <br />
              Can Edit: Member can create and edit team events
            </p>
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
              {isLoading ? "Updating..." : "Update Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateMemberModal;
