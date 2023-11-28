// import { useAppDispatch, useAppSelector } from "../../redux/store";
// import PostSortOrderOptionsEnum from "../../model/config/enums/PostSortOrderOptionsEnum";
// import UserFrontPagePostSortOrderOptionsEnum from "../../model/config/enums/UserFrontPagePostSortOrderOptionsEnum";
// import TopTimeFrameOptionsEnum from "../../model/config/enums/TopTimeFrameOptionsEnum";
// import {
//   setPostSortOrderOption,
//   setRedditApiItemLimit,
//   setTopTimeFrameOption,
//   setUserFrontPagePostSortOrderOption,
// } from "../../redux/slice/AppConfigSlice";

const RedditPostSettings: React.FC = () => {
  //   const dispatch = useAppDispatch();

  //   const postSortOrder = useAppSelector(
  //     (state) => state.appConfig.postSortOrderOption
  //   );
  //   const topTimeFrameOption = useAppSelector(
  //     (state) => state.appConfig.topTimeFrameOption
  //   );
  //   const userFrontPagePostSortOrderOption = useAppSelector(
  //     (state) => state.appConfig.userFrontPagePostSortOrderOption
  //   );
  //   const redditApiItemLimit = useAppSelector(
  //     (state) => state.appConfig.redditApiItemLimit
  //   );
  //   const redditApiLimitValidationError = useAppSelector(
  //     (state) => state.appConfig.redditApiItemLimitValidationError
  //   );

  return (
    <>
      <div className="reddit-post-settings-ion-content">
        {/* <IonItem>
          <IonSelect
            label="Post Sort Order"
            labelPlacement="floating"
            value={postSortOrder}
            onIonChange={(event) =>
              dispatch(setPostSortOrderOption(event.detail.value))
            }
          >
            {Object.entries(PostSortOrderOptionsEnum).map((key) => {
              return (
                <IonSelectOption key={key[0]} value={key[1]}>
                  {key[1]}
                </IonSelectOption>
              );
            })}
          </IonSelect>
        </IonItem>

        <IonItem>
          <IonSelect
            label="Top Time Frame"
            labelPlacement="floating"
            value={topTimeFrameOption}
            onIonChange={(event) =>
              dispatch(setTopTimeFrameOption(event.detail.value))
            }
          >
            {Object.entries(TopTimeFrameOptionsEnum).map((key) => {
              return (
                <IonSelectOption key={key[0]} value={key[1]}>
                  {key[1]}
                </IonSelectOption>
              );
            })}
          </IonSelect>
        </IonItem>

        <IonItem>
          <IonSelect
            label="User front Page Option"
            labelPlacement="floating"
            value={userFrontPagePostSortOrderOption}
            onIonChange={(event) =>
              dispatch(setUserFrontPagePostSortOrderOption(event.detail.value))
            }
          >
            {Object.entries(UserFrontPagePostSortOrderOptionsEnum).map(
              (key) => {
                return (
                  <IonSelectOption key={key[0]} value={key[1]}>
                    {key[1]}
                  </IonSelectOption>
                );
              }
            )}
          </IonSelect>
        </IonItem>

        <IonItem>
          <IonInput
            label="Reddit API Limit"
            labelPlacement="floating"
            value={redditApiItemLimit}
            type="number"
            onIonChange={(event) =>
              dispatch(setRedditApiItemLimit(event.detail.value))
            }
          ></IonInput>
        </IonItem>
        <IonText style={{ color: "red", marginLeft: "16px" }}>
          {redditApiLimitValidationError}
        </IonText> */}
      </div>
    </>
  );
};

export default RedditPostSettings;
