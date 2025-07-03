import React, { useState, useEffect, useRef } from "react";
import "../styles/VehicleRegistration.scss";

export default function VehicleRegistration() {
  const [form, setForm] = useState({
    vehicleType: "",
    fourWheelerType: "",
    vehicleNumber: ""
  });

  const [showVehicleTypeOptions, setShowVehicleTypeOptions] = useState(false);
  const [showFourWheelerOptions, setShowFourWheelerOptions] = useState(false);
  const wrapperRef = useRef(null);

  // Load saved data from localStorage when component mounts
  useEffect(() => {
    const savedData = localStorage.getItem("vehicleRegistrationData");
    if (savedData) {
      setForm(JSON.parse(savedData));
    }

    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowVehicleTypeOptions(false);
        setShowFourWheelerOptions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCustomSelect = (type, value) => {
    setForm((prev) => ({
      ...prev,
      [type]: value,
      ...(type === "vehicleType" && value !== "Four Wheeler" ? { fourWheelerType: "" } : {})
    }));

    if (type === "vehicleType") setShowVehicleTypeOptions(false);
    if (type === "fourWheelerType") setShowFourWheelerOptions(false);
  };

  const handleInput = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Save form data to localStorage
    localStorage.setItem("vehicleRegistrationData", JSON.stringify(form));

    console.log("Submitted & saved to localStorage:", form);
    alert("Vehicle registered successfully!");
  };

  const vehicleOptions = ["Two Wheeler", "Four Wheeler"];
  const fourWheelerOptions = ["Car", "Truck", "Bus", "Pickup", "Other"];

  return (
    <div className="vehicle-registration-container">
      <form className="vehicle-registration-form" onSubmit={handleSubmit} ref={wrapperRef}>
        <h2>Vehicle Registration</h2>

        {/* Vehicle Type Selector */}
        <div className="form-group">
          <label>Vehicle Type</label>
          <div className="custom-select">
            <div
              className="selected"
              onClick={() => {
                setShowVehicleTypeOptions(!showVehicleTypeOptions);
                setShowFourWheelerOptions(false);
              }}
            >
              {form.vehicleType || "Select Vehicle Type"}
            </div>
            <ul className={`options ${showVehicleTypeOptions ? "show" : ""}`}>
              {vehicleOptions.map((option, index) => (
                <li key={index} onClick={() => handleCustomSelect("vehicleType", option)}>
                  {option}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Four Wheeler Type Selector */}
        {form.vehicleType === "Four Wheeler" && (
          <div className="form-group">
            <label>Four Wheeler Type</label>
            <div className="custom-select">
              <div
                className="selected"
                onClick={() => {
                  setShowFourWheelerOptions(!showFourWheelerOptions);
                  setShowVehicleTypeOptions(false);
                }}
              >
                {form.fourWheelerType || "Select Type"}
              </div>
              <ul className={`options ${showFourWheelerOptions ? "show" : ""}`}>
                {fourWheelerOptions.map((option, index) => (
                  <li key={index} onClick={() => handleCustomSelect("fourWheelerType", option)}>
                    {option}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Vehicle Number */}
        <div className="form-group">
          <label>Vehicle Number</label>
          <input
            type="text"
            name="vehicleNumber"
            value={form.vehicleNumber}
            onChange={handleInput}
            placeholder="e.g. DL01AB1234"
            required
          />
        </div>

        <button type="submit" className="submit-btn">Register</button>
      </form>
    </div>
  );
}