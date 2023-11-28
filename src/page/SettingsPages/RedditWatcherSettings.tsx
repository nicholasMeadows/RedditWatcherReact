// import { useAppDispatch, useAppSelector } from "../../redux/store";
// import {
//   setConcatRedditUrlMaxLength,
//   setContentFiltering,
//   setPostRowScrollOption,
//   setPostRowsToShowInView,
//   setPostsToShowInRow,
//   setRandomIterationSelectWeightOption,
//   setRowIncrementOption,
//   setSelectSubredditIterationMethodOption,
//   setSelectSubredditListMenuSortOption,
//   setSelectedSubredditListSortOption,
//   setSortOrderDirectionOption,
//   setSubredditSortOrderOption,
// } from "../../redux/slice/AppConfigSlice";
// import SubredditSortOrderOptionsEnum from "../../model/config/enums/SubredditSortOrderOptionsEnum";
// import RowIncrementOptionsEnum from "../../model/config/enums/RowIncrementOptionsEnum";
// import PostRowScrollOptionsEnum from "../../model/config/enums/PostRowScrollOptionsEnum";
// import SelectedSubredditListSortOptionEnum from "../../model/config/enums/SelectedSubredditListSortOptionEnum";
// import RandomIterationSelectWeightOptionsEnum from "../../model/config/enums/RandomIterationSelectWeightOptionsEnum";
// import SelectSubredditListMenuSortOptionEnum from "../../model/config/enums/SelectSubredditListMenuSortOptionEnum";
// import SortOrderDirectionOptionsEnum from "../../model/config/enums/SortOrderDirectionOptionsEnum";
// import SelectSubredditIterationMethodOptionsEnum from "../../model/config/enums/SelectSubredditIterationMethodOptionsEnum";
// import ContentFilteringOptionEnum from "../../model/config/enums/ContentFilteringOptionEnum";

