const CalendarLegend = ({ filters, onFilterChange }) => {
  return (
    <div className="calendar-legend flex flex-wrap gap-4 mb-8 bg-white/5 p-4 rounded-xl border border-white/10">
      <h3 className="w-full text-sm font-semibold text-white/80 mb-2 uppercase tracking-wider">
        Event Categories
      </h3>

      <div className="flex items-center px-3 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-all cursor-pointer">
        <div className="relative w-5 h-5 mr-3">
          {onFilterChange ? (
            <input
              type="checkbox"
              className="absolute opacity-0 w-full h-full cursor-pointer z-10"
              checked={filters.meeting}
              onChange={() => onFilterChange("meeting")}
            />
          ) : null}
          <div
            className={`w-4 h-4 rounded-full bg-blue-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-opacity ${
              filters?.meeting === false ? "opacity-30" : ""
            }`}
          ></div>
        </div>
        <span
          className={`text-sm font-medium ${
            filters?.meeting === false ? "text-white/50" : "text-white/90"
          }`}
        >
          Meetings
        </span>
      </div>

      <div className="flex items-center px-3 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-all cursor-pointer">
        <div className="relative w-5 h-5 mr-3">
          {onFilterChange ? (
            <input
              type="checkbox"
              className="absolute opacity-0 w-full h-full cursor-pointer z-10"
              checked={filters.task}
              onChange={() => onFilterChange("task")}
            />
          ) : null}
          <div
            className={`w-4 h-4 rounded-full bg-green-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-opacity ${
              filters?.task === false ? "opacity-30" : ""
            }`}
          ></div>
        </div>
        <span
          className={`text-sm font-medium ${
            filters?.task === false ? "text-white/50" : "text-white/90"
          }`}
        >
          Tasks
        </span>
      </div>

      <div className="flex items-center px-3 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-all cursor-pointer">
        <div className="relative w-5 h-5 mr-3">
          {onFilterChange ? (
            <input
              type="checkbox"
              className="absolute opacity-0 w-full h-full cursor-pointer z-10"
              checked={filters.personal}
              onChange={() => onFilterChange("personal")}
            />
          ) : null}
          <div
            className={`w-4 h-4 rounded-full bg-purple-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-opacity ${
              filters?.personal === false ? "opacity-30" : ""
            }`}
          ></div>
        </div>
        <span
          className={`text-sm font-medium ${
            filters?.personal === false ? "text-white/50" : "text-white/90"
          }`}
        >
          Personal
        </span>
      </div>

      <div className="flex items-center px-3 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-all cursor-pointer">
        <div className="relative w-5 h-5 mr-3">
          {onFilterChange ? (
            <input
              type="checkbox"
              className="absolute opacity-0 w-full h-full cursor-pointer z-10"
              checked={filters.deadline}
              onChange={() => onFilterChange("deadline")}
            />
          ) : null}
          <div
            className={`w-4 h-4 rounded-full bg-red-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-opacity ${
              filters?.deadline === false ? "opacity-30" : ""
            }`}
          ></div>
        </div>
        <span
          className={`text-sm font-medium ${
            filters?.deadline === false ? "text-white/50" : "text-white/90"
          }`}
        >
          Deadlines
        </span>
      </div>
    </div>
  );
};

export default CalendarLegend;
