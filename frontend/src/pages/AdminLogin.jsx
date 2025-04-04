import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleRegisterAdmin = async () => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailPattern.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/usersignup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Email registered successfully!");
        navigate("/");
      } else {
        toast.error(`Error: ${data.message}`);
      }
    } catch (error) {
      toast.error("Failed to send OTP. Try again later.", error);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-xl overflow-hidden border border-white/20">
        <div className="px-6 py-8 sm:px-10">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white">
              Admin Registration
            </h2>
            <p className="mt-1 text-sm text-white/70">
              Register your email for admin access
            </p>
          </div>

          <div className="mt-6">
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="admin-email"
                  className="block text-sm font-medium text-white"
                >
                  Admin Email
                </label>
                <div className="mt-1">
                  <input
                    id="admin-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="Enter admin email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/10 border border-white/30 rounded-md py-3 px-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <button
                  onClick={handleRegisterAdmin}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 transition duration-200 transform hover:scale-[1.02]"
                >
                  Register Admin
                </button>
              </div>

              <div className="text-center">
                <button
                  onClick={() => navigate("/")}
                  className="text-cyan-300 hover:text-cyan-100 text-sm transition-colors"
                >
                  Back to user login
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gradient-to-r from-indigo-600/30 to-purple-600/30 sm:px-10">
          <p className="text-sm text-center text-white/80">
            Admin access to Unified Calendar management
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
