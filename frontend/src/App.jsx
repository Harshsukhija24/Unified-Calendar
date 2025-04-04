import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Register from "./pages/Register";
import CalendarDashboard from "./pages/Calendar";
import TeamsPage from "./pages/Teams";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Login />} />
          <Route path="dashboard" element={<CalendarDashboard />} />
          <Route path="teams" element={<TeamsPage />} />
          <Route path="signup" element={<Signup />} />
          <Route path="register" element={<Register />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
