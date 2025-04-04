import React, { useState, useEffect } from "react";
import { HiX, HiMail, HiClock, HiCalendar } from "react-icons/hi";

const EmailModal = ({
  isOpen,
  onClose,
  onSubmit,
  email,
  teams,
  teamMembers,
}) => {
  const [formData, setFormData] = useState({
    subject: "",
    sender: "",
    recipients: [],
    dueDate: "",
    responseRequired: false,
    responseDeadline: "",
    priority: "medium",
    status: "pending",
    teamId: "",
    tags: [],
    attachments: [],
  });

  useEffect(() => {
    if (email) {
      setFormData({
        ...email,
        dueDate: email.dueDate
          ? new Date(email.dueDate).toISOString().slice(0, 16)
          : "",
        responseDeadline: email.responseDeadline
          ? new Date(email.responseDeadline).toISOString().slice(0, 16)
          : "",
      });
    }
  }, [email]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleRecipientChange = (e) => {
    const { value } = e.target;
    if (value && !formData.recipients.includes(value)) {
      setFormData((prev) => ({
        ...prev,
        recipients: [...prev.recipients, value],
      }));
    }
  };

  const handleTagChange = (e) => {
    const { value } = e.target;
    if (value && !formData.tags.includes(value)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, value],
      }));
    }
  };

  const removeRecipient = (recipientToRemove) => {
    setFormData((prev) => ({
      ...prev,
      recipients: prev.recipients.filter((r) => r !== recipientToRemove),
    }));
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...files],
    }));
  };

  const removeAttachment = (attachmentToRemove) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((a) => a !== attachmentToRemove),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">
            {email ? "Edit Email" : "Create Email"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <HiX className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Sender
              </label>
              <input
                type="email"
                name="sender"
                value={formData.sender}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Recipients
              </label>
              <select
                name="recipients"
                onChange={handleRecipientChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select Recipients</option>
                {teamMembers.map((member) => (
                  <option key={member._id} value={member.email}>
                    {member.name} ({member.email})
                  </option>
                ))}
              </select>
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.recipients.map((recipient) => (
                  <span
                    key={recipient}
                    className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {recipient}
                    <button
                      type="button"
                      onClick={() => removeRecipient(recipient)}
                      className="ml-1 text-blue-500 hover:text-blue-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Due Date
              </label>
              <input
                type="datetime-local"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Response Requirements */}
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="responseRequired"
                checked={formData.responseRequired}
                onChange={handleChange}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Response Required
              </span>
            </label>

            {formData.responseRequired && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Response Deadline
                </label>
                <input
                  type="datetime-local"
                  name="responseDeadline"
                  value={formData.responseDeadline}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          {/* Team */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Team
            </label>
            <select
              name="teamId"
              value={formData.teamId}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select Team</option>
              {teams.map((team) => (
                <option key={team._id} value={team._id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tags
            </label>
            <input
              type="text"
              name="tags"
              onChange={handleTagChange}
              placeholder="Add a tag and press Enter"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Attachments
            </label>
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <div className="mt-2 space-y-2">
              {formData.attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                >
                  <span className="text-sm text-gray-600">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(file)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {email ? "Update Email" : "Create Email"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailModal;
