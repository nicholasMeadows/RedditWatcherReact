import { useAppSelector } from "../redux/store";
import useInitializeApp from "../hook/use-initialize-app.ts";

const AppInitialization: React.FC = () => {
  useInitializeApp();
  const text = useAppSelector((state) => state.appInitialization.text);
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
