import { useNavigate } from "react-router-dom";
import { APP_INITIALIZATION_ROUTE } from "../../RedditWatcherConstants";
import {
  setClientId,
  setClientSecret,
  setPassword,
  setUsername,
} from "../../redux/slice/AppConfigSlice";
import { useAppDispatch, useAppSelector } from "../../redux/store";

const RedditSignin: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const username = useAppSelector(
    (state) => state.appConfig.redditCredentials.username
  );
  const usernameValidationError = useAppSelector(
    (state) => state.appConfig.redditCredentials.usernameValidationError
  );

  const password = useAppSelector(
    (state) => state.appConfig.redditCredentials.password
  );
  const passwordValidationError = useAppSelector(
    (state) => state.appConfig.redditCredentials.passwordValidationError
  );

  const clientId = useAppSelector(
    (state) => state.appConfig.redditCredentials.clientId
  );
  const clientIdValidationError = useAppSelector(
    (state) => state.appConfig.redditCredentials.clientIdValidationError
  );

  const clientSecret = useAppSelector(
    (state) => state.appConfig.redditCredentials.clientSecret
  );
  const clientSecretValidationError = useAppSelector(
    (state) => state.appConfig.redditCredentials.clientSecretValidationError
  );

  return (
    <>
      <div className="signin-box background">
        <div className="signin-input">
          <input
            placeholder="Username"
            value={username}
            onChange={(event) => dispatch(setUsername(event.target.value))}
          ></input>
        </div>

        <div className="signin-input">
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(event) => dispatch(setPassword(event.target.value))}
          ></input>
        </div>
        <div className="signin-input">
          <input
            placeholder="Client ID"
            value={clientId}
            onChange={(event) => dispatch(setClientId(event.target.value))}
          ></input>
        </div>
        <div className="signin-input">
          <input
            placeholder="Client Secret"
            value={clientSecret}
            onChange={(event) => dispatch(setClientSecret(event.target.value))}
          ></input>
        </div>

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
    </>
  );
};

export default RedditSignin;
