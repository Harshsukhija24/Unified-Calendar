import React, { useState, useEffect } from "react";
import { HiX, HiUserGroup, HiClock, HiCalendar } from "react-icons/hi";

const TaskModal = ({ isOpen, onClose, onSubmit, task, teams, teamMembers }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    assignee: "",
    teamId: "",
    priority: "medium",
    status: "pending",
    estimatedHours: 0,
    progress: 0,
    dependencies: [],
    tags: [],
  });

  useEffect(() => {
    if (task) {
      setFormData({
        ...task,
        dueDate: task.dueDate
          ? new Date(task.dueDate).toISOString().slice(0, 16)
          : "",
      });
    }
  }, [task]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
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

  const handleDependencyChange = (e) => {
    const { value } = e.target;
    if (value && !formData.dependencies.includes(value)) {
      setFormData((prev) => ({
        ...prev,
        dependencies: [...prev.dependencies, value],
      }));
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const removeDependency = (dependencyToRemove) => {
    setFormData((prev) => ({
      ...prev,
      dependencies: prev.dependencies.filter(
        (dep) => dep !== dependencyToRemove
      ),
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
            {task ? "Edit Task" : "Create Task"}
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
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

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
          </div>

          {/* Team and Assignee */}
          <div className="grid grid-cols-2 gap-4">
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

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Assignee
              </label>
              <select
                name="assignee"
                value={formData.assignee}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select Assignee</option>
                {teamMembers.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Task Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Estimated Hours
              </label>
              <input
                type="number"
                name="estimatedHours"
                value={formData.estimatedHours}
                onChange={handleChange}
                min="0"
                step="0.5"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Progress
              </label>
              <input
                type="range"
                name="progress"
                value={formData.progress}
                onChange={handleChange}
                min="0"
                max="100"
                className="mt-1 block w-full"
              />
              <span className="text-sm text-gray-500">
                {formData.progress}%
              </span>
            </div>
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

          {/* Dependencies */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Dependencies
            </label>
            <select
              name="dependencies"
              onChange={handleDependencyChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select Dependency</option>
              {tasks
                .filter((t) => t._id !== task?._id)
                .map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.title}
                  </option>
                ))}
            </select>
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.dependencies.map((depId) => {
                const depTask = tasks.find((t) => t._id === depId);
                return depTask ? (
                  <span
                    key={depId}
                    className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {depTask.title}
                    <button
                      type="button"
                      onClick={() => removeDependency(depId)}
                      className="ml-1 text-blue-500 hover:text-blue-700"
                    >
                      ×
                    </button>
                  </span>
                ) : null;
              })}
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
              {task ? "Update Task" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
