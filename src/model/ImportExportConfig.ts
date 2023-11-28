import { SubredditLists } from "./SubredditList/SubredditLists";
import { AppConfig } from "./config/AppConfig";

export default interface ImportExportConfig {
    appConfig: AppConfig,
    subredditLists: Array<SubredditLists>
}