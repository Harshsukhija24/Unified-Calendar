import Team from "../Models/Team.js";
import Invitation from "../Models/Invitation.js";
import Event from "../Models/Event.js";
import { verifyToken } from "../middleware/auth.js";
import { v4 as uuidv4 } from "uuid";
import { clientConnection } from "../Helpers/dbConnection.js";
import nodemailer from "nodemailer";
import User from "../Models/User.js";
import mongoose from "mongoose";

// Helper function to send invitation emails
const sendInvitationEmail = async (invitation, teamName) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "harshsukhija2002@gmail.com",
        pass: "vuks jzjn qveq hczv",
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    await transporter.sendMail({
      from: "harshsukhija2002@gmail.com",
      to: invitation.invitee.email,
      subject: `Invitation to join ${teamName} on Unified Calendar`,
      html: `
        <div>
          <h1>You've been invited to join ${teamName}</h1>
          <p>Hello${
            invitation.invitee.name ? " " + invitation.invitee.name : ""
          },</p>
          <p>You have been invited to join the team "${teamName}" on Unified Calendar.</p>
          <p>${invitation.message || ""}</p>
          <p>Click the link below to accept the invitation:</p>
          <a href="http://localhost:5173/accept-invitation/${
            invitation.token
          }">Accept Invitation</a>
          <p>This invitation will expire in 7 days.</p>
          <p>Thank you!</p>
        </div>
      `,
    });

    return true;
  } catch (error) {
    console.error("Error sending invitation email:", error);
    return false;
  }
};

// Create a new team
export const createTeam = async (req, res) => {
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

    const { name, description } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        msg: "Team name is required",
      });
    }

    // Create new team
    const newTeam = new Team({
      name,
      description: description || "",
      admin: decoded.userId,
      members: [
        {
          user: decoded.userId,
          role: "admin",
          status: "active",
        },
      ],
    });

    await newTeam.save();

    return res.status(201).json({
      success: true,
      msg: "Team created successfully",
      team: newTeam,
    });
  } catch (error) {
    console.error("Error creating team:", error);
    return res.status(500).json({
      success: false,
      msg: "Error creating team",
      error: error.message,
    });
  }
};

// Get all teams for a user
export const getTeams = async (req, res) => {
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

    // Find teams where user is a member or admin
    const teams = await Team.find({
      $or: [
        { admin: decoded.userId },
        { "members.user": decoded.userId, "members.status": "active" },
      ],
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      teams,
    });
  } catch (error) {
    console.error("Error fetching teams:", error);
    return res.status(500).json({
      success: false,
      msg: "Error fetching teams",
      error: error.message,
    });
  }
};

// Get a single team by ID
export const getTeamById = async (req, res) => {
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

    // Find team and check if user is a member or admin
    const team = await Team.findOne({
      _id: id,
      $or: [
        { admin: decoded.userId },
        { "members.user": decoded.userId, "members.status": "active" },
      ],
    }).populate("members.user", "name email");

    if (!team) {
      return res.status(404).json({
        success: false,
        msg: "Team not found or you don't have access",
      });
    }

    return res.status(200).json({
      success: true,
      team,
    });
  } catch (error) {
    console.error("Error fetching team:", error);
    return res.status(500).json({
      success: false,
      msg: "Error fetching team",
      error: error.message,
    });
  }
};

// Invite a user to a team
export const inviteTeamMember = async (req, res) => {
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

    const { teamId, email, name, message } = req.body;

    // Validation
    if (!teamId || !email) {
      return res.status(400).json({
        success: false,
        msg: "Team ID and email are required",
      });
    }

    // Check if the team exists and user is admin
    const team = await Team.findOne({
      _id: teamId,
      $or: [
        { admin: decoded.userId },
        {
          "members.user": decoded.userId,
          "members.role": "admin",
          "members.status": "active",
        },
      ],
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        msg: "Team not found or you don't have permission to invite members",
      });
    }

    // Check if user is already a member
    const existingMember = team.members.find(
      (member) =>
        member.user.toString() === decoded.userId.toString() &&
        member.status === "active"
    );

    if (!existingMember) {
      return res.status(403).json({
        success: false,
        msg: "You don't have permission to invite members to this team",
      });
    }

    // Check if invitation already exists
    const existingInvitation = await Invitation.findOne({
      team: teamId,
      "invitee.email": email,
      status: "pending",
    });

    if (existingInvitation) {
      return res.status(409).json({
        success: false,
        msg: "An invitation has already been sent to this email",
      });
    }

    // Check if user already exists in the system
    const existingUser = await clientConnection("Users").findOne({ email });
    const userName = existingUser ? existingUser.name : name;

    // Create invitation token
    const invitationToken = uuidv4();

    const invitation = new Invitation({
      team: teamId,
      invitee: {
        email,
        name: userName,
      },
      inviter: decoded.userId,
      message,
      token: invitationToken,
    });

    await invitation.save();

    // Send invitation email
    const emailSent = await sendInvitationEmail(invitation, team.name);

    return res.status(201).json({
      success: true,
      msg: "Invitation sent successfully",
      emailSent,
      invitation,
    });
  } catch (error) {
    console.error("Error inviting team member:", error);
    return res.status(500).json({
      success: false,
      msg: "Error inviting team member",
      error: error.message,
    });
  }
};

