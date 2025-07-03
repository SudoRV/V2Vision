import React from 'react';
import '../styles/Loader.scss'; 
import logo from "../icons/favicon.png";

const Loader = () => {
  return (
    <div id="loader" className="loader-container">
      <img
        src={logo}
        alt="Loading"
        className="loader-icon"
      />
    </div>
  );
};

export default Loader;