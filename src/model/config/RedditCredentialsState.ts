import { RedditCredentials } from "./RedditCredentials"

export interface RedditCredentialsState extends RedditCredentials {
    usernameValidationError: string | undefined,
    passwordValidationError: string | undefined,
    clientIdValidationError: string | undefined,
    clientSecretValidationError: string | undefined
}