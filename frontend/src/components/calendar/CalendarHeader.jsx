import { format } from "date-fns";

const CalendarHeader = ({
  date,
  view,
  onViewChange,
  onDateChange,
  onTodayClick,
}) => {
  const handlePrevious = () => {
    const newDate = new Date(date);
    if (view === "day") {
      newDate.setDate(date.getDate() - 1);
    } else if (view === "week") {
      newDate.setDate(date.getDate() - 7);
    } else {
      newDate.setMonth(date.getMonth() - 1);
    }
    onDateChange(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(date);
    if (view === "day") {
      newDate.setDate(date.getDate() + 1);
    } else if (view === "week") {
      newDate.setDate(date.getDate() + 7);
    } else {
      newDate.setMonth(date.getMonth() + 1);
    }
    onDateChange(newDate);
  };

  return (
    <div className="calendar-header flex flex-col space-y-5 md:flex-row md:items-center md:justify-between md:space-y-0 mb-8 bg-white/5 p-4 rounded-xl border border-white/10 shadow-sm">
      <div className="flex items-center space-x-4">
        <button
          onClick={onTodayClick}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white text-sm font-medium transition-colors shadow-md hover:shadow-lg"
        >
          Today
        </button>
        <div className="flex bg-white/5 rounded-lg overflow-hidden border border-white/10">
          <button
            onClick={handlePrevious}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Previous"
          >
            <path
              fillRule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </button>
          <button
            onClick={handleNext}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Next"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </button>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-white order-first md:order-none tracking-wide">
        {view === "day"
          ? format(date, "MMMM d, yyyy")
          : view === "week"
          ? `Week of ${format(date, "MMMM d, yyyy")}`
          : format(date, "MMMM yyyy")}
      </h2>

      <div className="flex bg-white/10 rounded-lg overflow-hidden shadow-md">
        <button
          onClick={() => onViewChange("day")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            view === "day"
              ? "bg-cyan-600 text-white shadow-inner"
              : "text-white/80 hover:bg-white/20 hover:text-white"
          }`}
        >
          Day
        </button>
        <button
          onClick={() => onViewChange("week")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            view === "week"
              ? "bg-cyan-600 text-white shadow-inner"
              : "text-white/80 hover:bg-white/20 hover:text-white"
          }`}
        >
          Week
        </button>
        <button
          onClick={() => onViewChange("month")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            view === "month"
              ? "bg-cyan-600 text-white shadow-inner"
              : "text-white/80 hover:bg-white/20 hover:text-white"
          }`}
        >
          Month
        </button>
      </div>
    </div>
  );
};

export default CalendarHeader;
