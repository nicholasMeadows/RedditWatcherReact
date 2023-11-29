import { BrowserRouter } from "react-router-dom";

/* Theme variables */
import "./theme/loading-content.scss";
import "./theme/modify-subreddit-lists.scss";
import "./theme/post-rows.scss";
import "./theme/variables.css";
import "./theme/global.scss";
import "./theme/post-rows.scss";
import "./theme/search-reddit-bar.scss";
import "./theme/context-menu.scss";
import "./theme/app-notification.scss";
import "./theme/single-post-page.scss";
import "./theme/reddit-signin.scss";
import "./theme/navigation-hamburger-menu.scss";
import "./theme/reddit-post-settings.scss";
import "./theme/reddit-watcher-settings.scss";
import "./theme/modify-subreddit-queue.scss";

import { Provider } from "react-redux";
import store from "./redux/store";
import RouterView from "./page/RouterView";

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <RouterView />
      </BrowserRouter>
    </Provider>
  );
};

export default App;
