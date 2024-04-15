import useInitializeApp from "../hook/use-initialize-app.ts";

const AppInitialization: React.FC = () => {
  const text = useInitializeApp();
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
