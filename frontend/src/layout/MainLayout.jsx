import { Outlet } from "react-router-dom";
import Navbar from "../components/NavBar";
import Footer from "../components/Footer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500">
      <Navbar />
      <div className="flex-1 flex justify-center items-center p-4 md:p-8">
        <Outlet />
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <Footer />
    </div>
  );
};
export default MainLayout;
