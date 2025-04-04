import React, { useState, useEffect } from "react";
import { HiUserCircle, HiClock } from "react-icons/hi";

const TeamAvailability = ({ teamMembers }) => {
  const [availability, setAvailability] = useState({});

  useEffect(() => {
    // Fetch team member availability
    const fetchAvailability = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/teams/availability",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch availability");
        const data = await response.json();
        if (data.success) setAvailability(data.availability);
      } catch (error) {
        console.error("Error fetching availability:", error);
      }
    };

    fetchAvailability();
  }, [teamMembers]);

  const getAvailabilityColor = (status) => {
    switch (status) {
      case "available":
        return "bg-green-500";
      case "busy":
        return "bg-red-500";
      case "out-of-office":
        return "bg-gray-500";
      case "tentative":
        return "bg-yellow-500";
      default:
        return "bg-gray-300";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <HiUserGroup className="h-5 w-5 mr-2" />
        Team Availability
      </h3>
      <div className="space-y-3">
        {teamMembers.map((member) => (
          <div key={member._id} className="flex items-center justify-between">
            <div className="flex items-center">
              <HiUserCircle className="h-8 w-8 text-gray-400 mr-2" />
              <div>
                <p className="text-sm font-medium">{member.name}</p>
                <p className="text-xs text-gray-500">{member.role}</p>
              </div>
            </div>
            <div className="flex items-center">
              <div
                className={`w-3 h-3 rounded-full ${getAvailabilityColor(
                  availability[member._id]?.status || "unknown"
                )} mr-2`}
              />
              <span className="text-xs text-gray-500">
                {availability[member._id]?.status || "unknown"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamAvailability;
