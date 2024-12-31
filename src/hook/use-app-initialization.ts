import {useCallback, useContext, useEffect, useRef} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {AppConfigDispatchContext, AppConfigStateContext} from "../context/app-config-context.ts";
import {RedditListDispatchContext, RedditListStateContext} from "../context/reddit-list-context.ts";
import {RedditServiceDispatchContext, RedditServiceStateContext} from "../context/reddit-service-context.ts";
import {PostRowPageContext} from "../context/post-row-page-context.ts";
import {APP_INITIALIZATION_ROUTE, POST_ROW_ROUTE, REDDIT_SIGN_IN_ROUTE} from "../RedditWatcherConstants.ts";
import {loadConfig, loadSubredditListsFromFile, saveConfig} from "../service/ConfigService.ts";
import {AppConfigActionType} from "../reducer/app-config-reducer.ts";
import {SubredditLists} from "../model/SubredditList/SubredditLists.ts";
import {v4 as uuidV4} from 'uuid'
import {RedditListActionType} from "../reducer/reddit-list-reducer.ts";
import {RedditAuthenticationStatus} from "../model/RedditAuthenticationState.ts";
import RedditClient from "../client/RedditClient.ts";
import {RedditServiceActions} from "../reducer/reddit-service-reducer.ts";
import useReddit, {GetPostsForPostRowResponse} from "./use-reddit.ts";

