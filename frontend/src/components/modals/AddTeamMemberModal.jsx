import { useState } from "react";
import { toast } from "react-toastify";

const AddTeamMemberModal = ({
  isOpen,
  onClose,
  teamId,
  teamName,
  onMemberAdded,
}) => {
  const [loading, setLoading] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emails, setEmails] = useState([]);
  const [permissions, setPermissions] = useState("view");
  const [errors, setErrors] = useState({});
  const [processingStatus, setProcessingStatus] = useState(null);

  const resetForm = () => {
    setEmailInput("");
    setEmails([]);
    setPermissions("view");
    setErrors({});
    setProcessingStatus(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const addEmail = () => {
    const email = emailInput.trim();

    if (!email) {
      return;
    }

    if (!validateEmail(email)) {
      setErrors({
        ...errors,
        emailInput: "Please enter a valid email address",
      });
      return;
    }

    if (emails.includes(email)) {
      setErrors({ ...errors, emailInput: "This email is already added" });
      return;
    }

    setEmails([...emails, email]);
    setEmailInput("");
    setErrors({ ...errors, emailInput: null, emails: null });
  };

  const removeEmail = (email) => {
    setEmails(emails.filter((e) => e !== email));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addEmail();
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (emails.length === 0) {
      newErrors.emails = "Please add at least one email";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setProcessingStatus("Submitting request...");

    try {
      // Normalize emails to lowercase to prevent case sensitivity issues
      const normalizedEmails = emails.map((email) =>
        email.toLowerCase().trim()
      );

      setProcessingStatus(
        `Sending request to server with ${
          normalizedEmails.length
        } emails: ${normalizedEmails.join(", ")}`
      );

      const response = await fetch("http://localhost:5000/teams/members/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          teamId,
          emails: normalizedEmails, // Use normalized emails
          permissions,
        }),
      });

      setProcessingStatus("Processing server response...");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.msg || "Something went wrong");
      }

      // Handle successful response
      if (data.results) {
        const { added, notFound, alreadyMembers } = data.results;

        setProcessingStatus(
          `Found ${added.length} users to add, ${notFound.length} not found, ${alreadyMembers.length} already members.`
        );

        if (added.length > 0) {
          toast.success(
            `Successfully added ${added.length} member${
              added.length > 1 ? "s" : ""
            } to the team`
          );
        }

        if (notFound.length > 0) {
          // Enhanced warning message with more details
          toast.warning(
            <div>
              <p>
                <strong>
                  {notFound.length} email(s) not found in the system:
                </strong>
              </p>
              <ul style={{ marginTop: "5px", marginLeft: "10px" }}>
                {notFound.map((email, idx) => (
                  <li key={idx} style={{ marginBottom: "3px" }}>
                    • {email}
                  </li>
                ))}
              </ul>
              <p style={{ marginTop: "5px" }}>
                Users must first register in the system before they can be
                added. Check if the email is typed correctly and that the user
                has an account.
              </p>
            </div>,
            { autoClose: false } // Keep open until user closes manually
          );
        }

        if (alreadyMembers.length > 0) {
          toast.info(
            `${alreadyMembers.length} email${
              alreadyMembers.length > 1 ? "s" : ""
            } already in the team: ${alreadyMembers.join(", ")}`
          );
        }
      } else {
        toast.success("Team members added successfully");
      }

      resetForm();
      if (data.team) {
        onMemberAdded(data.team);
      } else {
        // If the team data is not available in the response, refresh teams manually
        toast.info("Team updated, refreshing team data...");
        setTimeout(() => window.location.reload(), 1500);
      }
      onClose();
    } catch (error) {
      console.error("Error adding team members:", error);
      const errorMessage = error.message || "Failed to add team members";

      // Show a more detailed error message
      toast.error(
        <div>
          <p>
            <strong>Error:</strong> {errorMessage}
          </p>
          <p style={{ marginTop: "5px" }}>Please check that:</p>
          <ul style={{ marginTop: "5px", marginLeft: "10px" }}>
            <li>• The email addresses are correctly typed</li>
            <li>• The users have registered accounts in the system</li>
            <li>• Your authentication session is still valid</li>
          </ul>
        </div>,
        { autoClose: false }
      );

      // Check for authentication errors
      if (
        errorMessage.includes("Authentication required") ||
        errorMessage.includes("Invalid or expired token")
      ) {
        toast.error("Your session has expired. Please login again.");
        // Optionally redirect to login
        // window.location.href = "/login";
      }

      setProcessingStatus("Error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl border border-white/10 w-full max-w-md max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center border-b border-white/10 p-5">
          <h3 className="text-xl font-semibold text-white">
            Add Members to {teamName}
          </h3>
          <button
            className="text-white/70 hover:text-white"
            onClick={handleClose}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5">
          <div className="mb-5">
            <label
              htmlFor="emailInput"
              className="block text-sm font-medium text-white mb-1"
            >
              Add Emails
            </label>
            <div className="flex items-center">
              <input
                type="text"
                id="emailInput"
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                  if (errors.emailInput) {
                    setErrors({ ...errors, emailInput: null });
                  }
                }}
                onKeyDown={handleKeyDown}
                placeholder="Enter email address"
                className="block w-full bg-gray-700/50 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
              />
              <button
                type="button"
                onClick={addEmail}
                className="ml-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium rounded-lg p-2.5 transition-colors"
              >
                Add
              </button>
            </div>
            {errors.emailInput && (
              <p className="mt-1 text-sm text-red-400">{errors.emailInput}</p>
            )}
          </div>

          {emails.length > 0 && (
            <div className="mb-5">
              <label className="block text-sm font-medium text-white mb-1">
                Email List
              </label>
              <div className="bg-gray-700/30 border border-white/10 rounded-lg p-3">
                <ul className="space-y-2">
                  {emails.map((email, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center text-white/90 text-sm bg-gray-700/50 rounded-lg p-2"
                    >
                      <span>{email}</span>
                      <button
                        type="button"
                        onClick={() => removeEmail(email)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              {errors.emails && (
                <p className="mt-1 text-sm text-red-400">{errors.emails}</p>
              )}
            </div>
          )}

          <div className="mb-5">
            <label
              htmlFor="permissions"
              className="block text-sm font-medium text-white mb-1"
            >
              Permissions
            </label>
            <select
              id="permissions"
              value={permissions}
              onChange={(e) => setPermissions(e.target.value)}
              className="block w-full bg-gray-700/50 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
            >
              <option value="view">View Only</option>
              <option value="edit">Can Edit</option>
            </select>
            <p className="mt-1 text-xs text-white/60">
              {permissions === "view"
                ? "View Only: Members can view team events but cannot create or edit them."
                : "Can Edit: Members can create and edit team events."}
            </p>
          </div>

          {processingStatus && (
            <div className="mb-4 p-3 bg-gray-700/50 border border-white/10 rounded-lg">
              <p className="text-sm text-white/80">{processingStatus}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-700 hover:bg-gray-600 text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white transition-all ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Adding..." : "Add Members"}
            </button>
          </div>

          <div className="mt-4 text-xs text-white/60">
            <p>
              Note: You can only add users who have already registered in the
              system.
            </p>
            <p>If a user is not found, they need to create an account first.</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTeamMemberModal;
