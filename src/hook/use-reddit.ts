import {AppConfigStateContext} from "../context/app-config-context.ts";
import {useCallback, useContext, useEffect, useRef} from "react";
import {RedditServiceDispatchContext, RedditServiceStateContext} from "../context/reddit-service-context.ts";
import RedditClient from "../client/RedditClient.ts";
import {RedditServiceActions} from "../reducer/reddit-service-reducer.ts";
import {Subreddit} from "../model/Subreddit/Subreddit.ts";
import {
    GetPostsFromSubredditResponse,
    GetPostsFromSubredditState
} from "../model/converter/GetPostsFromSubredditStateConverter.ts";
import {PostRowPageContext, PostRowPageDispatchContext} from "../context/post-row-page-context.ts";
import {SideBarDispatchContext} from "../context/side-bar-context.ts";
import {AppNotificationsDispatchContext} from "../context/app-notifications-context.ts";
import {AppNotificationsActionType} from "../reducer/app-notifications-reducer.ts";
import {RedditListStateContext} from "../context/reddit-list-context.ts";
import SubredditSourceOptionsEnum from "../model/config/enums/SubredditSourceOptionsEnum.ts";
import {SideBarActionType} from "../reducer/side-bar-reducer.ts";
import {PostRowPageActionType} from "../reducer/post-row-page-reducer.ts";
import {
    filterPostContent,
    filterSubredditsListByUsersOnly,
    getBase64ForImages,
    sortSourceSubreddits
} from "../util/RedditServiceUtil.ts";
import {MAX_POSTS_PER_ROW} from "../RedditWatcherConstants.ts";
import {Post} from "../model/Post/Post.ts";
import {GetPostsForSubredditUrlConverter} from "../model/converter/GetPostsForSubredditUrlConverter.ts";
import {RedditListDotComConverter} from "../model/converter/RedditListDotComConverter.ts";
import {getSubredditsFromRedditListDotCom} from "../service/RedditListDotComClient.ts";
import RandomIterationSelectWeightOptionsEnum from "../model/config/enums/RandomIterationSelectWeightOptionsEnum.ts";
import SelectSubredditIterationMethodOptionsEnum
    from "../model/config/enums/SelectSubredditIterationMethodOptionsEnum.ts";

interface GetSubredditsAndUpdatedInfo {
    subreddits: Subreddit[];
    mostRecentSubredditGotten: undefined | Subreddit;
    subredditIndex: number;
    nsfwRedditListIndex: number;
    subredditsToShowInSideBar: Subreddit[];
    fromSubreddits: Subreddit[];
}

interface GetPostsForPostRowError {
    emitNotification: boolean;
    notificationMessage: string;
}

