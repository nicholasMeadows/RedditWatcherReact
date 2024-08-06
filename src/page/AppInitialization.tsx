import { useAppInitialization } from "../hook/use-app-initialization.ts";

const AppInitialization: React.FC = () => {
  const { text } = useAppInitialization();
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
