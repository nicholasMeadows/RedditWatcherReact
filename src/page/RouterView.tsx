import {KeepAwake} from "@capacitor-community/keep-awake";
import {createContext, useCallback, useContext, useEffect, useRef, useState} from "react";
import {Navigate, Route, Routes, useLocation} from "react-router-dom";
import {
    APP_INITIALIZATION_ROUTE,
    APPLICATION_SETTINGS_ROUTE,
    MODIFY_SUBREDDIT_LISTS_ROUTE,
    MODIFY_SUBREDDIT_QUEUE_ROUTE,
    NAVIGATION_HAMBURGER_TOOLBAR_HEIGHT,
    NOT_FOUND_404,
    POST_CARD_GAP_EM,
    POST_ROW_ROUTE,
    POST_ROW_SCROLL_BTN_WIDTH_EM,
    REDDIT_SIGN_IN_ROUTE,
    REDDIT_SOURCE_SETTINGS_ROUTE,
    SINGLE_POST_ROUTE,
} from "../RedditWatcherConstants";
import AppInitialization from "./AppInitialization";
import ContextMenu from "../components/ContextMenu";
import ModifySubredditLists from "./ModifySubredditLists";
import ModifySubredditQueue from "./ModifySubredditQueue";
import NavigationHamburgerMenu from "../components/NavigationHamburgerMenu.tsx";
import PostRowPage from "./PostRowPage.tsx";
import SinglePostView from "./SinglePostView.tsx";
import RedditSourceSettings from "./RedditSourceSettings.tsx";
import RedditSignIn from "./RedditSignIn.tsx";
import ApplicationSettings from "./ApplicationSettings.tsx";
import {RootFontSizeContext} from "../context/root-font-size-context.ts";
import AppNotifications from "../components/AppNotifications.tsx";
import {
    AppConfigDispatchContext,
    AppConfigStateContext,
} from "../context/app-config-context.ts";
import {AppConfigActionType} from "../reducer/app-config-reducer.ts";
import {PostRowPageActionType} from "../reducer/post-row-page-reducer.ts";
import {ContextMenuDispatchContext} from "../context/context-menu-context.ts";
import {ContextMenuActionType} from "../reducer/context-menu-reducer.ts";
import {PostRowPageDispatchContext} from "../context/post-row-page-context.ts";
import NotFound from "./NotFound.tsx";
import {useAppInitialization} from "../hook/use-app-initialization.ts";

export const AppInitializationTextContext = createContext<string>('');

