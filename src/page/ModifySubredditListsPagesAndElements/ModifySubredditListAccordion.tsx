import { MouseEvent, useRef } from "react";
import { SubredditLists } from "../../model/SubredditList/SubredditLists";
import { toggleSubredditListSelected } from "../../redux/slice/RedditListsSlice";
import { useAppDispatch } from "../../redux/store";
import {
  setSubredditListContextMenuEvent,
  setSubredditListItemContextMenuEvent,
} from "../../redux/slice/ContextMenuSlice";
import SubredditListItemContextMenuEvent from "../../model/Events/SubredditListItemContextMenuEvent";
import SubredditListContextMenuEvent from "../../model/Events/SubredditListContextMenuEvent";

type Props = {
  subredditList: SubredditLists;
  subredditListUuidClicked: string | undefined;
  accordionOnClick: (event: MouseEvent) => void;
};
const ModifySubredditListAccordion: React.FC<Props> = ({
  subredditList,
  subredditListUuidClicked,
  accordionOnClick,
}) => {
  const dispatch = useAppDispatch();
  const panelDivRef = useRef(null);
  return (
    <>
      <div
        className={`accordion ${
          subredditListUuidClicked == subredditList.subredditListUuid
            ? "active"
            : ""
        }`}
        onClick={(event) => {
          const panelDiv = panelDivRef.current as unknown as HTMLDivElement;
          panelDiv.style.setProperty(
            "--panel-div-max-height",
            `${panelDiv.scrollHeight}px`
          );
          accordionOnClick(event);
        }}
        onContextMenu={(event) => {
          event.preventDefault();
          event.stopPropagation();
          const subredditListContextMenuEvent: SubredditListContextMenuEvent = {
            subredditList: subredditList,
            x: event.clientX,
            y: event.clientY,
          };
          dispatch(
            setSubredditListContextMenuEvent({
              event: subredditListContextMenuEvent,
            })
          );
        }}
      >
        <input
          key={Math.random()}
          type="checkbox"
          defaultChecked={subredditList.selected}
          className="subredditListCheckbox"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          onChange={() => {
            dispatch(toggleSubredditListSelected(subredditList));
          }}
        />
        <label className="subredditListLabel text-color">
          {subredditList.listName}
        </label>
      </div>

      <div
        className={`panel ${
          subredditList.subredditListUuid == subredditListUuidClicked
            ? "panel-open"
            : ""
        }  accordion-background`}
        ref={panelDivRef}
      >
        <div>
          {subredditList.subreddits.map((subreddit) => (
            <p
              className="text-color"
              key={subreddit.subredditUuid}
              onContextMenu={(event) => {
                event.preventDefault();
                event.stopPropagation();
                const subredditListItemContextMenuEvent: SubredditListItemContextMenuEvent =
                  {
                    subreddit: subreddit,
                    x: event.clientX,
                    y: event.clientY,
                  };
                dispatch(
                  setSubredditListItemContextMenuEvent({
                    event: subredditListItemContextMenuEvent,
                  })
                );
              }}
            >
              {subreddit.displayName}
            </p>
          ))}
        </div>
      </div>
    </>
  );
};
export default ModifySubredditListAccordion;
