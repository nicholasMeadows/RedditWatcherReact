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
import {MAX_POSTS_PER_ROW} from "../RedditWatcherConstants.ts";
import PostSortOrderOptionsEnum from "../model/config/enums/PostSortOrderOptionsEnum.ts";
import SelectSubredditIterationMethodOptionsEnum
    from "../model/config/enums/SelectSubredditIterationMethodOptionsEnum.ts";
import RandomIterationSelectWeightOptionsEnum from "../model/config/enums/RandomIterationSelectWeightOptionsEnum.ts";
import SortOrderDirectionOptionsEnum from "../model/config/enums/SortOrderDirectionOptionsEnum.ts";
import {SubredditLists} from "../model/SubredditList/SubredditLists.ts";
import SubredditSortOrderOptionsEnum from "../model/config/enums/SubredditSortOrderOptionsEnum.ts";
import TopTimeFrameOptionsEnum from "../model/config/enums/TopTimeFrameOptionsEnum.ts";
import {PostConverterFilteringOptions} from "../model/config/PostConverterFilteringOptions.ts";
import {Post} from "../model/Post/Post.ts";
import {
    filterPostContent,
    filterSubredditsListByUsersOnly, getBase64ForImages,
    sortByDisplayName, sortByFromListThenSubscribers, sortSourceSubreddits,
    sortSubredditsBySubscribers
} from "../util/RedditServiceUtil.ts";
import {RedditListDotComConverter} from "../model/converter/RedditListDotComConverter.ts";
import {getSubredditsFromRedditListDotCom} from "../service/RedditListDotComClient.ts";
import {GetPostsForSubredditUrlConverter} from "../model/converter/GetPostsForSubredditUrlConverter.ts";
import {SideBarActionType} from "../reducer/side-bar-reducer.ts";
import {PostRowPageActionType} from "../reducer/post-row-page-reducer.ts";

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
        (
            getPostsFromSubredditState: GetPostsFromSubredditState,
            getPostsResponse: GetPostsFromSubredditResponse
        ) => {
            if (getPostsResponse.subredditQueueItemToRemove != undefined) {
                redditServiceDispatch({
                    type: RedditServiceActions.REMOVE_SUBREDDIT_QUEUE_ITEM,
                    payload: getPostsResponse.subredditQueueItemToRemove,
                });
            }
            if (getPostsResponse.mostRecentSubredditGotten != undefined) {
                sideBarDispatch({
                    type: SideBarActionType.SET_MOST_RECENT_SUBREDDIT_GOTTEN,
                    payload: getPostsResponse.mostRecentSubredditGotten,
                });
            }
            if (getPostsResponse.subredditsToShowInSideBar != undefined) {
                sideBarDispatch({
                    type: SideBarActionType.SET_SUBREDDITS_TO_SHOW_IN_SIDEBAR,
                    payload: {
                        subreddits: getPostsResponse.subredditsToShowInSideBar,
                    },
                });
            }
            if (getPostsResponse.subredditIndex != undefined) {
                redditServiceDispatch({
                    type: RedditServiceActions.SET_SUBREDDIT_INDEX,
                    payload: getPostsResponse.subredditIndex,
                });
            }
            if (getPostsResponse.nsfwRedditListIndex != undefined) {
                redditServiceDispatch({
                    type: RedditServiceActions.SET_NSFW_SUBREDDIT_INDEX,
                    payload: getPostsResponse.nsfwRedditListIndex,
                });
            }
            if (getPostsResponse.posts.length > 0) {
                postRowPageDispatch({
                    type: PostRowPageActionType.ADD_POST_ROW,
                    payload: {
                        posts: getPostsResponse.posts,
                        gottenWithPostSortOrderOption:
                        getPostsFromSubredditState.postSortOrder,
                        gottenWithSubredditSourceOption:
                        getPostsFromSubredditState.subredditSourceOption,
                    },
                });
            }
        },
        [postRowPageDispatch, redditServiceDispatch, sideBarDispatch]
    );

    const handleGottenPosts = useCallback(
        (
            getPostsFromSubredditState: GetPostsFromSubredditState,
            getPostsResponse: GetPostsFromSubredditResponse
        ) => {
            const posts = getPostsResponse.posts;
            const fromSubreddits = getPostsResponse.fromSubreddits;
            if (posts.length === 0) {
                let msg = `Got 0 posts. Trying again in a little bit.`;
                if (fromSubreddits.length == 1) {
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
            applyUpdatedStateValues(getPostsFromSubredditState, getPostsResponse);
        },
        [appNotificationDispatch, applyUpdatedStateValues]
    );

    const getPostsForSubreddit = useCallback((
        subreddits: Array<Subreddit>,
        concatRedditUrlMaxLength: number,
        postSortOrder: PostSortOrderOptionsEnum,
        topTimeFrame: TopTimeFrameOptionsEnum,
        redditApiItemLimit: number,
        masterSubredditList: Subreddit[],
        subredditLists: SubredditLists[],
        useInMemoryImagesAndGifs: boolean,
        postConverterFilteringOptions: PostConverterFilteringOptions
    ) => {
        const redditClient = new RedditClient(redditCredentials);
        return new Promise<Array<Post>>((resolve, reject) => {
            const urlConverter = new GetPostsForSubredditUrlConverter();
            const [url, randomSourceString] = urlConverter.convert(
                subreddits,
                concatRedditUrlMaxLength,
                postSortOrder,
                topTimeFrame,
                redditApiItemLimit
            );
            redditClient
                .getPostsForSubredditUri(
                    url,
                    masterSubredditList,
                    subredditLists,
                    postConverterFilteringOptions
                )
                .then((posts) => {
                    const mappedPosts = posts.map<Post>((value) => {
                        value.randomSourceString = randomSourceString;
                        return value;
                    });
                    if (useInMemoryImagesAndGifs) {
                        getBase64ForImages(mappedPosts).then(() => {
                            resolve(mappedPosts);
                        });
                    } else {
                        resolve(posts);
                    }
                })
                .catch((error) => reject(error));
        });
    }, [redditCredentials]);

    const getSubredditsToGetPostsForFromRedditListDotCom = useCallback((
        subredditSourceOption: SubredditSourceOptionsEnum
    ): Promise<Subreddit[]> => {
        return new Promise<Array<Subreddit>>((resolve, reject) => {
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
                .catch((err) => reject(err));
        });
    }, []);

    const getSourceSubreddits = useCallback((
        subredditSourceOption: SubredditSourceOptionsEnum,
        masterSubredditList: Subreddit[],
        sortOrderDirection: SortOrderDirectionOptionsEnum,
        subredditLists: SubredditLists[]
    ): Promise<Subreddit[]> => {
        return new Promise<Subreddit[]>((resolve) => {
            if (
                subredditSourceOption ==
                SubredditSourceOptionsEnum.RedditListDotComRecentActivity ||
                subredditSourceOption ==
                SubredditSourceOptionsEnum.RedditListDotComSubscribers ||
                subredditSourceOption ==
                SubredditSourceOptionsEnum.RedditListDotCom24HourGrowth
            ) {
                resolve(
                    getSubredditsToGetPostsForFromRedditListDotCom(
                        subredditSourceOption
                    )
                );
                return;
            } else if (
                subredditSourceOption ===
                SubredditSourceOptionsEnum.SubscribedSubreddits
            ) {
                resolve(masterSubredditList);
                return;
            } else if (
                subredditSourceOption === SubredditSourceOptionsEnum.RedditUsersOnly
            ) {
                //Sort subscribed reddits by users only. Get random or next in iteration based on iteration method
                resolve(
                    filterSubredditsListByUsersOnly(
                        masterSubredditList,
                        sortOrderDirection
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
                if (selectedLists !== undefined) {
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
                }
                resolve(subreddits);
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
                resolve(subreddits);
                return;
            }
            resolve([]);
        });
    }, [getSubredditsToGetPostsForFromRedditListDotCom]);

    const getSubredditsToGetPostsFor = useCallback((
        sourceSubreddits: Subreddit[],
        subredditSourceOption: SubredditSourceOptionsEnum,
        getAllSubredditsAtOnce: boolean,
        selectSubredditIterationMethodOption: SelectSubredditIterationMethodOptionsEnum,
        randomIterationSelectWeightOption: RandomIterationSelectWeightOptionsEnum,
        nsfwSubredditIndex: number,
        subredditIndex: number
    ): {
        subredditsToGet: Subreddit[];
        updatedSubredditIndex: number;
        updatedNsfwSubredditIndex: number;
        mostRecentSubredditGotten: Subreddit | undefined;
    } => {
        let subredditsToGet = [];
        if (getAllSubredditsAtOnce) {
            return {
                subredditsToGet: sourceSubreddits,
                updatedNsfwSubredditIndex: nsfwSubredditIndex,
                updatedSubredditIndex: subredditIndex,
                mostRecentSubredditGotten: undefined,
            };
        }

        let index: number;
        let updatedNsfwSubredditIndex = nsfwSubredditIndex;
        let updatedSubredditIndex = subredditIndex;
        if (
            selectSubredditIterationMethodOption ===
            SelectSubredditIterationMethodOptionsEnum.Random
        ) {
            index = Math.floor(Math.random() * sourceSubreddits.length);

            if (
                RandomIterationSelectWeightOptionsEnum.PureRandom ==
                randomIterationSelectWeightOption
            ) {
                index = Math.floor(Math.random() * sourceSubreddits.length);
            } else if (
                RandomIterationSelectWeightOptionsEnum.WeightedBySubCount ==
                randomIterationSelectWeightOption
            ) {
                let totalWeight: number = 0;
                sourceSubreddits.map((sub) => (totalWeight += sub.subscribers));
                const randomWeightedIndex = Math.floor(Math.random() * totalWeight);
                let itemWeightedIndex = 0;
                for (let i = 0; i < sourceSubreddits.length; ++i) {
                    const item = sourceSubreddits[i];
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
                nsfwSubredditIndex >= sourceSubreddits.length ? 0 : nsfwSubredditIndex;
            updatedNsfwSubredditIndex = index + 1;
        } else {
            index = subredditIndex >= sourceSubreddits.length ? 0 : subredditIndex;
            updatedSubredditIndex = index + 1;
        }

        const singleSubredditToGet = sourceSubreddits[index];
        subredditsToGet = [singleSubredditToGet];
        return {
            subredditsToGet: subredditsToGet,
            updatedSubredditIndex: updatedSubredditIndex,
            updatedNsfwSubredditIndex: updatedNsfwSubredditIndex,
            mostRecentSubredditGotten: singleSubredditToGet,
        };
    }, []);

    const handleGetPosts = useCallback((getPostsFromSubredditsState: GetPostsFromSubredditState) => {
        return new Promise<GetPostsFromSubredditResponse>((resolve, reject) => {
            getSourceSubreddits(getPostsFromSubredditsState.subredditSourceOption, getPostsFromSubredditsState.masterSubredditList, getPostsFromSubredditsState.sortOrderDirection, getPostsFromSubredditsState.subredditLists).then((sourceSubreddits) => {
                const sortedSubreddits = sortSourceSubreddits(
                    sourceSubreddits,
                    getPostsFromSubredditsState.subredditSourceOption,
                    getPostsFromSubredditsState.subredditSortOrderOption,
                    getPostsFromSubredditsState.sortOrderDirection
                );

                const {
                    subredditsToGet,
                    updatedSubredditIndex,
                    updatedNsfwSubredditIndex,
                    mostRecentSubredditGotten,
                } = getSubredditsToGetPostsFor(
                    sourceSubreddits,
                    getPostsFromSubredditsState.subredditSourceOption,
                    getPostsFromSubredditsState.getAllSubredditsAtOnce,
                    getPostsFromSubredditsState.selectSubredditIterationMethodOption,
                    getPostsFromSubredditsState.randomIterationSelectWeightOption,
                    getPostsFromSubredditsState.nsfwSubredditIndex,
                    getPostsFromSubredditsState.subredditIndex
                );
                getPostsForSubreddit(subredditsToGet, getPostsFromSubredditsState.concatRedditUrlMaxLength, getPostsFromSubredditsState.postSortOrder, getPostsFromSubredditsState.topTimeFrame, getPostsFromSubredditsState.redditApiItemLimit, getPostsFromSubredditsState.masterSubredditList,
                    getPostsFromSubredditsState.subredditLists, getPostsFromSubredditsState.useInMemoryImagesAndGifs, getPostsFromSubredditsState.postConverterFilteringOptions).then((posts) => {
                    resolve({
                        posts: posts,
                        subredditQueueItemToRemove: undefined,
                        masterSubscribedSubredditList: undefined,
                        mostRecentSubredditGotten: mostRecentSubredditGotten,
                        subredditIndex: updatedSubredditIndex,
                        nsfwRedditListIndex: updatedNsfwSubredditIndex,
                        subredditsToShowInSideBar: sortedSubreddits,
                        fromSubreddits: subredditsToGet,
                    });
                }).catch((err) => reject(err));
            }).catch((err) => reject(err));
        });
    }, [getPostsForSubreddit, getSourceSubreddits, getSubredditsToGetPostsFor, sortSourceSubreddits]);

    const handleGetPostsForSubredditQueue = useCallback((
        getPostsFromSubredditsState: GetPostsFromSubredditState
    ) => {
        return new Promise<GetPostsFromSubredditResponse>((resolve, reject) => {
            const firstQueuedSubreddit =
                getPostsFromSubredditsState.subredditQueue[0];
            getPostsForSubreddit(
                [firstQueuedSubreddit],
                getPostsFromSubredditsState.concatRedditUrlMaxLength,
                getPostsFromSubredditsState.postSortOrder,
                getPostsFromSubredditsState.topTimeFrame,
                getPostsFromSubredditsState.redditApiItemLimit,
                getPostsFromSubredditsState.masterSubredditList,
                getPostsFromSubredditsState.subredditLists,
                getPostsFromSubredditsState.useInMemoryImagesAndGifs,
                getPostsFromSubredditsState.postConverterFilteringOptions
            )
                .then((posts) => {
                    resolve({
                        subredditQueueItemToRemove: firstQueuedSubreddit,
                        fromSubreddits: [firstQueuedSubreddit],
                        posts: posts,
                        masterSubscribedSubredditList: undefined,
                        mostRecentSubredditGotten: firstQueuedSubreddit,
                        subredditIndex: undefined,
                        nsfwRedditListIndex: undefined,
                        subredditsToShowInSideBar: undefined,
                    });
                })
                .catch((err) => reject(err));
        });
    }, [getPostsForSubreddit]);

    const handleGetPostsForUserFrontPage = useCallback((
        getPostsFromSubredditsState: GetPostsFromSubredditState
    ) => {
        return new Promise<GetPostsFromSubredditResponse>((resolve, reject) => {
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
                    resolve({
                        posts: postsFromSubreddit,
                        fromSubreddits: [],
                        subredditsToShowInSideBar:
                        getPostsFromSubredditsState.masterSubredditList,
                        nsfwRedditListIndex: undefined,
                        subredditIndex: undefined,
                        mostRecentSubredditGotten: undefined,
                        masterSubscribedSubredditList: undefined,
                        subredditQueueItemToRemove: undefined,
                    });
                })
                .catch((err) => reject(err));
        });
    }, [redditCredentials]);

    const getPostsForPostRow = useCallback(async (): Promise<{
        getPostsFromSubredditResponse: GetPostsFromSubredditResponse;
        getPostsFromSubredditState: GetPostsFromSubredditState;
    }> => {
        redditServiceDispatch({
            type: RedditServiceActions.SET_CURRENTLY_GETTING_POSTS,
            payload: true
        });
        const getPostsFromSubredditState: GetPostsFromSubredditState = JSON.parse(
            JSON.stringify(currentGetPostsFromSubredditValues.current)
        );

        let getPostsPromise: Promise<GetPostsFromSubredditResponse>;
        console.log("about to get post row");
        if (getPostsFromSubredditState.subredditQueue.length != 0) {
            getPostsPromise = handleGetPostsForSubredditQueue(
                getPostsFromSubredditState
            );
        } else if (
            getPostsFromSubredditState.subredditSourceOption ===
            SubredditSourceOptionsEnum.FrontPage
        ) {
            getPostsPromise = handleGetPostsForUserFrontPage(
                getPostsFromSubredditState
            );
        } else {
            getPostsPromise = handleGetPosts(getPostsFromSubredditState);
        }

        return new Promise<{
            getPostsFromSubredditResponse: GetPostsFromSubredditResponse;
            getPostsFromSubredditState: GetPostsFromSubredditState;
        }>((resolve, reject) => {

            getPostsPromise
                .then((res) => {
                    let filteredPostsFromSubreddit = filterPostContent(
                        getPostsFromSubredditState.contentFiltering,
                        res.posts
                    );
                    if (filteredPostsFromSubreddit.length > 0) {
                        if (filteredPostsFromSubreddit.length > MAX_POSTS_PER_ROW) {
                            filteredPostsFromSubreddit = filteredPostsFromSubreddit.slice(
                                0,
                                MAX_POSTS_PER_ROW + 1
                            );
                        }
                    }

                    resolve({
                        getPostsFromSubredditResponse: {
                            posts: filteredPostsFromSubreddit,
                            fromSubreddits: res.fromSubreddits,
                            subredditsToShowInSideBar: res.subredditsToShowInSideBar,
                            nsfwRedditListIndex: res.nsfwRedditListIndex,
                            subredditIndex: res.subredditIndex,
                            mostRecentSubredditGotten: res.mostRecentSubredditGotten,
                            masterSubscribedSubredditList: res.masterSubscribedSubredditList,
                            subredditQueueItemToRemove: res.subredditQueueItemToRemove,
                        },
                        getPostsFromSubredditState: getPostsFromSubredditState,
                    });
                }).catch((err) => reject(err)).finally(() => {
                redditServiceDispatch({
                    type: RedditServiceActions.SET_CURRENTLY_GETTING_POSTS,
                    payload: false
                });
            });
        });
    }, [handleGetPosts, handleGetPostsForSubredditQueue, handleGetPostsForUserFrontPage, redditServiceDispatch]);

    return {
        loadSubscribedSubreddits,
        getPostsForPostRow,
        handleGottenPosts,
    };
}
