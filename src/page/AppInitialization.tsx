import {useContext} from "react";
import {AppInitializationTextContext} from "./RouterView.tsx";

const AppInitialization: React.FC = () => {
  const text = useContext(AppInitializationTextContext)
  return (
    <>
      <div className="app-initialization-wrapper">
        <div className="loader"></div>
        <p className="app-initialization-text">{text}</p>
      </div>
    </>
  );
};

export default AppInitialization;