// Accept a team invitation
export const acceptInvitation = async (req, res) => {
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

    const { invitationToken } = req.params;

    // Find invitation
    const invitation = await Invitation.findOne({
      token: invitationToken,
      status: "pending",
    }).populate("team");

    if (!invitation) {
      return res.status(404).json({
        success: false,
        msg: "Invitation not found or already processed",
      });
    }

    // Check if invitation is expired
    if (new Date() > invitation.expiresAt) {
      await Invitation.findByIdAndUpdate(invitation._id, { status: "expired" });
      return res.status(400).json({
        success: false,
        msg: "Invitation has expired",
      });
    }

    // Get user details
    const user = await clientConnection("Users").findOne({
      _id: decoded.userId,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    // Check if user's email matches invitation email
    if (user.email !== invitation.invitee.email) {
      return res.status(403).json({
        success: false,
        msg: "This invitation was sent to a different email address",
      });
    }

    // Check if user is already a member of the team
    const team = await Team.findById(invitation.team);
    if (!team) {
      return res.status(404).json({
        success: false,
        msg: "Team not found",
      });
    }

    const existingMember = team.members.find(
      (member) => member.user.toString() === decoded.userId.toString()
    );

    if (existingMember) {
      if (existingMember.status === "active") {
        // Update invitation status
        await Invitation.findByIdAndUpdate(invitation._id, {
          status: "accepted",
        });

        return res.status(200).json({
          success: true,
          msg: "You are already a member of this team",
          team,
        });
      } else {
        // Update member status to active
        existingMember.status = "active";
        await team.save();
      }
    } else {
      // Add user to team
      team.members.push({
        user: decoded.userId,
        role: "member",
        status: "active",
      });
      await team.save();
    }

    // Update invitation status
    await Invitation.findByIdAndUpdate(invitation._id, { status: "accepted" });

    return res.status(200).json({
      success: true,
      msg: "Invitation accepted successfully",
      team,
    });
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return res.status(500).json({
      success: false,
      msg: "Error accepting invitation",
      error: error.message,
    });
  }
};

// Create team event
export const createTeamEvent = async (req, res) => {
  try {
    const {
      teamId,
      title,
      date,
      startDate,
      endDate,
      startTime,
      endTime,
      type,
      description,
    } = req.body;
    const userId = req.userId;

    // Validate input
    if (!teamId || !title || !date) {
      return res.status(400).json({
        success: false,
        msg: "TeamId, title, and date are required",
      });
    }

    // Find the team
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        msg: "Team not found",
      });
    }

    // Check if user is a member of the team
    const isAdmin = team.admin.toString() === userId;
    const memberInfo = team.members.find(
      (m) => m.user.toString() === userId && m.status === "active"
    );

    if (!isAdmin && !memberInfo) {
      return res.status(403).json({
        success: false,
        msg: "You must be a member of this team to create events",
      });
    }

    // Check if the member has edit permissions
    if (!isAdmin && memberInfo && memberInfo.permissions !== "edit") {
      return res.status(403).json({
        success: false,
        msg: "You don't have permission to create events for this team",
      });
    }

    // Create event
    const event = new Event({
      title,
      date: new Date(date),
      startDate: startDate ? new Date(startDate) : new Date(date),
      endDate: endDate ? new Date(endDate) : new Date(date),
      startTime: startTime || "09:00",
      endTime: endTime || "10:00",
      type: type || "meeting",
      description: description || "",
      calendarType: "team",
      teamId,
      user: userId,
    });

    await event.save();

    return res.status(201).json({
      success: true,
      msg: "Team event created successfully",
      event,
    });
  } catch (error) {
    console.error("Error creating team event:", error);
    return res.status(500).json({
      success: false,
      msg: "Internal server error",
      error: error.message,
    });
  }
};