export interface GetPostsForPostRowResponse {
    newValues: GetPostsFromSubredditResponse;
    getPostsFromSubredditState: GetPostsFromSubredditState;
    encounteredError: boolean
}
export default function useReddit() {
    const redditServiceDispatch = useContext(RedditServiceDispatchContext);//
    const postRowPageDispatch = useContext(PostRowPageDispatchContext);
    const sideBarDispatch = useContext(SideBarDispatchContext);
    const appNotificationDispatch = useContext(AppNotificationsDispatchContext);

    const {
        redditCredentials,
        subredditSourceOption,
        subredditSortOrderOption,
        getAllSubredditsAtOnce,
        contentFiltering,
        concatRedditUrlMaxLength,
        postSortOrderOption,
        topTimeFrameOption,
        redditApiItemLimit,
        selectSubredditIterationMethodOption,
        sortOrderDirectionOption,
        randomIterationSelectWeightOption,
        useInMemoryImagesAndGifs,
        postsToShowInRow,
        postConverterFilteringOptions,
    } = useContext(AppConfigStateContext);
    const {subredditLists} = useContext(RedditListStateContext);
    const {
        masterSubscribedSubredditList,
        subredditIndex,
        nsfwSubredditIndex,
        lastPostRowWasSortOrderNew,
        subredditQueue,
    } = useContext(RedditServiceStateContext);
    const {postRows} = useContext(PostRowPageContext);

    const currentGetPostsFromSubredditValues =
        useRef<GetPostsFromSubredditState>();

    useEffect(() => {
        const {
            redditGalleries,
            urlsThatEndWithDotJpeg,
            urlsThatEndWithDotJpg,
            urlsThatEndWithDotPng,
            urlsThatEndWithDotGif,
            urlsInRedGifsDomain,
            urlsInImgurDomain,
            urlsInGiphyDomain,
        } = postConverterFilteringOptions;
        currentGetPostsFromSubredditValues.current = {
            postRows: postRows,
            subredditSourceOption: subredditSourceOption,
            subredditSortOrderOption: subredditSortOrderOption,
            useInMemoryImagesAndGifs: useInMemoryImagesAndGifs,
            lastPostRowWasSortOrderNew: lastPostRowWasSortOrderNew,
            redditApiItemLimit: redditApiItemLimit,
            concatRedditUrlMaxLength: concatRedditUrlMaxLength,
            postSortOrder: postSortOrderOption,
            topTimeFrame: topTimeFrameOption,
            subredditLists: subredditLists,
            subredditQueue: subredditQueue,
            contentFiltering: contentFiltering,
            getAllSubredditsAtOnce: getAllSubredditsAtOnce,
            nsfwSubredditIndex: nsfwSubredditIndex,
            masterSubredditList: masterSubscribedSubredditList,
            subredditIndex: subredditIndex,
            randomIterationSelectWeightOption: randomIterationSelectWeightOption,
            selectSubredditIterationMethodOption:
            selectSubredditIterationMethodOption,
            sortOrderDirection: sortOrderDirectionOption,
            postConverterFilteringOptions: {
                redditGalleries: redditGalleries,
                urlsInGiphyDomain: urlsInGiphyDomain,
                urlsInImgurDomain: urlsInImgurDomain,
                urlsInRedGifsDomain: urlsInRedGifsDomain,
                urlsThatEndWithDotJpeg: urlsThatEndWithDotJpeg,
                urlsThatEndWithDotGif: urlsThatEndWithDotGif,
                urlsThatEndWithDotPng: urlsThatEndWithDotPng,
                urlsThatEndWithDotJpg: urlsThatEndWithDotJpg,
            },
        };
    }, [
        concatRedditUrlMaxLength,
        contentFiltering,
        postRows,
        postsToShowInRow,
        randomIterationSelectWeightOption,
        redditApiItemLimit,
        redditCredentials,
        selectSubredditIterationMethodOption,
        subredditLists,
        subredditQueue,
        subredditSortOrderOption,
        subredditSourceOption,
        getAllSubredditsAtOnce,
        useInMemoryImagesAndGifs,
        lastPostRowWasSortOrderNew,
        postSortOrderOption,
        topTimeFrameOption,
        nsfwSubredditIndex,
        masterSubscribedSubredditList,
        subredditIndex,
        sortOrderDirectionOption,
        postConverterFilteringOptions,
    ]);

    const loadSubscribedSubreddits = useCallback(
        async (redditApiItemLimit: number, async: boolean = true) => {
            const redditClient = new RedditClient(redditCredentials);
            let results = await redditClient.getSubscribedSubReddits(
                redditApiItemLimit,
                undefined
            );
            redditServiceDispatch({
                type: RedditServiceActions.ADD_TO_MASTER_SUBSCRIBED_SUBREDDIT_LIST,
                payload: {
                    subreddits: results.subreddits,
                },
            });
            const asyncLoopForRemainingSubreddits = async () => {
                const subredditsToAdd = new Array<Subreddit>();
                while (results.after != undefined) {
                    results = await redditClient.getSubscribedSubReddits(
                        redditApiItemLimit,
                        results.after
                    );
                    subredditsToAdd.push(...results.subreddits);
                }
                redditServiceDispatch({
                    type: RedditServiceActions.ADD_TO_MASTER_SUBSCRIBED_SUBREDDIT_LIST,
                    payload: {
                        subreddits: subredditsToAdd,
                    },
                });
            };
            if (async) {
                asyncLoopForRemainingSubreddits();
            } else {
                await asyncLoopForRemainingSubreddits();
            }
        },
        [redditCredentials, redditServiceDispatch]
    );

    const applyUpdatedStateValues = useCallback(
        (getPostsForPostRowResponse:GetPostsForPostRowResponse) => {
            const state = getPostsForPostRowResponse.getPostsFromSubredditState;
            const newValues = getPostsForPostRowResponse.newValues;

            if (newValues.subredditQueueItemToRemove != undefined) {
                redditServiceDispatch({
                    type: RedditServiceActions.REMOVE_SUBREDDIT_QUEUE_ITEM,
                    payload: newValues.subredditQueueItemToRemove,
                });
            }
            if (newValues.mostRecentSubredditGotten != undefined) {
                sideBarDispatch({
                    type: SideBarActionType.SET_MOST_RECENT_SUBREDDIT_GOTTEN,
                    payload: newValues.mostRecentSubredditGotten,
                });
            }
            if (newValues.subredditsToShowInSideBar != undefined) {
                sideBarDispatch({
                    type: SideBarActionType.SET_SUBREDDITS_TO_SHOW_IN_SIDEBAR,
                    payload: {
                        subreddits: newValues.subredditsToShowInSideBar,
                    },
                });
            }
            if (newValues.subredditIndex != undefined) {
                redditServiceDispatch({
                    type: RedditServiceActions.SET_SUBREDDIT_INDEX,
                    payload: newValues.subredditIndex,
                });
            }
            if (newValues.nsfwRedditListIndex != undefined) {
                redditServiceDispatch({
                    type: RedditServiceActions.SET_NSFW_SUBREDDIT_INDEX,
                    payload: newValues.nsfwRedditListIndex,
                });
            }
            if (newValues.posts !== undefined && newValues.posts.length > 0) {
                postRowPageDispatch({
                    type: PostRowPageActionType.ADD_POST_ROW,
                    payload: {
                        posts: newValues.posts,
                        gottenWithPostSortOrderOption:
                        state.postSortOrder,
                        gottenWithSubredditSourceOption:
                        state.subredditSourceOption,
                    },
                });
            }
        },
        [postRowPageDispatch, redditServiceDispatch, sideBarDispatch]
    );

    const handleGottenPosts = useCallback(
        (getPostsForPostRowResponse:GetPostsForPostRowResponse
        ) => {
            const newValues = getPostsForPostRowResponse.newValues;
            const posts = newValues.posts;
            const fromSubreddits = newValues.fromSubreddits;
            if (posts === undefined || posts.length === 0) {
                let msg = `Got 0 posts. Trying again in a little bit.`;
                if (fromSubreddits !== undefined && fromSubreddits.length == 1) {
                    msg = `Got 0 posts from ${fromSubreddits[0].displayNamePrefixed}. Trying again in a little bit.`;
                }
                appNotificationDispatch({
                    type: AppNotificationsActionType.SUBMIT_APP_NOTIFICATION,
                    payload: {
                        message: msg,
                        displayTimeMS: 10000,
                    },
                });
            }
            applyUpdatedStateValues(getPostsForPostRowResponse);
        },
        [appNotificationDispatch, applyUpdatedStateValues]
    );

    const getPostsForSubreddit = useCallback((
        subreddits: Array<Subreddit>,
        getPostsForPostRowResponse: GetPostsForPostRowResponse): Promise<void> => {
        const state = getPostsForPostRowResponse.getPostsFromSubredditState;
        const redditClient = new RedditClient(redditCredentials);
        return new Promise<void>((resolve, reject: (err: GetPostsForPostRowError) => void) => {
            const urlConverter = new GetPostsForSubredditUrlConverter();
            const [url, randomSourceString] = urlConverter.convert(
                subreddits,
                state.concatRedditUrlMaxLength,
                state.postSortOrder,
                state.topTimeFrame,
                state.redditApiItemLimit
            );
            redditClient
                .getPostsForSubredditUri(
                    url,
                    state.masterSubredditList,
                    state.subredditLists,
                    state.postConverterFilteringOptions
                )
                .then((posts) => {
                    const mappedPosts = posts.map<Post>((value) => {
                        value.randomSourceString = randomSourceString;
                        return value;
                    });
                    if (state.useInMemoryImagesAndGifs) {
                        getBase64ForImages(mappedPosts).then(() => {
                            getPostsForPostRowResponse.newValues.posts = mappedPosts;
                            resolve();
                        });
                    } else {
                        getPostsForPostRowResponse.newValues.posts = posts;
                        resolve();
                    }
                })
                .catch((error) => {
                    reject({
                        notificationMessage: "Error getting posts for subreddit: "+ error,
                        emitNotification: true
                    })
                });
        });
    }, [redditCredentials]);

    const getSubredditsToGetPostsForFromRedditListDotCom = useCallback((
        subredditSourceOption: SubredditSourceOptionsEnum
    ): Promise<Subreddit[]> => {
        return new Promise<Array<Subreddit>>((resolve, reject: (err: GetPostsForPostRowError) => void) => {
            console.log("getting from redditlist.com");
            const converter = new RedditListDotComConverter();
            getSubredditsFromRedditListDotCom()
                .then((htmlArray) => {
                    switch (subredditSourceOption) {
                        case SubredditSourceOptionsEnum.RedditListDotComRecentActivity:
                            resolve(
                                converter.convertToReddListDotComRecentActivity(htmlArray)
                            );
                            break;
                        case SubredditSourceOptionsEnum.RedditListDotComSubscribers:
                            resolve(converter.convertToReddListDotComSubscribers(htmlArray));
                            break;
                        case SubredditSourceOptionsEnum.RedditListDotCom24HourGrowth:
                            resolve(converter.convertToReddListDotCom24HourGrowth(htmlArray));
                            break;
                        default:
                            resolve([]);
                    }
                })
                .catch((err) => {
                    reject({
                        emitNotification: true,
                        notificationMessage: "Error while getting subreddits from redditlist.com: " + err
                    })
                });
        });
    }, []);

    const handleGetPostsForUserFrontPage = useCallback((
        getPostsForPostRowResponse: GetPostsForPostRowResponse
    ): Promise<void> => {
        const getPostsFromSubredditsState = getPostsForPostRowResponse.getPostsFromSubredditState;
        const newValues = getPostsForPostRowResponse.newValues;

        return new Promise<void>((resolve, reject: (err: GetPostsForPostRowError) => void) => {

            newValues.fromSubreddits = undefined;
            newValues.subredditsToShowInSideBar = undefined;
            newValues.nsfwRedditListIndex = undefined;
            newValues.subredditIndex = undefined;
            newValues.mostRecentSubredditGotten = undefined;
            newValues.subredditQueueItemToRemove = undefined;


            const redditClient = new RedditClient(redditCredentials);
            redditClient
                .getUserFrontPage(
                    getPostsFromSubredditsState.postSortOrder,
                    getPostsFromSubredditsState.topTimeFrame,
                    getPostsFromSubredditsState.redditApiItemLimit,
                    getPostsFromSubredditsState.masterSubredditList,
                    getPostsFromSubredditsState.subredditLists,
                    getPostsFromSubredditsState.postConverterFilteringOptions
                )
                .then((postsFromSubreddit) => {
                    newValues.posts = postsFromSubreddit;
                    resolve();
                })
                .catch((err) => {
                    reject({
                        emitNotification: true,
                        notificationMessage: "Error while getting user front page " + err
                    })
                });
        });
    }, [redditCredentials]);

    const extractSubredditsToGetFromSourceList = useCallback((sourceSubredditList: Subreddit[], getPostsFromSubredditsState: GetPostsFromSubredditState): GetSubredditsAndUpdatedInfo => {
        const sortedSubreddits = sortSourceSubreddits(
            sourceSubredditList,
            getPostsFromSubredditsState.subredditSourceOption,
            getPostsFromSubredditsState.subredditSortOrderOption,
            getPostsFromSubredditsState.sortOrderDirection
        );

        let index: number;
        let updatedNsfwSubredditIndex = nsfwSubredditIndex;
        let updatedSubredditIndex = subredditIndex;

        if (getAllSubredditsAtOnce) {
            return {
                subreddits: sourceSubredditList,
                mostRecentSubredditGotten: undefined,
                subredditIndex: subredditIndex,
                nsfwRedditListIndex: nsfwSubredditIndex,
                subredditsToShowInSideBar: sortedSubreddits,
                fromSubreddits: sourceSubredditList
            }
        } else if (
            selectSubredditIterationMethodOption ===
            SelectSubredditIterationMethodOptionsEnum.Random
        ) {
            index = Math.floor(Math.random() * sourceSubredditList.length);

            if (
                RandomIterationSelectWeightOptionsEnum.PureRandom ==
                randomIterationSelectWeightOption
            ) {
                index = Math.floor(Math.random() * sourceSubredditList.length);
            } else if (
                RandomIterationSelectWeightOptionsEnum.WeightedBySubCount ==
                randomIterationSelectWeightOption
            ) {
                let totalWeight: number = 0;
                sourceSubredditList.map((sub) => (totalWeight += sub.subscribers));
                const randomWeightedIndex = Math.floor(Math.random() * totalWeight);
                let itemWeightedIndex = 0;
                for (let i = 0; i < sourceSubredditList.length; ++i) {
                    const item = sourceSubredditList[i];
                    itemWeightedIndex += item.subscribers;
                    if (randomWeightedIndex < itemWeightedIndex) {
                        index = i;
                        break;
                    }
                }
            }
        } else if (
            subredditSourceOption ===
            SubredditSourceOptionsEnum.RedditListDotCom24HourGrowth ||
            subredditSourceOption ===
            SubredditSourceOptionsEnum.RedditListDotComRecentActivity ||
            subredditSourceOption ===
            SubredditSourceOptionsEnum.RedditListDotComSubscribers
        ) {
            index =
                nsfwSubredditIndex >= sourceSubredditList.length ? 0 : nsfwSubredditIndex;
            updatedNsfwSubredditIndex = index + 1;
        } else {
            index = getPostsFromSubredditsState.subredditIndex >= sourceSubredditList.length ? 0 : getPostsFromSubredditsState.subredditIndex;
            updatedSubredditIndex = index + 1;
        }

        return {
            subreddits: [sourceSubredditList[index]], //From Method
            mostRecentSubredditGotten: sourceSubredditList[index],//From Method
            subredditIndex: updatedSubredditIndex,//From Method
            nsfwRedditListIndex: updatedNsfwSubredditIndex,//From Method
            subredditsToShowInSideBar: sortedSubreddits,
            fromSubreddits: [sourceSubredditList[index]]//From Method
        }
    }, [getAllSubredditsAtOnce, nsfwSubredditIndex, randomIterationSelectWeightOption, selectSubredditIterationMethodOption, subredditIndex, subredditSourceOption]);

    const getSubredditsToGetPostsForBasedOnRedditSource = useCallback((getPostsFromSubredditsState: GetPostsFromSubredditState): Promise<GetSubredditsAndUpdatedInfo> => {
        return new Promise<GetSubredditsAndUpdatedInfo>((getSourceSubredditsResolve, getSourceSubredditsReject) => {
            if (
                subredditSourceOption ==
                SubredditSourceOptionsEnum.RedditListDotComRecentActivity ||
                subredditSourceOption ==
                SubredditSourceOptionsEnum.RedditListDotComSubscribers ||
                subredditSourceOption ==
                SubredditSourceOptionsEnum.RedditListDotCom24HourGrowth
            ) {
                getSubredditsToGetPostsForFromRedditListDotCom(
                    subredditSourceOption
                ).then(redditDotComSubreddits => {
                    getSourceSubredditsResolve(extractSubredditsToGetFromSourceList(redditDotComSubreddits, getPostsFromSubredditsState));
                }).catch(err => getSourceSubredditsReject(err));
                return;
            } else if (
                subredditSourceOption ===
                SubredditSourceOptionsEnum.SubscribedSubreddits
            ) {
                getSourceSubredditsResolve(extractSubredditsToGetFromSourceList(getPostsFromSubredditsState.masterSubredditList, getPostsFromSubredditsState));
                return;
            } else if (
                subredditSourceOption === SubredditSourceOptionsEnum.RedditUsersOnly
            ) {
                //Sort subscribed reddits by users only. Get random or next in iteration based on iteration method
                getSourceSubredditsResolve(
                    extractSubredditsToGetFromSourceList(
                        filterSubredditsListByUsersOnly(
                            getPostsFromSubredditsState.masterSubredditList,
                            getPostsFromSubredditsState.sortOrderDirection
                        ),
                        getPostsFromSubredditsState
                    )
                );
                return;
            } else if (
                subredditSourceOption ===
                SubredditSourceOptionsEnum.SelectedSubRedditLists
            ) {
                const subreddits = new Array<Subreddit>();
                const selectedLists = subredditLists.filter(
                    (subredditList) => subredditList.selected
                );
                selectedLists.forEach((list) => {
                    list.subreddits.forEach((subreddit) => {
                        const foundSubreddit = subreddits.find(
                            (sub) => sub.displayName === subreddit.displayName
                        );
                        if (foundSubreddit === undefined) {
                            subreddits.push(subreddit);
                        }
                    });
                });
                getSourceSubredditsResolve(extractSubredditsToGetFromSourceList(subreddits, getPostsFromSubredditsState));
                return;
            } else if (
                subredditSourceOption === SubredditSourceOptionsEnum.AllSubRedditLists
            ) {
                const subreddits = new Array<Subreddit>();
                subredditLists.forEach((list) => {
                    list.subreddits.forEach((subreddit) => {
                        const foundSubreddit = subreddits.find(
                            (sub) => sub.displayName === subreddit.displayName
                        );
                        if (foundSubreddit === undefined) {
                            subreddits.push(subreddit);
                        }
                    });
                });
                getSourceSubredditsResolve(extractSubredditsToGetFromSourceList(subreddits, getPostsFromSubredditsState));
                return;
            }
            getSourceSubredditsResolve(extractSubredditsToGetFromSourceList([], getPostsFromSubredditsState));
        });
    }, [extractSubredditsToGetFromSourceList, getSubredditsToGetPostsForFromRedditListDotCom, subredditLists, subredditSourceOption]);

    const getPostsForPostRow = useCallback(async (): Promise<GetPostsForPostRowResponse> => {
        console.log("about to get post row");
        redditServiceDispatch({
            type: RedditServiceActions.SET_CURRENTLY_GETTING_POSTS,
            payload: true
        });
        const getPostsFromSubredditState: GetPostsFromSubredditState = JSON.parse(
            JSON.stringify(currentGetPostsFromSubredditValues.current)
        );
        const getPostsForPostRowResponse: GetPostsForPostRowResponse = {
            getPostsFromSubredditState: getPostsFromSubredditState,
            newValues: {
                posts: undefined,
                fromSubreddits: undefined,
                subredditsToShowInSideBar: undefined,
                nsfwRedditListIndex: undefined,
                subredditIndex: undefined,
                mostRecentSubredditGotten: undefined,
                subredditQueueItemToRemove: undefined,
            },
            encounteredError: false
        };

        let getPostsPromise: Promise<void>;
        if (getPostsFromSubredditState.subredditSourceOption === SubredditSourceOptionsEnum.FrontPage &&
            getPostsFromSubredditState.subredditQueue.length === 0) {
            getPostsPromise = handleGetPostsForUserFrontPage(
                getPostsForPostRowResponse
            );
        } else if (getPostsFromSubredditState.subredditQueue.length > 0) {
            getPostsPromise = new Promise((getPostsResolve, getPostsReject) => {
                const firstQueuedSubreddit = getPostsFromSubredditState.subredditQueue[0];
                getPostsForSubreddit([firstQueuedSubreddit], getPostsForPostRowResponse).then(() => {
                    getPostsResolve();
                }).catch(err => {
                    getPostsReject(err)
                });
            });
        } else {
            getPostsPromise = new Promise((getPostsResolve, getPostsReject) => {
                getSubredditsToGetPostsForBasedOnRedditSource(getPostsFromSubredditState).then(subredditsObj => {
                    getPostsForSubreddit(subredditsObj.subreddits, getPostsForPostRowResponse).then(() => {
                        getPostsResolve();
                    }).catch(err => {
                        getPostsReject(err)
                    }).finally(() => {
                        getPostsForPostRowResponse.newValues.subredditQueueItemToRemove = undefined;
                        getPostsForPostRowResponse.newValues.fromSubreddits = subredditsObj.fromSubreddits;
                        getPostsForPostRowResponse.newValues.mostRecentSubredditGotten = subredditsObj.mostRecentSubredditGotten;
                        getPostsForPostRowResponse.newValues.subredditIndex = subredditsObj.subredditIndex;
                        getPostsForPostRowResponse.newValues.nsfwRedditListIndex = subredditsObj.nsfwRedditListIndex;
                        getPostsForPostRowResponse.newValues.subredditsToShowInSideBar = subredditsObj.subredditsToShowInSideBar;
                    });
                }).catch(err => getPostsReject(err));
            });
        }

        return new Promise<GetPostsForPostRowResponse>((resolve) => {
            getPostsPromise
                .then(() => {
                    if(getPostsForPostRowResponse.newValues.posts === undefined) {
                        return;
                    }

                    let filteredPostsFromSubreddit = filterPostContent(
                        getPostsFromSubredditState.contentFiltering,
                        getPostsForPostRowResponse.newValues.posts
                    );

                    if (filteredPostsFromSubreddit.length > 0) {
                        if (filteredPostsFromSubreddit.length > MAX_POSTS_PER_ROW) {
                            filteredPostsFromSubreddit = filteredPostsFromSubreddit.slice(
                                0,
                                MAX_POSTS_PER_ROW + 1
                            );
                        }
                    }
                }).catch((err: GetPostsForPostRowError) => {
                console.log("Error while getting posts for post row", err);
                if (err.emitNotification) {
                    appNotificationDispatch({
                        type: AppNotificationsActionType.SUBMIT_APP_NOTIFICATION,
                        payload: {
                            message: err.notificationMessage,
                            displayTimeMS: 5000
                        }
                    })
                }
            }).finally(() => {
                redditServiceDispatch({
                    type: RedditServiceActions.SET_CURRENTLY_GETTING_POSTS,
                    payload: false
                });
                resolve(getPostsForPostRowResponse);
            });
        });
    }, [appNotificationDispatch, getPostsForSubreddit, getSubredditsToGetPostsForBasedOnRedditSource, handleGetPostsForUserFrontPage, redditServiceDispatch]);

    return {
        loadSubscribedSubreddits,
        getPostsForPostRow,
        handleGottenPosts,
    };
}