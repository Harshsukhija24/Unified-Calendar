import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TeamManagement from "../components/TeamManagement";

const TeamsPage = () => {
  const navigate = useNavigate();
  const [userAuthenticated, setUserAuthenticated] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/");
      return;
    }
    setUserAuthenticated(true);
  }, [navigate]);

  if (!userAuthenticated) {
    return null; // Don't render anything if not authenticated
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <TeamManagement />
    </div>
  );
};

export default TeamsPage;
