import React, { useState } from "react";
import "../styles/Navbar.scss";
import logo from "../icons/logo-512.png"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div onClick={()=>window.location.href="/"} className="navbar-logo"><img src={logo} /></div>

        <div className={`navbar-links ${isOpen ? "open" : ""}`}>
          <a href="/">Home</a>
          {/*<a href="/login">Login</a>*/}
          <a href="/register-vehicle">Register Vehicle</a>
        </div>

        <div
          className={`hamburger ${isOpen ? "active" : ""}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </nav>
  );
}
