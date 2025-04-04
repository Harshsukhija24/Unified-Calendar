import express from "express";
import {
  createTeam,
  getTeams,
  getTeamById,
  inviteTeamMember,
  acceptInvitation,
  createTeamEvent,
  getTeamEvents,
  updateAttendance,
  addTeamMemberByEmail,
  updateTeamMember,
} from "../Controllers/teamControllers.js";

const router = express.Router();

// Team routes
router.post("/create", createTeam);
router.get("/", getTeams);
router.get("/:id", getTeamById);
router.post("/invite", inviteTeamMember);
router.get("/invitation/:invitationToken", acceptInvitation);
router.post("/members/add", addTeamMemberByEmail);
router.put("/members/update", updateTeamMember);

// Team event routes
router.post("/event", createTeamEvent);
router.get("/:teamId/events", getTeamEvents);
router.put("/event/:eventId/attendance", updateAttendance);

export default router;
