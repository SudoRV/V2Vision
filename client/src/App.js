import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import "./App.css";

import Navbar from "./components/Navbar";
import Map from "./pages/Maps";
import Login from "./pages/login";
import VR from "./pages/VehicleRegistration";


const App = () => {
   
  return (
    <Router>      
      <div className="app-container"> {/* Flex parent */}
        <Navbar />
        <div className="app-content"> {/* Flex child (grows) */}
          <Routes>
            <Route path="/" element={<Map />} />
            /*<Route path="/login" element={<Login />} />*/
            <Route path="/register-vehicle" element={<VR />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