// Get team events
export const getTeamEvents = async (req, res) => {
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

    const { teamId } = req.params;
    const startDate = req.query.startDate
      ? new Date(req.query.startDate)
      : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

    // Check if team exists and user is a member
    const team = await Team.findOne({
      _id: teamId,
      "members.user": decoded.userId,
      "members.status": "active",
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        msg: "Team not found or you are not an active member",
      });
    }

    // Build query
    const query = {
      teamId,
      calendarType: "team",
    };

    // Add date range filter if provided
    if (startDate && endDate) {
      // Using $or to match events that overlap with the requested date range
      query.$or = [
        // Events that start within the range
        {
          startDate: {
            $gte: startDate,
            $lte: endDate,
          },
        },
        // Events that end within the range
        {
          endDate: {
            $gte: startDate,
            $lte: endDate,
          },
        },
        // Events that start before and end after the range (spanning the entire range)
        {
          startDate: { $lte: startDate },
          endDate: { $gte: endDate },
        },
      ];
    } else if (startDate) {
      // If only start date is provided, fetch events that end on or after that date
      query.endDate = { $gte: startDate };
    } else if (endDate) {
      // If only end date is provided, fetch events that start on or before that date
      query.startDate = { $lte: endDate };
    }

    // Get events
    const events = await Event.find(query)
      .populate("user", "name email")
      .populate("attendees.user", "name email")
      .sort({ startDate: 1, startTime: 1 });

    return res.status(200).json({
      success: true,
      events,
    });
  } catch (error) {
    console.error("Error fetching team events:", error);
    return res.status(500).json({
      success: false,
      msg: "Error fetching team events",
      error: error.message,
    });
  }
};

// Update attendance status for a team event
export const updateAttendance = async (req, res) => {
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

    const { eventId } = req.params;
    const { status } = req.body;

    // Validate status
    if (!status || !["attending", "maybe", "declined"].includes(status)) {
      return res.status(400).json({
        success: false,
        msg: "Valid status is required (attending, maybe, or declined)",
      });
    }

    // Find event and check if user is an attendee
    const event = await Event.findOne({
      _id: eventId,
      calendarType: "team",
      "attendees.user": decoded.userId,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        msg: "Event not found or you are not an attendee",
      });
    }

    // Update attendance status
    const attendee = event.attendees.find(
      (a) => a.user.toString() === decoded.userId
    );

    if (attendee) {
      attendee.status = status;
      await event.save();
    }

    return res.status(200).json({
      success: true,
      msg: "Attendance status updated successfully",
      event,
    });
  } catch (error) {
    console.error("Error updating attendance:", error);
    return res.status(500).json({
      success: false,
      msg: "Error updating attendance",
      error: error.message,
    });
  }
};

export const addTeamMemberByEmail = async (req, res) => {
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

    const { teamId, emails, permissions } = req.body;

    // Validation
    if (!teamId || !emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({
        success: false,
        msg: "Team ID and at least one email are required",
      });
    }

    // Find the team and check if user is admin
    const team = await Team.findOne({
      _id: teamId,
      $or: [
        { admin: decoded.userId },
        {
          "members.user": decoded.userId,
          "members.role": "admin",
        },
      ],
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        msg: "Team not found or you don't have admin access",
      });
    }

    // Create new members array
    const newMembers = emails.map((email) => ({
      user: email, // Store email directly as user ID
      role: permissions || "view",
      status: "active",
    }));

    // Add new members to the team
    team.members = [...team.members, ...newMembers];
    await team.save();

    return res.status(200).json({
      success: true,
      msg: "Team members added successfully",
      team,
    });
  } catch (error) {
    console.error("Error adding team members:", error);
    return res.status(500).json({
      success: false,
      msg: "Error adding team members",
      error: error.message,
    });
  }
};

export const updateTeamMember = async (req, res) => {
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

    const userId = decoded.userId;
    const { teamId, memberId, role, permissions } = req.body;

    if (!teamId || !memberId) {
      return res.status(400).json({
        success: false,
        msg: "Team ID and member ID are required",
      });
    }

    // Validate role and permissions
    const validRoles = ["admin", "member"];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        msg: "Invalid role value. Must be 'admin' or 'member'",
      });
    }

    const validPermissions = ["view", "edit"];
    if (permissions && !validPermissions.includes(permissions)) {
      return res.status(400).json({
        success: false,
        msg: "Invalid permissions value. Must be 'view' or 'edit'",
      });
    }

    // Find the team
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        msg: "Team not found",
      });
    }

    // Check if the requesting user is an admin of the team
    const isAdmin =
      team.admin.toString() === userId ||
      team.members.some(
        (m) => m.user && m.user.toString() === userId && m.role === "admin"
      );

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        msg: "Only team admins can update member permissions",
      });
    }

    // Find the member to update
    const memberIndex = team.members.findIndex(
      (m) => m.user && m.user.toString() === memberId
    );

    if (memberIndex === -1) {
      return res.status(404).json({
        success: false,
        msg: "Member not found in this team",
      });
    }

    // Update member's role and permissions
    if (role) {
      team.members[memberIndex].role = role;
    }

    if (permissions) {
      team.members[memberIndex].permissions = permissions;
    }

    await team.save();

    // Fetch the updated team with populated user data
    const updatedTeam = await Team.findById(teamId)
      .populate("admin", "name email")
      .populate("members.user", "name email");

    return res.status(200).json({
      success: true,
      msg: "Team member updated successfully",
      team: updatedTeam,
    });
  } catch (error) {
    console.error("Error updating team member:", error);
    return res.status(500).json({
      success: false,
      msg: "Internal server error",
      error: error.message,
    });
  }
};
