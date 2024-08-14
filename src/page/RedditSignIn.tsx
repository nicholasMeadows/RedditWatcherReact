import { useNavigate } from "react-router-dom";
import { APP_INITIALIZATION_ROUTE } from "./../RedditWatcherConstants";
import { useContext } from "react";
import {
  AppConfigDispatchContext,
  AppConfigStateContext,
} from "../context/app-config-context.ts";
import { AppConfigActionType } from "../reducer/app-config-reducer.ts";

const RedditSignIn: React.FC = () => {
  const appConfigDispatch = useContext(AppConfigDispatchContext);
  const navigate = useNavigate();

  const { redditCredentials } = useContext(AppConfigStateContext);
  const {
    username,
    password,
    clientId,
    clientSecret,
    clientSecretValidationError,
    usernameValidationError,
    passwordValidationError,
    clientIdValidationError,
  } = redditCredentials;

  return (
    <div className="sign-in-page">
      <div className="sign-in-box">
        <input
          className="sign-in-input"
          placeholder="Username"
          value={username}
          onChange={(event) =>
            appConfigDispatch({
              type: AppConfigActionType.SET_USERNAME,
              payload: event.target.value,
            })
          }
        ></input>
        <input
          className="sign-in-input"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(event) =>
            appConfigDispatch({
              type: AppConfigActionType.SET_PASSWORD,
              payload: event.target.value,
            })
          }
        ></input>
        <input
          className="sign-in-input"
          placeholder="Client ID"
          value={clientId}
          onChange={(event) =>
            appConfigDispatch({
              type: AppConfigActionType.SET_CLIENT_ID,
              payload: event.target.value,
            })
          }
        ></input>
        <input
          className="sign-in-input"
          placeholder="Client Secret"
          value={clientSecret}
          onChange={(event) =>
            appConfigDispatch({
              type: AppConfigActionType.SET_CLIENT_SECRET,
              payload: event.target.value,
            })
          }
        ></input>
        <button
          disabled={
            usernameValidationError != undefined ||
            passwordValidationError != undefined ||
            clientIdValidationError != undefined ||
            clientSecretValidationError != undefined
          }
          onClick={() => navigate(APP_INITIALIZATION_ROUTE)}
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default RedditSignIn;
