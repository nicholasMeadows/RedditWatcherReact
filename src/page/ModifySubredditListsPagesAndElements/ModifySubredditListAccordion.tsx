import { MouseEvent, useRef } from "react";
import SubredditListContextMenuEvent from "../../model/Events/SubredditListContextMenuEvent";
import SubredditListItemContextMenuEvent from "../../model/Events/SubredditListItemContextMenuEvent";
import { SubredditLists } from "../../model/SubredditList/SubredditLists";
import { toggleSubredditListSelected } from "../../redux/slice/RedditListsSlice";
import { useAppDispatch } from "../../redux/store";
import { useContextMenu } from "../../hook/use-context-menu.ts";

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
  const contextMenu = useContextMenu();
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
          contextMenu.setSubredditListContextMenuEvent(
            subredditListContextMenuEvent
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
        {subredditList.subreddits.map((subreddit) => (
          <p
            className="text-color subreddit-name-text"
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
              contextMenu.setSubredditListItemContextMenuEvent(
                subredditListItemContextMenuEvent
              );
            }}
          >
            {subreddit.displayName}
          </p>
        ))}
      </div>
    </>
  );
};
export default ModifySubredditListAccordion;
