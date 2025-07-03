import React from "react";

const Button = ({ children, onClick, variant = "primary" }) => {
  const baseStyle =
    "px-6 py-2 rounded-lg font-semibold transition-all duration-300 focus:outline-none";
  const variants = {
    primary:
      "bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800",
    secondary:
      "bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400",
    outline:
      "border border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white",
  };

  return (
    <button className={`${baseStyle} ${variants[variant]}`} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;