import Data from "./Data";

export default interface RedditApiResponse<Type> {
  data: Data<Type>;
}
