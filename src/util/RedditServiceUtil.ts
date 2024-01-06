import { Post } from "../model/Post/Post";
import { Subreddit } from "../model/Subreddit/Subreddit";
import { SubredditLists } from "../model/SubredditList/SubredditLists";
import RandomIterationSelectWeightOptionsEnum from "../model/config/enums/RandomIterationSelectWeightOptionsEnum";
import SelectSubredditIterationMethodOptionsEnum from "../model/config/enums/SelectSubredditIterationMethodOptionsEnum";
import SelectedSubredditListSortOptionEnum from "../model/config/enums/SelectedSubredditListSortOptionEnum";
import SortOrderDirectionOptionsEnum from "../model/config/enums/SortOrderDirectionOptionsEnum";
import { GetPostsFromSubredditState } from "../model/converter/GetPostsFromSubredditStateConverter.ts";

export function sortSubredditsBySubscribers(
  subreddits: Array<Subreddit>,
  getPostsFromSubredditStateState: GetPostsFromSubredditState
): Array<Subreddit> {
  const sortDirection = getPostsFromSubredditStateState.sortOrderDirection;
  const sortedSubreddits = [...subreddits];
  if (SortOrderDirectionOptionsEnum.Normal == sortDirection) {
    sortedSubreddits.sort((sub1, sub2) => {
      const sub1Subscribers = sub1.subscribers;
      const sub2Subscribers = sub2.subscribers;
      if (sub1Subscribers < sub2Subscribers) {
        return 1;
      } else if (sub1Subscribers > sub2Subscribers) {
        return -1;
      }
      return 0;
    });
  } else if (SortOrderDirectionOptionsEnum.Reversed == sortDirection) {
    sortedSubreddits.sort((sub1, sub2) => {
      const sub1Subscribers = sub1.subscribers;
      const sub2Subscribers = sub2.subscribers;
      if (sub1Subscribers < sub2Subscribers) {
        return -1;
      } else if (sub1Subscribers > sub2Subscribers) {
        return 1;
      }
      return 0;
    });
  }
  return sortedSubreddits;
}

export function filterSubredditsListByUsersOnly(
  subreddits: Array<Subreddit>,
  getPostsFromSubredditState: GetPostsFromSubredditState
): Array<Subreddit> {
  const userOnlyList = subreddits.filter((sub) =>
    sub.displayName.startsWith("u_")
  );
  return sortSubredditListAlphabetically(
    userOnlyList,
    getPostsFromSubredditState
  );
}

export function sortSubredditListAlphabetically(
  subreddits: Array<Subreddit>,
  getPostsFromSubredditState: GetPostsFromSubredditState
): Array<Subreddit> {
  const sortOrderDirection = getPostsFromSubredditState.sortOrderDirection;
  if (SortOrderDirectionOptionsEnum.Normal == sortOrderDirection) {
    subreddits = subreddits.sort((sub1, sub2) => {
      if (sub1.displayName.toLowerCase() < sub2.displayName.toLowerCase()) {
        return 1;
      } else if (
        sub1.displayName.toLowerCase() > sub2.displayName.toLowerCase()
      ) {
        return -1;
      }
      return 0;
    });
  } else if (SortOrderDirectionOptionsEnum.Reversed == sortOrderDirection) {
    subreddits = subreddits.sort((sub1, sub2) => {
      if (sub1.displayName.toLowerCase() > sub2.displayName.toLowerCase()) {
        return 1;
      } else if (
        sub1.displayName.toLowerCase() < sub2.displayName.toLowerCase()
      ) {
        return -1;
      }
      return 0;
    });
  }
  return subreddits;
}

export function getSubredditFromList(
  currentSubRedditIndex: number,
  subreddits: Array<Subreddit>,
  getPostsFromSubredditState: GetPostsFromSubredditState
): { subreddit: Subreddit | undefined; updatedIndex: number } {
  let subreddit: Subreddit | undefined = undefined;
  let updatedSubredditIndex = currentSubRedditIndex;

  const iterationMethod =
    getPostsFromSubredditState.selectSubredditIterationMethodOption;
  if (SelectSubredditIterationMethodOptionsEnum.Sequential == iterationMethod) {
    if (currentSubRedditIndex >= subreddits.length) {
      currentSubRedditIndex = 0;
    }
    subreddit = subreddits[currentSubRedditIndex];
    updatedSubredditIndex = currentSubRedditIndex + 1;
  } else if (
    SelectSubredditIterationMethodOptionsEnum.Random == iterationMethod
  ) {
    const randomWeightOption =
      getPostsFromSubredditState.randomIterationSelectWeightOption;
    if (
      RandomIterationSelectWeightOptionsEnum.PureRandom == randomWeightOption
    ) {
      const randomIndex = Math.floor(Math.random() * subreddits.length);
      subreddit = subreddits[randomIndex];
    } else if (
      RandomIterationSelectWeightOptionsEnum.WeightedBySubCount ==
      randomWeightOption
    ) {
      let totalWeight: number = 0;

      subreddits.map((sub) => (totalWeight += sub.subscribers));

      const randomWeightedIndex = Math.floor(Math.random() * totalWeight);
      let itemWeightedIndex = 0;

      for (const item of subreddits) {
        itemWeightedIndex += item.subscribers;
        if (randomWeightedIndex < itemWeightedIndex) {
          subreddit = item;
          break;
        }
      }
    }
  }

  return { subreddit: subreddit, updatedIndex: updatedSubredditIndex };
}

