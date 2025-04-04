import { useState, useEffect } from "react";
import { toast } from "react-toastify";

const CreateTeamModal = ({ isOpen, onClose, onTeamCreate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState({});

  // Reset form when modal is opened
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
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

    if (!formData.name.trim()) {
      newErrors.name = "Team name is required";
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
      const response = await fetch("http://localhost:5000/teams/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Team created successfully!");

        // Call the onTeamCreate callback with the new team data
        if (onTeamCreate) {
          onTeamCreate(data.team);
        }

        // Close the modal
        onClose();
        resetForm();
      } else {
        throw new Error(data.msg || "Failed to create team");
      }
    } catch (error) {
      console.error("Error creating team:", error);
      setErrors({
        submit: error.message || "Failed to create team. Please try again.",
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
          <h2 className="text-2xl font-bold text-white">Create New Team</h2>
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
          {/* Team Name Input */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-white mb-1"
            >
              Team Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-white/10 border border-white/30 rounded-md py-3 px-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              placeholder="Enter team name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-400">{errors.name}</p>
            )}
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
              placeholder="Describe what this team is about"
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
              {isLoading ? "Creating..." : "Create Team"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTeamModal;
