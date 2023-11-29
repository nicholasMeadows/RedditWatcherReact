import { useAppSelector } from "../redux/store";

const LoadingContent: React.FC = () => {
  const loadingText = useAppSelector((state) => state.loadingPage.loadingText);
  return (
    <>
      <div className="loading-wrapper">
        <div className="loader"></div>
        <p className="loadingContentText">{loadingText}</p>
      </div>
    </>
  );
};

export default LoadingContent;
