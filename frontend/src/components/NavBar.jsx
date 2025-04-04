import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsLoggedIn(!!token);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userName");
    navigate("/");
  };

  return (
    <nav className="bg-white/10 backdrop-blur-md shadow-lg border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div
            className="flex-shrink-0 cursor-pointer"
            onClick={() => navigate(isLoggedIn ? "/dashboard" : "/")}
          >
            <h1 className="text-white text-xl md:text-2xl font-bold">
              Unified Calendar
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* Main navigation for logged in users */}
            {isLoggedIn && (
              <div className="hidden md:flex items-center space-x-2 mr-4">
                <button
                  onClick={() => navigate("/dashboard")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === "/dashboard"
                      ? "bg-white/20 text-white border border-cyan-400/30"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  Calendar
                </button>
                <button
                  onClick={() => navigate("/teams")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === "/teams"
                      ? "bg-white/20 text-white border border-cyan-400/30"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  Teams
                </button>
              </div>
            )}

            {/* Login/Logout buttons */}
            {!isLoggedIn && location.pathname !== "/admin" && (
              <button
                onClick={() => navigate("/admin")}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-200 ease-in-out transform hover:scale-105 border border-white/30"
              >
                Admin Login
              </button>
            )}

            {location.pathname === "/admin" && (
              <button
                onClick={() => navigate("/")}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-200 ease-in-out transform hover:scale-105 border border-white/30"
              >
                User Login
              </button>
            )}

            {isLoggedIn && (
              <button
                onClick={handleLogout}
                className="bg-red-500/80 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-200 ease-in-out transform hover:scale-105 shadow-md"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