export function concatSelectedSubredditLists(
  subredditLists: Array<SubredditLists>
): Array<Subreddit> {
  const selectedSubReddits = new Array<Subreddit>();
  for (const subredditList of subredditLists.filter((list) => list.selected)) {
    selectedSubReddits.push(...subredditList.subreddits);
  }
  return selectedSubReddits;
}

export function sortSelectedSubreddits(
  getPostsFromSubredditState: GetPostsFromSubredditState
): Array<Subreddit> {
  const selectedSubredditListSortOption =
    getPostsFromSubredditState.selectedSubredditListSortOption;
  const sortOrderDirection = getPostsFromSubredditState.sortOrderDirection;
  const subredditLists = getPostsFromSubredditState.subredditLists;

  let selectedSubReddits: Array<Subreddit> =
    concatSelectedSubredditLists(subredditLists);

  if (
    SelectedSubredditListSortOptionEnum.Random ==
    selectedSubredditListSortOption
  ) {
    selectedSubReddits = sortSubredditsRandomly(selectedSubReddits);
  } else if (
    SelectedSubredditListSortOptionEnum.Alphabetically ==
    selectedSubredditListSortOption
  ) {
    selectedSubReddits = sortByDisplayName(
      selectedSubReddits,
      sortOrderDirection
    );
  } else if (
    SelectedSubredditListSortOptionEnum.SubCount ==
    selectedSubredditListSortOption
  ) {
    selectedSubReddits = sortBySubscribers(
      selectedSubReddits,
      sortOrderDirection
    );
  } else if (
    SelectedSubredditListSortOptionEnum.SubCountAndListName ==
    selectedSubredditListSortOption
  ) {
    selectedSubReddits = sortByFromListThenSubscribers(
      selectedSubReddits,
      sortOrderDirection
    );
  }

  return selectedSubReddits;
}

function sortByDisplayName(
  selectedSubReddits: Array<Subreddit>,
  sortOrderDirection: SortOrderDirectionOptionsEnum
): Array<Subreddit> {
  if (SortOrderDirectionOptionsEnum.Normal == sortOrderDirection) {
    return selectedSubReddits.sort((sub1, sub2) => {
      if (sub1.displayName.toLowerCase() > sub2.displayName.toLowerCase()) {
        return 1;
      } else if (
        sub1.displayName.toLowerCase() < sub2.displayName.toLowerCase()
      ) {
        return -1;
      }
      return 0;
    });
  } else if (SortOrderDirectionOptionsEnum.Reversed == sortOrderDirection) {
    return selectedSubReddits.sort((sub1, sub2) => {
      if (sub1.displayName < sub2.displayName) {
        return 1;
      } else if (sub1.displayName > sub2.displayName) {
        return -1;
      }
      return 0;
    });
  }
  return [];
}

function sortBySubscribers(
  selectedSubReddits: Array<Subreddit>,
  sortOrderDirection: SortOrderDirectionOptionsEnum
): Array<Subreddit> {
  if (SortOrderDirectionOptionsEnum.Normal == sortOrderDirection) {
    return selectedSubReddits.sort((sub1, sub2) => {
      if (sub1.subscribers > sub2.subscribers) {
        return 1;
      } else if (sub1.subscribers < sub2.subscribers) {
        return -1;
      }
      return 0;
    });
  } else if (SortOrderDirectionOptionsEnum.Reversed == sortOrderDirection) {
    return selectedSubReddits.sort((sub1, sub2) => {
      if (sub1.subscribers < sub2.subscribers) {
        return 1;
      } else if (sub1.subscribers > sub2.subscribers) {
        return -1;
      }
      return 0;
    });
  }
  return [];
}

function sortByFromListThenSubscribers(
  selectedSubReddits: Array<Subreddit>,
  sortOrderDirection: SortOrderDirectionOptionsEnum
): Array<Subreddit> {
  if (SortOrderDirectionOptionsEnum.Normal == sortOrderDirection) {
    return selectedSubReddits.sort((sub1, sub2) => {
      if (sub1.fromList > sub2.fromList) {
        return 1;
      } else if (sub1.fromList < sub2.fromList) {
        return -1;
      } else {
        if (sub1.subscribers > sub2.subscribers) {
          return 1;
        } else if (sub1.subscribers < sub2.subscribers) {
          return -1;
        }
        return 0;
      }
    });
  } else if (SortOrderDirectionOptionsEnum.Reversed == sortOrderDirection) {
    return selectedSubReddits.sort((sub1, sub2) => {
      if (sub1.fromList < sub2.fromList) {
        return 1;
      } else if (sub1.fromList > sub2.fromList) {
        return -1;
      } else {
        if (sub1.subscribers < sub2.subscribers) {
          return 1;
        } else if (sub1.subscribers > sub2.subscribers) {
          return -1;
        }
        return 0;
      }
    });
  }
  return [];
}

export function sortPostsByCreate(posts: Array<Post>) {
  return posts.sort((p1, p2) => {
    const p1Create = p1.created;
    const p2Created = p2.created;

    if (p1Create < p2Created) {
      return 1;
    } else if (p1Create > p2Created) {
      return -1;
    }
    return 0;
  });
}

export function sortSubredditsRandomly(
  subreddits: Array<Subreddit>
): Array<Subreddit> {
  // declare the function

  for (let i = subreddits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [subreddits[i], subreddits[j]] = [subreddits[j], subreddits[i]];
  }
  return subreddits;
}