export function useAppInitialization(setInitializationText: (text: string) => void) {
    const navigate = useNavigate();
    const location = useLocation();

    const appConfigDispatch = useContext(AppConfigDispatchContext);
    const redditListDispatch = useContext(RedditListDispatchContext);
    const redditServiceDispatch = useContext(RedditServiceDispatchContext);

    const appConfig = useContext(AppConfigStateContext);
    const {subredditListsLoaded} = useContext(RedditListStateContext);
    const {redditAuthenticationStatus} = useContext(RedditServiceStateContext);
    const {masterSubscribedSubredditList} = useContext(
        RedditServiceStateContext
    );
    const {postRows} = useContext(PostRowPageContext);
    const {loadSubscribedSubreddits, getPostsForPostRow, applyUpdatedStateValues} = useReddit();

    const gettingFirstPostRow = useRef(false);
    const startedFetchingSubscribedSubreddits = useRef(false);

    useEffect(() => {
        if (location.pathname !== APP_INITIALIZATION_ROUTE &&
            (!appConfig.configLoaded ||
                !subredditListsLoaded ||
                redditAuthenticationStatus === RedditAuthenticationStatus.NOT_YET_AUTHED ||
                masterSubscribedSubredditList.length == 0 ||
                postRows.length == 0)
        ) {
            navigate(APP_INITIALIZATION_ROUTE, {replace: true});
        }
    }, [location, appConfig.configLoaded, masterSubscribedSubredditList.length, postRows.length, redditAuthenticationStatus, subredditListsLoaded, navigate]);

    const loadConfigAsync = useCallback(async () => {
        setInitializationText("Loading App Config...");
        console.log("App Initialization - loadConfigAsync");
        const loadedConfig = await loadConfig();
        appConfigDispatch({
            type: AppConfigActionType.SET_APP_CONFIG,
            payload: loadedConfig,
        });
    }, [appConfigDispatch, setInitializationText]);

    const loadSubredditListsAsync = useCallback(async () => {
        setInitializationText("Loading Subreddit Lists...");
        console.log("App Initialization - loadSubredditListsAsync");
        let subredditListsLocal: SubredditLists[] = [];
        try {
            subredditListsLocal = await loadSubredditListsFromFile();
        } catch (e) {
            console.log("Error thrown while loading subreddit lists", e);
        }
        const mappedSubredditLists = subredditListsLocal.map((list) => {
            list.subredditListUuid = uuidV4();
            list.subreddits = list.subreddits.map((subreddit) => ({
                ...subreddit,
                subredditUuid: uuidV4(),
            }));
            return list;
        });
        redditListDispatch({
            type: RedditListActionType.SET_SUBREDDIT_LISTS,
            payload: mappedSubredditLists,
        });
    }, [redditListDispatch, setInitializationText]);

    const authReddit = useCallback(async () => {
        setInitializationText("Logging in...");
        console.log("App Initialization - authReddit");
        const redditCredentials = appConfig.redditCredentials;
        if (redditCredentials === undefined) {
            navigate(REDDIT_SIGN_IN_ROUTE);
            return;
        }

        const username = redditCredentials.username;
        const password = redditCredentials.password;
        const clientId = redditCredentials.clientId;
        const clientSecret = redditCredentials.clientSecret;

        if (
            username == "" ||
            password == "" ||
            clientId == "" ||
            clientSecret == ""
        ) {
            navigate(REDDIT_SIGN_IN_ROUTE);
            return;
        }

        if (
            redditAuthenticationStatus === RedditAuthenticationStatus.NOT_YET_AUTHED
        ) {
            console.log("Authenticating Reddit");
            try {
                if (
                    redditCredentials.username != undefined &&
                    redditCredentials.password != undefined &&
                    redditCredentials.clientId != undefined &&
                    redditCredentials.clientSecret != undefined
                ) {
                    await new RedditClient(redditCredentials).authenticate();
                    saveConfig(appConfig);
                    redditServiceDispatch({
                        type: RedditServiceActions.SET_REDDIT_AUTHENTICATION_STATUS,
                        payload: {
                            authenticationStatus: RedditAuthenticationStatus.AUTHENTICATED,
                        },
                    });
                    return;
                }
            } catch (e) {
                console.log("Could not log into reddit.", e);
            }
            console.log("Reddit credentials were undefined");
            redditServiceDispatch({
                type: RedditServiceActions.SET_REDDIT_AUTHENTICATION_STATUS,
                payload: {
                    authenticationStatus:
                    RedditAuthenticationStatus.AUTHENTICATION_DENIED,
                },
            });
        } else if (
            redditAuthenticationStatus ==
            RedditAuthenticationStatus.AUTHENTICATION_DENIED
        ) {
            navigate(REDDIT_SIGN_IN_ROUTE);
        }
    }, [appConfig, navigate, redditAuthenticationStatus, redditServiceDispatch, setInitializationText]);

    const fetchSubscribedSubreddits = useCallback(async () => {
        setInitializationText("Loading Subscribed Subreddits...");
        await loadSubscribedSubreddits(appConfig.redditApiItemLimit);
    }, [appConfig.redditApiItemLimit, loadSubscribedSubreddits, setInitializationText]);

    const getFirstPosts = useCallback(async () => {
        console.log("App Initialization - getFirstPosts");
        let getPostsForPostRowResponse: GetPostsForPostRowResponse;
        do {
            getPostsForPostRowResponse = await getPostsForPostRow();
            applyUpdatedStateValues(getPostsForPostRowResponse);
            if (
                getPostsForPostRowResponse.newValues.posts === undefined ||
                getPostsForPostRowResponse.newValues.posts.length === 0
            ) {
                console.log(
                    "Got 0 posts while trying to get first post row. Pausing for 5 second then trying again."
                );
                await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000));
            }
        } while (
            getPostsForPostRowResponse.newValues.posts === undefined ||
            getPostsForPostRowResponse.newValues.posts.length === 0
            );
    }, [getPostsForPostRow, applyUpdatedStateValues]);

    useEffect(() => {
        if (location.pathname !== APP_INITIALIZATION_ROUTE) {
            return;
        }
        if (!appConfig.configLoaded) {
            loadConfigAsync();
        } else if (redditAuthenticationStatus === RedditAuthenticationStatus.NOT_YET_AUTHED) {
            authReddit();
        } else if (redditAuthenticationStatus === RedditAuthenticationStatus.AUTHENTICATED && !subredditListsLoaded) {
            loadSubredditListsAsync();
        } else if (subredditListsLoaded && !startedFetchingSubscribedSubreddits.current && masterSubscribedSubredditList.length === 0) {
            startedFetchingSubscribedSubreddits.current = true;
            fetchSubscribedSubreddits().then(() => {
                startedFetchingSubscribedSubreddits.current = false;
            });
        } else if (!gettingFirstPostRow.current && masterSubscribedSubredditList.length > 0 && postRows.length === 0) {
            gettingFirstPostRow.current = true;
            getFirstPosts().then(() => {
                gettingFirstPostRow.current = false;
                navigate(POST_ROW_ROUTE);
            })
        }
    }, [appConfig.configLoaded, authReddit, fetchSubscribedSubreddits, getFirstPosts, loadConfigAsync, loadSubredditListsAsync, location.pathname, masterSubscribedSubredditList.length, navigate, postRows.length, redditAuthenticationStatus, subredditListsLoaded]);
}
