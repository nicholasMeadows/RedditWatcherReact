import { MouseEvent, useContext, useRef } from "react";
import { SubredditLists } from "../model/SubredditList/SubredditLists";
import { RedditListDispatchContext } from "../context/reddit-list-context.ts";
import { RedditListActionType } from "../reducer/reddit-list-reducer.ts";
import useContextMenu from "../hook/use-context-menu.ts";

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
  const redditListDispatch = useContext(RedditListDispatchContext);
  const panelDivRef = useRef(null);
  const {
    openContextMenuForSubredditList,
    openContextMenuForSubredditListItem,
  } = useContextMenu();
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
          openContextMenuForSubredditList(
            subredditList,
            event.clientX,
            event.clientY
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
            redditListDispatch({
              type: RedditListActionType.SET_SUBREDDIT_LIST_SELECTED,
              payload: {
                subredditListUuid: subredditList.subredditListUuid,
                isSelected: !subredditList.selected,
              },
            });
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
              openContextMenuForSubredditListItem(
                subreddit,
                event.clientX,
                event.clientY
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
