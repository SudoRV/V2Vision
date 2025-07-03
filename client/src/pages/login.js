import React, { useState } from "react";
import "../styles/Login.scss";

export default function V2VisionLogin() {
  const [form, setForm] = useState({
    fname: "",
    lname: "",
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", form);
  };

  return (
    <div className="v2vision-container">
      <form className="v2vision-form" onSubmit={handleSubmit}>
        <h2>Login to <span>V2Vision</span></h2>

        <div className="form-row">
          <div className="form-group name">
            <label>First Name</label>
            <input type="text" name="fname" value={form.fname} onChange={handleChange} required />
          </div>
          <div className="form-group name">
            <label>Last Name</label>
            <input type="text" name="lname" value={form.lname} onChange={handleChange} required />
          </div>
        </div>

        <div className="form-group">
          <label>Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Password</label>
          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="toggle-btn"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <button type="submit" className="submit-btn">Login</button>
      </form>
    </div>
  );
}