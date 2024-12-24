import {MouseEvent, useContext, useRef} from "react";
import {SubredditLists} from "../model/SubredditList/SubredditLists";
import {RedditListDispatchContext} from "../context/reddit-list-context.ts";
import {RedditListActionType} from "../reducer/reddit-list-reducer.ts";
import {ContextMenuDispatchContext} from "../context/context-menu-context.ts";
import {ContextMenuActionType} from "../reducer/context-menu-reducer.ts";

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
    const contextMenuDispatch = useContext(ContextMenuDispatchContext);

    return <>
        <div
            className={`accordion`}
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
                contextMenuDispatch({
                    type: ContextMenuActionType.OPEN_CONTEXT_MENU_FOR_SUBREDDIT_LIST,
                    payload: {
                        subredditList: subredditList,
                        x: event.clientX,
                        y: event.clientY,
                    },
                });
            }}
        >
            <input
                type="checkbox"
                defaultChecked={subredditList.selected}
                className="subredditListCheckbox"
                checked={subredditList.selected}
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

            <div className={'accordion-expand-collapse-icon-box'} onClick={(event) => {
                const panelDiv = panelDivRef.current as unknown as HTMLDivElement;
                panelDiv.style.setProperty(
                    "--panel-div-max-height",
                    `${panelDiv.scrollHeight}px`
                );
                accordionOnClick(event);
            }}>
                <div
                    className={`accordion-expand-collapse-icon ${subredditListUuidClicked == subredditList.subredditListUuid ? "active" : ''}`}></div>
            </div>
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
                        contextMenuDispatch({
                            type: ContextMenuActionType.OPEN_CONTEXT_MENU_FOR_SUBREDDIT_LIST_ITEM,
                            payload: {
                                subredditListItem: subreddit,
                                x: event.clientX,
                                y: event.clientY,
                            },
                        });
                    }}
                >
                    {subreddit.displayName}
                </p>
            ))}
        </div>
    </>
};
export default ModifySubredditListAccordion;
