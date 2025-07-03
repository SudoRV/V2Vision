import { useState, useEffect } from "react";
import { MdFullscreen, MdScreenRotation, MdFullscreenExit } from "react-icons/md";

export default function RotateButton({onClick}) {
  const [iconStage, setIconStage] = useState(0);
  
  const handleClick = async () => {
    if (iconStage === 0) {
      onClick(0);
      await document.documentElement.requestFullscreen();
      document.getElementById("map").style.height = `${window.innerHeight}px`;
      setIconStage(1);
    } else if (iconStage === 1) {
      onClick(2);
      await window.screen.orientation.lock("landscape");
      setIconStage(2);
    } else if (iconStage === 2) {
      onClick(3);
      await window.screen.orientation.lock("portrait");
      setIconStage(3);
    } else {
      onClick(1);
      window.screen.orientation.unlock();
      await document.exitFullscreen();          
      setIconStage(0);
    }
  };

  const renderIcon = () => {
    switch (iconStage) {
      case 0:       
        return <MdFullscreen color="rgb(60,60,60)" size={26} />;
      case 1:
      case 2:
        return <MdScreenRotation color="rgb(60,60,60)" size={24} />;
      case 3:
        return <MdFullscreenExit color="rgb(60,60,60)" size={26} />;
      default:
        return null;
    }
  };

  return (
    <button className="flex aic jcc" style={{ justifyContent:"center !important" }} onClick={handleClick}>
      {renderIcon()}
    </button>
  );
}