const RouterView: React.FC = () => {
    const location = useLocation();
    const postRowPageDispatch = useContext(PostRowPageDispatchContext);
    const {rootFontSizeDispatch} = useContext(RootFontSizeContext);
    const appConfigDispatch = useContext(AppConfigDispatchContext);
    const darkmode = useContext(AppConfigStateContext).darkMode;
    const {postRowsToShowInView, postsToShowInRow} = useContext(
        AppConfigStateContext
    );
    const contextMenuDispatch = useContext(ContextMenuDispatchContext);

    const wheelEventHandler = useCallback(
        (event: WheelEvent) => {
            const ctrlKeyPressed = event.ctrlKey;
            if (ctrlKeyPressed) {
                event.preventDefault();

                const deltaY = event.deltaY;
                if (deltaY > 0) {
                    appConfigDispatch({
                        type: AppConfigActionType.SET_POSTS_TO_SHOW_IN_ROW,
                        payload: postsToShowInRow + 0.1,
                    });
                    appConfigDispatch({
                        type: AppConfigActionType.SET_POST_ROWS_TO_SHOW_IN_VIEW,
                        payload: postRowsToShowInView + 0.1,
                    });
                } else if (deltaY < 0) {
                    appConfigDispatch({
                        type: AppConfigActionType.SET_POSTS_TO_SHOW_IN_ROW,
                        payload: postsToShowInRow - 0.1,
                    });
                    appConfigDispatch({
                        type: AppConfigActionType.SET_POST_ROWS_TO_SHOW_IN_VIEW,
                        payload: postRowsToShowInView - 0.1,
                    });
                }
            }
        },
        [appConfigDispatch, postRowsToShowInView, postsToShowInRow]
    );

    useEffect(() => {
        document.addEventListener("wheel", wheelEventHandler, {passive: false});
        KeepAwake.keepAwake();

        return () => {
            document.removeEventListener("wheel", wheelEventHandler);
        };
    }, [wheelEventHandler]);

    useEffect(() => {
        const documentClickedEvent = () => {
            contextMenuDispatch({
                type: ContextMenuActionType.CLOSE_CONTEXT_MENU,
            });
        };
        document.addEventListener("click", documentClickedEvent);
        return () => {
            document.removeEventListener("click", documentClickedEvent);
        };
    }, [contextMenuDispatch]);

    useEffect(() => {
        postRowPageDispatch({
            type: PostRowPageActionType.SET_CURRENT_LOCATION,
            payload: location.pathname,
        });
    }, [location, postRowPageDispatch]);

    useEffect(() => {
        let background = "white";
        let textColor = "black";
        let accordionHoverColor = "#ccc";
        let accordionBackground = "#dadada";
        let borderColor = "#c9c9c9";

        if (darkmode) {
            background = "#292a2e";
            textColor = "white";
            accordionHoverColor = "#494949";
            accordionBackground = "#464646";
            borderColor = "white";
        }
        document.body.style.setProperty("--background", background);
        document.body.style.setProperty("--text-color", textColor);
        document.body.style.setProperty(
            "--accordion-hover-color",
            accordionHoverColor
        );
        document.body.style.setProperty(
            "--accordion-background",
            accordionBackground
        );
        document.body.style.setProperty("--app-border-color", borderColor);
        document.body.style.setProperty(
            "--post-row-scroll-btn-width-em",
            POST_ROW_SCROLL_BTN_WIDTH_EM.toString()
        );

        document.body.style.setProperty(
            "--post-card-gap-em",
            POST_CARD_GAP_EM.toString()
        );
    }, [darkmode]);

    const rootDivRef = useRef(null);
    useEffect(() => {
        const contentResizeObserver = new ResizeObserver(() => {
            if (rootDivRef.current != undefined) {
                const div = rootDivRef.current as unknown as HTMLDivElement;

                const baseFontSize = parseFloat(getComputedStyle(div).fontSize);
                rootFontSizeDispatch(baseFontSize);
            }
        });
        const div = rootDivRef.current;
        if (div != undefined) {
            contentResizeObserver.observe(div);
        }
    }, [postsToShowInRow, rootFontSizeDispatch]);

    const [appInitializationText, setAppInitializationText] = useState<string>('');
    useAppInitialization((text: string) => {
        setAppInitializationText(text);
    });

    return (
        <div className="root-app" ref={rootDivRef}>
            <NavigationHamburgerMenu/>
            <AppNotifications/>
            <ContextMenu/>
            <div
                style={{
                    marginTop: `${NAVIGATION_HAMBURGER_TOOLBAR_HEIGHT}`,
                    height: `calc( 100vh - ${NAVIGATION_HAMBURGER_TOOLBAR_HEIGHT})`,
                    maxHeight: `calc( 100vh - ${NAVIGATION_HAMBURGER_TOOLBAR_HEIGHT})`,
                }}
                className="app-body"
            >
                <AppInitializationTextContext.Provider value={appInitializationText}>
                    <Routes>
                        <Route
                            path="/"
                            element={
                                <Navigate to={APP_INITIALIZATION_ROUTE} replace={true}/>
                            }
                        />
                        <Route
                            index
                            path={APP_INITIALIZATION_ROUTE}
                            element={<AppInitialization/>}
                        />

                        <Route
                            path={REDDIT_SIGN_IN_ROUTE}
                            element={<RedditSignIn/>}
                        />
                        <Route path={POST_ROW_ROUTE} element={<PostRowPage/>}/>
                        <Route
                            path={REDDIT_SOURCE_SETTINGS_ROUTE}
                            element={<RedditSourceSettings/>}
                        />
                        <Route
                            path={APPLICATION_SETTINGS_ROUTE}
                            element={<ApplicationSettings/>}
                        />
                        <Route
                            path={SINGLE_POST_ROUTE}
                            element={<SinglePostView/>}
                        />
                        <Route
                            path={MODIFY_SUBREDDIT_LISTS_ROUTE}
                            element={<ModifySubredditLists/>}
                        />
                        <Route
                            path={MODIFY_SUBREDDIT_QUEUE_ROUTE}
                            element={<ModifySubredditQueue/>}
                        />
                        <Route path={NOT_FOUND_404} element={<NotFound/>}/>
                    </Routes>
                </AppInitializationTextContext.Provider>
            </div>
        </div>
    );
};

export default RouterView;
