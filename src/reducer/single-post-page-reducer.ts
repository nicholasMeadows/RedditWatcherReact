import { SinglePostPageState } from "../model/state/SinglePostPageState.ts";

export enum SinglePostPageActionType {
  SET_SINGLE_POST_PAGE_UUIDS = "SET_SINGLE_POST_PAGE_UUIDS",
}

export type SetSinglePostPageUuidsAction = {
  type: SinglePostPageActionType;
  payload: {
    postRowUuid: string;
    postUuid: string;
  };
};
export default function SinglePostPageReducer(
  state: SinglePostPageState,
  action: SetSinglePostPageUuidsAction
) {
  switch (action.type) {
    case SinglePostPageActionType.SET_SINGLE_POST_PAGE_UUIDS:
      return setSinglePostPageUuids(action);
    default:
      return state;
  }
}

const setSinglePostPageUuids = (action: {
  type: string;
  payload: { postRowUuid: string; postUuid: string };
}): SinglePostPageState => {
  return {
    postRowUuid: action.payload.postRowUuid,
    postUuid: action.payload.postUuid,
  };
};
