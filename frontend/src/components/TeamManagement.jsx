import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import CreateTeamModal from "./modals/CreateTeamModal";
import AddTeamMemberModal from "./modals/AddTeamMemberModal";
import UpdateMemberModal from "./modals/UpdateMemberModal";
import TeamEventModal from "./modals/TeamEventModal";

const TeamManagement = () => {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
  const [isTeamEventModalOpen, setIsTeamEventModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isUpdateMemberModalOpen, setIsUpdateMemberModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [invitations, setInvitations] = useState([]);

  // Fetch teams on component mount
  useEffect(() => {
    fetchTeams();
    fetchInvitations();
  }, []);

  // Fetch all teams the user is a member of or admin for
  const fetchTeams = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/teams", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setTeams(data.teams);
        if (data.teams.length > 0 && !selectedTeam) {
          setSelectedTeam(data.teams[0]);
        } else if (selectedTeam) {
          // Update the selected team if it exists in the new data
          const updatedSelectedTeam = data.teams.find(
            (team) => team._id === selectedTeam._id
          );
          if (updatedSelectedTeam) {
            setSelectedTeam(updatedSelectedTeam);
          }
        }
      } else {
        throw new Error(data.msg || "Failed to fetch teams");
      }
    } catch (error) {
      console.error("Error fetching teams:", error);
      toast.error(error.message || "Failed to fetch teams");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch pending invitations
  const fetchInvitations = async () => {
    try {
      const response = await fetch("http://localhost:5000/teams/invitations", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setInvitations(data.invitations);
      } else {
        console.error("Failed to fetch invitations:", data.msg);
      }
    } catch (error) {
      console.error("Error fetching invitations:", error);
    }
  };

  // Handle invitation response (accept/decline)
  const handleInvitationResponse = async (invitationId, status) => {
    try {
      const response = await fetch(
        `http://localhost:5000/teams/invitation/${invitationId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(
          status === "accepted"
            ? "You have joined the team!"
            : "Invitation declined"
        );
        // Update invitations and teams lists
        fetchInvitations();
        fetchTeams();
      } else {
        throw new Error(data.msg || `Failed to ${status} invitation`);
      }
    } catch (error) {
      console.error(`Error ${status}ing invitation:`, error);
      toast.error(error.message || `Failed to ${status} invitation`);
    }
  };

  // Handle team creation success
  const handleTeamCreated = (newTeam) => {
    setTeams([...teams, newTeam]);
    setSelectedTeam(newTeam);
    toast.success("Team created successfully!");
  };

  // Handle member added success
  const handleMemberAdded = (updatedTeam) => {
    // Update the teams list and selected team
    setTeams((prev) =>
      prev.map((team) => (team._id === updatedTeam._id ? updatedTeam : team))
    );
    setSelectedTeam(updatedTeam);
    toast.success("Member added successfully!");
  };

  // Handle team event creation success
  const handleTeamEventCreated = (newEvent) => {
    toast.success("Team event created successfully!");
    // You might want to refresh the events list here or update a state with the new event
  };

  // Handle opening the update member modal
  const handleEditMember = (member) => {
    setSelectedMember(member);
    setIsUpdateMemberModalOpen(true);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="p-6 bg-gray-900 rounded-xl shadow-xl border border-white/10 text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">Team Management</h2>
        <button
          onClick={() => setIsCreateTeamModalOpen(true)}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white transition-all"
        >
          Create New Team
        </button>
      </div>

      {/* Pending Invitations Section */}
      {invitations.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Pending Invitations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {invitations.map((invitation) => (
              <div
                key={invitation._id}
                className="bg-gray-800/80 p-4 rounded-lg border border-white/10"
              >
                <h4 className="font-medium text-lg">{invitation.team.name}</h4>
                <p className="text-white/70 text-sm mb-2">
                  Invited by: {invitation.inviter.name}
                </p>
                {invitation.message && (
                  <p className="text-white/70 text-sm mb-3">
                    Message: "{invitation.message}"
                  </p>
                )}
                <p className="text-white/50 text-xs mb-3">
                  Expires: {formatDate(invitation.expiresAt)}
                </p>
                <div className="flex justify-end space-x-2 mt-2">
                  <button
                    onClick={() =>
                      handleInvitationResponse(invitation._id, "declined")
                    }
                    className="px-3 py-1 rounded text-sm bg-white/10 hover:bg-white/20 text-white/80 transition-colors"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() =>
                      handleInvitationResponse(invitation._id, "accepted")
                    }
                    className="px-3 py-1 rounded text-sm bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white transition-all"
                  >
                    Accept
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Teams List and Selected Team Section */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-cyan-500 border-r-2 border-white/30"></div>
        </div>
      ) : teams.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-white/70 mb-4">You don't have any teams yet.</p>
          <button
            onClick={() => setIsCreateTeamModalOpen(true)}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white transition-all"
          >
            Create Your First Team
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Teams List */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-white/10">
            <h3 className="text-lg font-semibold mb-4">Your Teams</h3>
            <div className="flex flex-col space-y-2">
              {teams.map((team) => (
                <button
                  key={team._id}
                  onClick={() => setSelectedTeam(team)}
                  className={`p-3 rounded-lg text-left transition-all hover:bg-cyan-500/10 ${
                    selectedTeam && selectedTeam._id === team._id
                      ? "bg-cyan-500/20 border border-cyan-500/40"
                      : "bg-gray-700/40 border border-white/10"
                  }`}
                >
                  <div className="font-medium">{team.name}</div>
                  <div className="text-xs text-white/60 mt-1">
                    {team.isAdmin ? "Admin" : "Member"} • {team.memberCount}{" "}
                    members
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Team Details */}
          {selectedTeam && (
            <div className="bg-gray-800/50 rounded-lg p-5 border border-white/10 lg:col-span-3">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <div>
                  <h3 className="text-xl font-bold">{selectedTeam.name}</h3>
                  {selectedTeam.description && (
                    <p className="text-white/70 mt-1">
                      {selectedTeam.description}
                    </p>
                  )}
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setIsTeamEventModalOpen(true)}
                    className="px-3 py-1.5 rounded text-sm font-medium bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white transition-all"
                  >
                    New Team Event
                  </button>

                  <button
                    onClick={() => setIsAddMemberModalOpen(true)}
                    className="px-3 py-1.5 rounded text-sm font-medium bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white transition-all"
                  >
                    Add Member
                  </button>
                </div>
              </div>

              {/* Team Members */}
              <div className="mb-6">
                <h4 className="text-md font-semibold mb-3">Team Members</h4>
                <div className="bg-gray-700/30 rounded-lg overflow-hidden">
                  <div className="grid grid-cols-5 text-xs font-medium text-white/60 p-3 border-b border-white/10">
                    <div>Name</div>
                    <div>Email</div>
                    <div>Role</div>
                    <div>Permissions</div>
                    {selectedTeam.isAdmin && <div>Actions</div>}
                  </div>
                  {selectedTeam.members
                    ?.filter((member) => member.user)
                    .map((member) => (
                      <div
                        key={member.user?._id || `member-${Math.random()}`}
                        className="grid grid-cols-5 text-sm p-3 hover:bg-white/5 border-b border-white/5 last:border-b-0"
                      >
                        <div>{member.user?.name || "Unknown User"}</div>
                        <div className="text-white/70">
                          {member.user?.email || "No email"}
                        </div>
                        <div className="text-white/70">
                          {member.role === "admin" ? (
                            <span className="text-cyan-400">Admin</span>
                          ) : (
                            "Member"
                          )}
                        </div>
                        <div className="text-white/70">
                          {member.permissions === "edit" ? (
                            <span className="text-green-400">Can Edit</span>
                          ) : (
                            <span className="text-amber-400">View Only</span>
                          )}
                        </div>
                        {selectedTeam.isAdmin && member.user && (
                          <div>
                            <button
                              onClick={() => handleEditMember(member)}
                              className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs text-white transition-colors"
                            >
                              Edit
                            </button>
                          </div>
                        )}
                        {selectedTeam.isAdmin && !member.user && (
                          <div>
                            <span className="text-xs text-red-400">
                              Invalid User
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  {!selectedTeam.members ||
                    (selectedTeam.members.length === 0 && (
                      <div className="p-4 text-center text-white/60">
                        No team members found
                      </div>
                    ))}
                </div>
              </div>

              {/* Team Events (placeholder - could be expanded) */}
              <div>
                <h4 className="text-md font-semibold mb-3">
                  Upcoming Team Events
                </h4>
                {selectedTeam.events && selectedTeam.events.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedTeam.events.map((event) => (
                      <div
                        key={event._id}
                        className="bg-gray-700/30 p-3 rounded-lg border border-white/10"
                      >
                        <div className="font-medium">{event.title}</div>
                        <div className="text-xs text-white/60 mt-1">
                          {new Date(event.startDate).toLocaleDateString()} at{" "}
                          {event.startTime}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-white/60 text-sm bg-gray-700/30 p-4 rounded-lg">
                    No upcoming events. Create one to get started!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {isCreateTeamModalOpen && (
        <CreateTeamModal
          isOpen={isCreateTeamModalOpen}
          onClose={() => setIsCreateTeamModalOpen(false)}
          onTeamCreate={handleTeamCreated}
        />
      )}

      {selectedTeam && isAddMemberModalOpen && (
        <AddTeamMemberModal
          isOpen={isAddMemberModalOpen}
          onClose={() => setIsAddMemberModalOpen(false)}
          teamId={selectedTeam._id}
          teamName={selectedTeam.name}
          onMemberAdded={handleMemberAdded}
        />
      )}

      {selectedTeam && selectedMember && isUpdateMemberModalOpen && (
        <UpdateMemberModal
          isOpen={isUpdateMemberModalOpen}
          onClose={() => {
            setIsUpdateMemberModalOpen(false);
            setSelectedMember(null);
          }}
          teamId={selectedTeam._id}
          member={selectedMember}
          onMemberUpdated={handleMemberAdded}
        />
      )}

      {selectedTeam && isTeamEventModalOpen && (
        <TeamEventModal
          isOpen={isTeamEventModalOpen}
          onClose={() => setIsTeamEventModalOpen(false)}
          teamId={selectedTeam._id}
          teamName={selectedTeam.name}
          onEventCreate={handleTeamEventCreated}
        />
      )}
    </div>
  );
};

export default TeamManagement;
