type typeWindow = typeof Window;

export interface WindowElectronAPI extends typeWindow {
  electronAPI: ElectronAPI;
}

interface ElectronAPI {
  checkForOrCreateConfigFolder(): Promise<void>;

  checkForOrCreateConfigFile(defaultFileValue: string): Promise<void>;

  checkForOrCreateSubredditListsFile(defaultFileValue: string): Promise<void>;

  readConfigFromFile(): Promise<string>;

  readSubredditListsFromFile(): Promise<string>;

  saveConfig(encodedFileContent: string): Promise<void>;

  saveSubredditLists(encodedFileContent: string): Promise<void>;
}
