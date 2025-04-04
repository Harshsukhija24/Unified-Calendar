import mongoose from "mongoose";

const invitationSchema = new mongoose.Schema(
  {
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    invitee: {
      email: {
        type: String,
        required: true,
      },
      name: String,
    },
    inviter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
    message: {
      type: String,
      trim: true,
    },
    token: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: function () {
        // Default expiration: 7 days from now
        const now = new Date();
        return new Date(now.setDate(now.getDate() + 7));
      },
    },
  },
  { timestamps: true }
);

// Create indexes for better query performance
invitationSchema.index({ "invitee.email": 1 });
invitationSchema.index({ team: 1 });
invitationSchema.index({ token: 1 });
invitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

export default mongoose.model("Invitation", invitationSchema);
