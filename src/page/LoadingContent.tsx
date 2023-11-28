import { useAppSelector } from "../redux/store";

const LoadingContent: React.FC = () => {
  const loadingText = useAppSelector((state) => state.loadingPage.loadingText);
  return (
    <>
      <div className="loading-content-ion-content">
        <div className="loadingContentRootWrapper">
          {/* <IonSpinner
            name="circular"
            className="loadingContentSpinner"
          ></IonSpinner> */}
          <h4 className="loadingContentText">{loadingText}</h4>
        </div>
      </div>
    </>
  );
};

export default LoadingContent;
