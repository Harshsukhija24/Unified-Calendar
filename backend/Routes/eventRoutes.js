import express from "express";
import {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from "../Controllers/eventControllers.js";

const router = express.Router();

// Event routes
router.post("/create", createEvent);
router.get("/", getEvents);
router.get("/:id", getEventById);
router.put("/:id", updateEvent);
router.delete("/:id", deleteEvent);

export default router;
