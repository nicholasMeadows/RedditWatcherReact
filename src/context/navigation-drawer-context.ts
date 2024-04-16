import { createContext } from "react";

type NavigationDrawerContextData = {
  navigationDrawerContextData: {
    pageName: string;
    showBackButton: boolean;
  };
  setNavigationDrawerContextData: React.Dispatch<
    React.SetStateAction<{ pageName: string; showBackButton: boolean }>
  >;
};
export const NavigationDrawerContext =
  createContext<NavigationDrawerContextData>({} as NavigationDrawerContextData);
