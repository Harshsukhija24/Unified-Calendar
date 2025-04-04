import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.Mixed, // Can be ObjectId or String (email)
          ref: "User",
        },
        role: {
          type: String,
          enum: ["admin", "member"],
          default: "member",
        },
        status: {
          type: String,
          enum: ["pending", "active", "declined"],
          default: "active",
        },
        permissions: {
          type: String,
          enum: ["view", "edit", "admin"],
          default: "view",
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Create indexes for better query performance
teamSchema.index({ admin: 1 });
teamSchema.index({ "members.user": 1 });

export default mongoose.model("Team", teamSchema);
