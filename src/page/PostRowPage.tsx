import {
  createContext,
  FC,
  MutableRefObject,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import SideBar from "../components/SideBar.tsx";
import PostRow from "../components/PostRow.tsx";
import "../theme/post-row-page.scss";
import IndividualPostRowContext from "../context/individual-post-row-context.ts";
import LoopForPostsProvider from "../components/LoopForPostsProvider.tsx";
import useGetPostLoopPaused from "../hook/use-get-post-loop-paused.ts";
import {
  PostRowPageContext,
  PostRowPageDispatchContext,
} from "../context/post-row-page-context.ts";
import { PostRowPageActionType } from "../reducer/post-row-page-reducer.ts";
import SecondsTillNextPostRowCounter from "../components/SecondsTillNextPostRowCounter.tsx";

interface CountdownTimerOnClickContextState {
  onCountdownClickRef: MutableRefObject<() => void>;
}

export const CountdownTimerOnCLickContext = createContext(
  {} as CountdownTimerOnClickContextState
);

const PostRowPage: FC = () => {
  const { postRows, playPauseButtonIsClicked } = useContext(PostRowPageContext);
  const postRowPageDispatch = useContext(PostRowPageDispatchContext);
  // const { postRowsToShowInView } = useContext(AppConfigStateContext);
  const postRowsDivRef = useRef<HTMLDivElement>(null);
  const postRowPageRef = useRef<HTMLDivElement>(null);

  const [scrollBarWidth, setScrollBarWidth] = useState(0);
  const { isGetPostLoopPaused } = useGetPostLoopPaused();

  useEffect(() => {
    const scrollDiv = postRowsDivRef.current as unknown as HTMLDivElement;
    setScrollBarWidth(scrollDiv.offsetWidth - scrollDiv.clientWidth);
  }, [postRowsDivRef, postRows]);

  useEffect(() => {
    const keyUpEvent = (keyboardEvent: globalThis.KeyboardEvent) => {
      const key = keyboardEvent.key;
      if (key == " ") {
        postRowPageDispatch({
          type: PostRowPageActionType.SET_PLAY_PAUSE_BUTTON_IS_CLICKED,
          payload: !playPauseButtonIsClicked,
        });
      }
    };

    window.addEventListener("keyup", keyUpEvent);
    return () => {
      window.removeEventListener("keyup", keyUpEvent);
    };
  }, [playPauseButtonIsClicked, postRowPageDispatch]);

  const countdownTimerOnClick = useRef(() => {});

  return (
    <CountdownTimerOnCLickContext.Provider
      value={{
        onCountdownClickRef: countdownTimerOnClick,
      }}
    >
      <LoopForPostsProvider>
        <div className="post-row-page" ref={postRowPageRef}>
          <div
            className="post-rows-side-bar-div"
            style={{
              right: `${scrollBarWidth}px`,
            }}
          >
            <SideBar />
          </div>
          <div
            className="post-rows-div"
            ref={postRowsDivRef}
            onScroll={(event) => {
              const target = event.target as HTMLElement;
              postRowPageDispatch({
                type: PostRowPageActionType.SET_SCROLL_Y,
                payload: target.scrollTop,
              });
            }}
          >
            {postRows.map((postRow) => (
              <IndividualPostRowContext.Provider
                value={{
                  allPosts: postRow.allPosts,
                  postRowUuid: postRow.postRowUuid,
                  postSliderLeft: postRow.postSliderLeft,
                  postSliderLeftTransitionTime:
                    postRow.postSliderLeftTransitionTime,
                  postCards: postRow.postCards,
                  gottenWithSubredditSourceOption:
                    postRow.gottenWithSubredditSourceOption,
                }}
                key={"post-row-" + postRow.postRowUuid}
              >
                <PostRow />
              </IndividualPostRowContext.Provider>
            ))}
          </div>

          <div
            className={"play-pause-button-div"}
            onClick={() => {
              postRowPageDispatch({
                type: PostRowPageActionType.SET_PLAY_PAUSE_BUTTON_IS_CLICKED,
                payload: !playPauseButtonIsClicked,
              });
            }}
          >
            <img
              src={`assets/${isGetPostLoopPaused ? "pause" : "play"}_black.png`}
              className={"play-pause-button-img"}
            />
          </div>
          <SecondsTillNextPostRowCounter />
        </div>
      </LoopForPostsProvider>
    </CountdownTimerOnCLickContext.Provider>
  );
};

export default PostRowPage;
