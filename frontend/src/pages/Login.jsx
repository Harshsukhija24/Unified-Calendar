import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authType, setAuthType] = useState("password"); // 'password' or 'otp'
  const navigate = useNavigate();

  const handlePasswordLogin = async () => {
    if (!email.trim()) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (!password.trim()) {
      toast.error("Please enter your password.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Save auth token and user info
        localStorage.setItem("authToken", data.accessToken);
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userName", data.user.name);

        toast.success("Login successful!");
        navigate("/dashboard");
      } else {
        toast.error(data.msg || "Invalid email or password.");
      }
    } catch (error) {
      console.error("Error during login process:", error);
      toast.error("Login failed. Please try again later.");
    }
  };

  const handleOtpLogin = async () => {
    if (!email.trim()) {
      toast.error("Please enter a valid email address.");
      return;
    }

    try {
      // Check if the user exists
      const checkResponse = await fetch("http://localhost:5000/usersignup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const checkData = await checkResponse.json();

      if (!checkData.success) {
        toast.error("Email not registered. Please register first.");
        return;
      }

      // If user exists, send OTP
      const response = await fetch("http://localhost:5000/emaillogin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem("userEmail", email);
        toast.success("OTP sent successfully!");
        navigate("/signup");
      } else {
        toast.error(data.msg || "Failed to send OTP.");
      }
    } catch (error) {
      console.error("Error during login process:", error);
      toast.error("Failed to send OTP. Try again later.");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (authType === "password") {
      handlePasswordLogin();
    } else {
      handleOtpLogin();
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-xl overflow-hidden border border-white/20">
        <div className="px-6 py-8 sm:px-10">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
            <p className="mt-1 text-sm text-white/70">
              Sign in to access your dashboard
            </p>
          </div>

          {/* Authentication Type Toggle */}
          <div className="flex justify-center mb-6">
            <div className="bg-white/5 p-1 rounded-lg inline-flex">
              <button
                className={`px-4 py-2 text-sm rounded-md transition ${
                  authType === "password"
                    ? "bg-cyan-600 text-white"
                    : "text-white/70 hover:text-white"
                }`}
                onClick={() => setAuthType("password")}
              >
                Password
              </button>
              <button
                className={`px-4 py-2 text-sm rounded-md transition ${
                  authType === "otp"
                    ? "bg-cyan-600 text-white"
                    : "text-white/70 hover:text-white"
                }`}
                onClick={() => setAuthType("otp")}
              >
                OTP
              </button>
            </div>
          </div>

          <form onSubmit={handleLogin} className="mt-6">
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-white"
                >
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/10 border border-white/30 rounded-md py-3 px-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  />
                </div>
              </div>

              {authType === "password" && (
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-white"
                  >
                    Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white/10 border border-white/30 rounded-md py-3 px-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-400 transition duration-200 transform hover:scale-[1.02]"
                >
                  {authType === "password" ? "Sign In" : "Send OTP"}
                </button>
              </div>
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-white/70">
                Don&apos;t have an account?{" "}
                <Link
                  to="/register"
                  className="text-cyan-400 hover:text-cyan-300"
                >
                  Register now
                </Link>
              </p>
            </div>
          </form>
        </div>

        <div className="px-6 py-4 bg-gradient-to-r from-cyan-600/30 to-blue-600/30 sm:px-10">
          <p className="text-sm text-center text-white/80">
            Unified Calendar - A simplified way to manage your schedule
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
