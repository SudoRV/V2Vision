import React from "react";

const GpsIcon = ({ isEnabled, size }) => { return ( <svg
xmlns="http://www.w3.org/2000/svg"
height={`${size}px`}
viewBox="0 -960 960 960"
width={`${size}px`}
fill="#000000"
> <path fill={isEnabled ? "rgb(13,119,242)" : "rgb(60,60,60)"} d="M450-42v-75q-137-14-228-105T117-450H42v-60h75q14-137 105-228t228-105v-75h60v75q137 14 228 105t105 228h75v60h-75q-14 137-105 228T510-117v75h-60Zm30-134q125 0 214.5-89.5T784-480q0-125-89.5-214.5T480-784q-125 0-214.5 89.5T176-480q0 125 89.5 214.5T480-176Z" /> {isEnabled && ( <circle cx="480" cy="-480" r="100" fill={isEnabled ? "rgb(13,119,242)" : "rgb(60,60,60)"} /> )} </svg> ); };

export default GpsIcon;

