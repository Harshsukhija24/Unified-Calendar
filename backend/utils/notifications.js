import User from "../Models/User.js";

export const sendNotification = async ({
  userId,
  title,
  message,
  type,
  data,
}) => {
  try {
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      console.error(`User not found for notification: ${userId}`);
      return false;
    }

    // Create notification
    const notification = {
      title,
      message,
      type,
      data,
      read: false,
      createdAt: new Date(),
    };

    // Add notification to user's notifications array
    user.notifications = user.notifications || [];
    user.notifications.push(notification);

    // Save the user with the new notification
    await user.save();

    return true;
  } catch (error) {
    console.error("Error sending notification:", error);
    return false;
  }
};
