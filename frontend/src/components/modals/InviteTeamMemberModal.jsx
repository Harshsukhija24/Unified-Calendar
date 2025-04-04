import { useState, useEffect } from "react";
import { toast } from "react-toastify";

const InviteTeamMemberModal = ({ isOpen, onClose, teamId, teamName }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    message: "",
  });
  const [errors, setErrors] = useState({});

  // Reset form when modal is opened
  const resetForm = () => {
    setFormData({
      email: "",
      name: "",
      message: "",
    });
    setErrors({});
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

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
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
      const response = await fetch("http://localhost:5000/teams/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          teamId,
          email: formData.email,
          name: formData.name,
          message: formData.message,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Invitation sent successfully!");
        onClose();
        resetForm();
      } else {
        throw new Error(data.msg || "Failed to send invitation");
      }
    } catch (error) {
      console.error("Error inviting team member:", error);
      setErrors({
        submit: error.message || "Failed to send invitation. Please try again.",
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
            Invite to {teamName || "Team"}
          </h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-white mb-1"
            >
              Email Address <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-white/10 border border-white/30 rounded-md py-3 px-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              placeholder="Enter email address"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-400">{errors.email}</p>
            )}
          </div>

          {/* Name Input (Optional) */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-white mb-1"
            >
              Name (Optional)
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-white/10 border border-white/30 rounded-md py-3 px-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              placeholder="Enter recipient's name"
            />
          </div>

          {/* Message Textarea */}
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-white mb-1"
            >
              Personal Message (Optional)
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="3"
              className="w-full bg-white/10 border border-white/30 rounded-md py-3 px-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              placeholder="Add a personal message to your invitation"
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
              {isLoading ? "Sending..." : "Send Invitation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteTeamMemberModal;
