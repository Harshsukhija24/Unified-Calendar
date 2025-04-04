import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Signup = () => {
  const [timer, setTimer] = useState(30);
  const [isDisabled, setIsDisabled] = useState(true);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const email = localStorage.getItem("userEmail");
  const navigate = useNavigate();

  useEffect(() => {
    // If no email is found, redirect back to login
    if (!email) {
      toast.error("Please login first");
      navigate("/");
      return;
    }

    // Start countdown timer for OTP resend
    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(countdown);
    } else {
      setIsDisabled(false);
    }
  }, [timer, email, navigate]);

  const handleResendOTP = async () => {
    setTimer(30);
    setIsDisabled(true);

    try {
      const response = await fetch("http://localhost:5000/emaillogin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        toast.success("OTP resent successfully!");
      } else {
        toast.error(data.msg || "Failed to resend OTP");
      }
    } catch (error) {
      console.error("Error resending OTP:", error);
      toast.error("Failed to resend OTP. Try again later.");
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      toast.error("Please enter the OTP");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/emailverify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Save authentication data
        localStorage.setItem("authToken", data.accessToken);
        localStorage.setItem(
          "userName",
          data.user?.name || email.split("@")[0]
        );

        toast.success("OTP verified successfully!");
        navigate("/dashboard");
      } else {
        toast.error(data.msg || "Invalid OTP");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("Failed to verify OTP. Try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-xl overflow-hidden border border-white/20">
        <div className="px-6 py-8 sm:px-10">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white">Verify Your Email</h2>
            <p className="mt-1 text-sm text-white/70">
              We&apos;ve sent an OTP to {email || "your email"}
            </p>
          </div>

          <div className="mt-6">
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-white"
                >
                  One-Time Password
                </label>
                <div className="mt-1">
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full bg-white/10 border border-white/30 rounded-md py-3 px-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  />
                </div>
                <div className="flex justify-between items-center mt-2 text-sm">
                  <button
                    onClick={handleResendOTP}
                    disabled={isDisabled}
                    className={`text-cyan-300 hover:text-cyan-100 transition-colors ${
                      isDisabled ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    Resend OTP
                  </button>
                  <span className="text-white/70">
                    {timer > 0 ? `${timer}s` : "Ready to resend"}
                  </span>
                </div>
              </div>

              <div>
                <button
                  onClick={handleVerifyOTP}
                  disabled={isLoading}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-400 transition duration-200 transform hover:scale-[1.02] ${
                    isLoading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? "Verifying..." : "Verify & Continue"}
                </button>
              </div>
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-white/70">
                <Link to="/" className="text-cyan-400 hover:text-cyan-300">
                  Back to Login
                </Link>
              </p>
            </div>
          </div>
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

export default Signup;
