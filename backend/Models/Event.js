import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    // New fields for more granular time management
    startDate: {
      type: Date,
      default: function () {
        return this.date;
      },
    },
    endDate: {
      type: Date,
      default: function () {
        // Default to same day as start date if not provided
        return this.startDate;
      },
    },
    startTime: {
      type: String,
      default: "09:00", // Default to 9 AM
    },
    endTime: {
      type: String,
      default: "10:00", // Default to 10 AM (1 hour event)
    },
    type: {
      type: String,
      enum: ["meeting", "task", "personal", "deadline", "email"],
      default: "meeting",
    },
    description: {
      type: String,
      trim: true,
    },
    calendarType: {
      type: String,
      enum: ["personal", "team"],
      default: "personal",
    },
    // Reference to team if it's a team event
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      // Only required if calendarType is 'team'
      required: function () {
        return this.calendarType === "team";
      },
    },
    // For personal events, reference the user
    // For team events, reference the user who created the event
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // For team events, this will contain the list of team members
    // who have confirmed attendance
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed", "cancelled"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    isAllDay: {
      type: Boolean,
      default: false,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurrenceRule: {
      type: String,
      // Store recurrence rule in iCalendar format
      // Example: "FREQ=WEEKLY;BYDAY=MO,WE,FR"
    },
    location: {
      type: String,
      trim: true,
    },
    color: {
      type: String,
      default: "#3B82F6", // Default blue color
    },
    attendees: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        status: {
          type: String,
          enum: ["attending", "maybe", "declined", "not-responded"],
          default: "not-responded",
        },
        responseDate: {
          type: Date,
        },
      },
    ],
    // For email type events
    emailData: {
      subject: String,
      sender: String,
      requiresResponse: {
        type: Boolean,
        default: false,
      },
      responseDeadline: Date,
      emailId: String,
    },
    // For task type events
    taskData: {
      assignee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      dependencies: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Event",
        },
      ],
      estimatedHours: Number,
      actualHours: Number,
    },
    // For team availability
    availability: {
      type: String,
      enum: ["available", "busy", "out-of-office", "tentative"],
      default: "available",
    },
    // For conflict detection
    conflicts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
      },
    ],
    // For calendar sharing
    sharedWith: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        permission: {
          type: String,
          enum: ["view", "edit", "manage"],
          default: "view",
        },
      },
    ],
    // For export capabilities
    exportData: {
      lastExported: Date,
      exportFormat: String,
      exportUrl: String,
    },
    timezone: {
      type: String,
      default: "UTC",
    },
    reminders: [
      {
        method: {
          type: String,
          enum: ["email", "push", "sms"],
          required: true,
        },
        minutesBefore: {
          type: Number,
          required: true,
        },
        sent: {
          type: Boolean,
          default: false,
        },
      },
    ],
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        text: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    attachments: [
      {
        name: String,
        url: String,
        type: String,
        size: Number,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

// Create indexes for better query performance
eventSchema.index({ user: 1, calendarType: 1 });
eventSchema.index({ date: 1 });
eventSchema.index({ startDate: 1, endDate: 1 });
eventSchema.index({ teamId: 1 });
eventSchema.index({ type: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ priority: 1 });
eventSchema.index({ "attendees.user": 1 });
eventSchema.index({ "sharedWith.user": 1 });

// Virtual field for event duration
eventSchema.virtual("duration").get(function () {
  if (this.isAllDay) return 24 * 60; // 24 hours in minutes
  const start = new Date(`${this.startDate}T${this.startTime}`);
  const end = new Date(`${this.endDate}T${this.endTime}`);
  return (end - start) / (1000 * 60); // Duration in minutes
});

// Method to check if event is upcoming
eventSchema.methods.isUpcoming = function () {
  const now = new Date();
  const eventStart = new Date(`${this.startDate}T${this.startTime}`);
  return eventStart > now;
};

// Method to check if event is in progress
eventSchema.methods.isInProgress = function () {
  const now = new Date();
  const eventStart = new Date(`${this.startDate}T${this.startTime}`);
  const eventEnd = new Date(`${this.endDate}T${this.endTime}`);
  return now >= eventStart && now <= eventEnd;
};

// Method to check if event is overdue
eventSchema.methods.isOverdue = function () {
  const now = new Date();
  const eventEnd = new Date(`${this.endDate}T${this.endTime}`);
  return now > eventEnd && this.status !== "completed";
};

export default mongoose.model("Event", eventSchema);