const RedditWatcherSettings: React.FC = () => {
  //   const dispatch = useAppDispatch();

  //   const subredditSortOrderOption = useAppSelector(
  //     (state) => state.appConfig.subredditSortOrderOption
  //   );
  //   const rowIncrementOption = useAppSelector(
  //     (state) => state.appConfig.rowIncrementOption
  //   );
  //   const postRowScrollOption = useAppSelector(
  //     (state) => state.appConfig.postRowScrollOption
  //   );
  //   const selectedSubredditListSortOption = useAppSelector(
  //     (state) => state.appConfig.selectedSubredditListSortOption
  //   );
  //   const randomIterationSelectWeightOption = useAppSelector(
  //     (state) => state.appConfig.randomIterationSelectWeightOption
  //   );
  //   const selectSubredditListMenuSortOption = useAppSelector(
  //     (state) => state.appConfig.selectSubredditListMenuSortOption
  //   );
  //   const sortOrderDirectionOption = useAppSelector(
  //     (state) => state.appConfig.sortOrderDirectionOption
  //   );
  //   const selectSubredditIterationMethodOption = useAppSelector(
  //     (state) => state.appConfig.selectSubredditIterationMethodOption
  //   );
  //   const concatRedditUrlMaxLength = useAppSelector(
  //     (state) => state.appConfig.concatRedditUrlMaxLength
  //   );
  //   const concatRedditUrlMaxLengthValidationError = useAppSelector(
  //     (state) => state.appConfig.concatRedditUrlMaxLengthValidationError
  //   );
  //   const contentFiltering = useAppSelector(
  //     (state) => state.appConfig.contentFiltering
  //   );
  //   const postsToShowInRow = useAppSelector(
  //     (state) => state.appConfig.postsToShowInRow
  //   );
  //   const postsToShowInRowValidationError = useAppSelector(
  //     (state) => state.appConfig.postsToShowInRowValidationError
  //   );
  //   const postRowsToShowInView = useAppSelector(
  //     (state) => state.appConfig.postRowsToShowInView
  //   );
  //   const postRowsToShowInViewValidationError = useAppSelector(
  //     (state) => state.appConfig.postRowsToShowInViewValidationError
  //   );

  return (
    <>
      <div className="reddit-watcher-settings-ion-content">
        {/* <IonItem>
          <IonSelect
            label="Subreddit Sort"
            labelPlacement="floating"
            value={subredditSortOrderOption}
            onIonChange={(event) =>
              dispatch(setSubredditSortOrderOption(event.detail.value))
            }
          >
            {Object.entries(SubredditSortOrderOptionsEnum).map((key) => {
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
            label="Row Increment"
            labelPlacement="floating"
            value={rowIncrementOption}
            onIonChange={(event) =>
              dispatch(setRowIncrementOption(event.detail.value))
            }
          >
            {Object.entries(RowIncrementOptionsEnum).map((key) => {
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
            label="Post Row Scroll"
            labelPlacement="floating"
            value={postRowScrollOption}
            onIonChange={(event) =>
              dispatch(setPostRowScrollOption(event.detail.value))
            }
          >
            {Object.entries(PostRowScrollOptionsEnum).map((key) => {
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
            label="Subreddit list Sort"
            labelPlacement="floating"
            value={selectedSubredditListSortOption}
            onIonChange={(event) =>
              dispatch(setSelectedSubredditListSortOption(event.detail.value))
            }
          >
            {Object.entries(SelectedSubredditListSortOptionEnum).map((key) => {
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
            label="Random Iteration Weight"
            labelPlacement="floating"
            value={randomIterationSelectWeightOption}
            onIonChange={(event) =>
              dispatch(setRandomIterationSelectWeightOption(event.detail.value))
            }
          >
            {Object.entries(RandomIterationSelectWeightOptionsEnum).map(
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
          <IonSelect
            label="Select Subreddit List Menu Sort"
            labelPlacement="floating"
            value={selectSubredditListMenuSortOption}
            onIonChange={(event) =>
              dispatch(setSelectSubredditListMenuSortOption(event.detail.value))
            }
          >
            {Object.entries(SelectSubredditListMenuSortOptionEnum).map(
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
          <IonSelect
            label="Sort order Direction"
            labelPlacement="floating"
            value={sortOrderDirectionOption}
            onIonChange={(event) =>
              dispatch(setSortOrderDirectionOption(event.detail.value))
            }
          >
            {Object.entries(SortOrderDirectionOptionsEnum).map((key) => {
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
            label="Select Subreddit Iteration method"
            labelPlacement="floating"
            value={selectSubredditIterationMethodOption}
            onIonChange={(event) =>
              dispatch(
                setSelectSubredditIterationMethodOption(event.detail.value)
              )
            }
          >
            {Object.entries(SelectSubredditIterationMethodOptionsEnum).map(
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
            label="Reddit URL Max Length"
            labelPlacement="floating"
            value={concatRedditUrlMaxLength}
            type="number"
            onIonChange={(event) =>
              dispatch(setConcatRedditUrlMaxLength(event.detail.value))
            }
          ></IonInput>
        </IonItem>
        {concatRedditUrlMaxLengthValidationError != undefined && (
          <IonText style={{ color: "red", marginLeft: "16px" }}>
            {concatRedditUrlMaxLengthValidationError}
          </IonText>
        )}

        <IonItem>
          <IonSelect
            label="Content Filtering"
            labelPlacement="floating"
            value={contentFiltering}
            onIonChange={(event) =>
              dispatch(setContentFiltering(event.detail.value))
            }
          >
            {Object.entries(ContentFilteringOptionEnum).map((key) => {
              return (
                <IonSelectOption key={key[0]} value={key[1]}>
                  {key[1]}
                </IonSelectOption>
              );
            })}
          </IonSelect>
        </IonItem>

        <IonItem>
          <IonInput
            label="Posts to Show In Row"
            labelPlacement="floating"
            value={postsToShowInRow}
            type="number"
            onIonChange={(event) =>
              dispatch(setPostsToShowInRow(event.detail.value))
            }
          ></IonInput>
        </IonItem>
        <IonText style={{ color: "red", marginLeft: "16px" }}>
          {postsToShowInRowValidationError}
        </IonText>

        <IonItem>
          <IonInput
            label="Post Rows to Show In View"
            labelPlacement="floating"
            value={postRowsToShowInView}
            type="number"
            onIonChange={(event) =>
              dispatch(setPostRowsToShowInView(event.detail.value))
            }
          ></IonInput>
        </IonItem>
        <IonText style={{ color: "red", marginLeft: "16px" }}>
          {postRowsToShowInViewValidationError}
        </IonText> */}
      </div>
    </>
  );
};

export default RedditWatcherSettings;
