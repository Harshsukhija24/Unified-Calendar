import Event from "../Models/Event.js";
import { verifyToken } from "../middleware/auth.js";
import User from "../Models/User.js";
import Team from "../Models/Team.js";
import { sendNotification } from "../utils/notifications.js";

// Create a new event
export const createEvent = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, msg: "No token provided" });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ success: false, msg: "Invalid token" });
    }

    const {
      title,
      description,
      type,
      startDate,
      endDate,
      startTime,
      endTime,
      location,
      teamId,
      attendees,
      reminders,
      tags,
      calendarType = "personal", // Default to personal if not provided
    } = req.body;

    // Validate required fields
    if (!title || !startDate || !endDate || !type) {
      return res.status(400).json({
        success: false,
        msg: "Title, start date, end date, and type are required",
      });
    }

    // Convert date strings to Date objects
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    // Validate dates
    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      return res.status(400).json({
        success: false,
        msg: "Invalid date format",
      });
    }

    // Create the event
    const event = new Event({
      title,
      description,
      type,
      date: startDateObj, // Use startDate as the main date
      startDate: startDateObj,
      endDate: endDateObj,
      startTime,
      endTime,
      location,
      calendarType,
      user: decoded.userId, // Add the user field
      teamId: teamId || null,
      attendees: attendees || [],
      reminders: reminders || [],
      tags: tags || [],
    });

    // Save the event
    await event.save();

    // If it's a team event, notify team members
    if (teamId) {
      const team = await Team.findById(teamId);
      if (team) {
        for (const memberId of team.members) {
          if (memberId.toString() !== decoded.userId) {
            await sendNotification({
              userId: memberId,
              title: "New Team Event",
              message: `A new event "${title}" has been created in your team`,
              type: "event",
              data: { eventId: event._id },
            });
          }
        }
      }
    }

    return res.status(201).json({
      success: true,
      msg: "Event created successfully",
      event,
    });
  } catch (error) {
    console.error("Error creating event:", error);
    return res.status(500).json({
      success: false,
      msg: "Failed to create event",
      error: error.message,
    });
  }
};

// Get all events for a user
export const getEvents = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, msg: "No token provided" });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ success: false, msg: "Invalid token" });
    }

    const { startDate, endDate, type, status, teamId } = req.query;

    // Build query
    const query = {
      $or: [{ createdBy: decoded.id }, { "attendees.user": decoded.id }],
    };

    if (teamId) {
      query.team = teamId;
    }

    if (startDate && endDate) {
      query.startDate = { $gte: startDate };
      query.endDate = { $lte: endDate };
    }

    if (type) {
      query.type = type;
    }

    if (status) {
      query.status = status;
    }

    const events = await Event.find(query)
      .populate("createdBy", "name email")
      .populate("team", "name")
      .populate("attendees.user", "name email")
      .sort({ startDate: 1 });

    res.json({
      success: true,
      events,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({
      success: false,
      msg: "Failed to fetch events",
      error: error.message,
    });
  }
};

// Get a single event by ID
export const getEventById = async (req, res) => {
  try {
    // Check for authentication
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        msg: "Authentication required",
      });
    }

    // Verify token and get user ID
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        msg: "Invalid or expired token",
      });
    }

    const { id } = req.params;

    // Get event
    const event = await Event.findOne({
      _id: id,
      user: decoded.userId,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        msg: "Event not found",
      });
    }

    return res.status(200).json({
      success: true,
      event,
    });
  } catch (error) {
    console.error("Error fetching event:", error);
    return res.status(500).json({
      success: false,
      msg: "Error fetching event",
      error: error.message,
    });
  }
};

// Update an event
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.userId;

    // Validate input
    if (!id) {
      return res.status(400).json({
        success: false,
        msg: "Event ID is required",
      });
    }

    // Find the event first to check ownership
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        msg: "Event not found",
      });
    }

    // Check if the user is the owner of the event
    if (event.user.toString() !== userId) {
      // If it's a team event, check if the user has edit permissions
      if (event.calendarType === "team" && event.teamId) {
        const team = await Team.findById(event.teamId);
        if (!team) {
          return res.status(404).json({
            success: false,
            msg: "Team not found",
          });
        }

        // Check if user is admin or has edit permissions
        const isAdmin = team.admin.toString() === userId;
        const memberInfo = team.members.find(
          (m) => m.user.toString() === userId && m.status === "active"
        );

        if (!isAdmin && (!memberInfo || memberInfo.permissions !== "edit")) {
          return res.status(403).json({
            success: false,
            msg: "You don't have permission to update this event",
          });
        }
      } else {
        // For personal events, only the owner can edit
        return res.status(403).json({
          success: false,
          msg: "You don't have permission to update this event",
        });
      }
    }

    // Update the event
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      msg: "Event updated successfully",
      event: updatedEvent,
    });
  } catch (error) {
    console.error("Error updating event:", error);
    return res.status(500).json({
      success: false,
      msg: "Internal server error",
      error: error.message,
    });
  }
};

// Delete an event
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Validate input
    if (!id) {
      return res.status(400).json({
        success: false,
        msg: "Event ID is required",
      });
    }

    // Find the event first to check ownership
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        msg: "Event not found",
      });
    }

    // Check if the user is the owner of the event
    if (event.user.toString() !== userId) {
      // If it's a team event, check if the user has edit permissions
      if (event.calendarType === "team" && event.teamId) {
        const team = await Team.findById(event.teamId);
        if (!team) {
          return res.status(404).json({
            success: false,
            msg: "Team not found",
          });
        }

        // Check if user is admin or has edit permissions
        const isAdmin = team.admin.toString() === userId;
        const memberInfo = team.members.find(
          (m) => m.user.toString() === userId && m.status === "active"
        );

        if (!isAdmin && (!memberInfo || memberInfo.permissions !== "edit")) {
          return res.status(403).json({
            success: false,
            msg: "You don't have permission to delete this event",
          });
        }
      } else {
        // For personal events, only the owner can delete
        return res.status(403).json({
          success: false,
          msg: "You don't have permission to delete this event",
        });
      }
    }

    // Delete the event
    await Event.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      msg: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    return res.status(500).json({
      success: false,
      msg: "Internal server error",
      error: error.message,
    });
  }
};
