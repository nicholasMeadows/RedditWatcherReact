import { createContext } from "react";

type RootFontSizeContextObj = {
  fontSize: number;
  setRootFontSize: React.Dispatch<React.SetStateAction<number>>;
};
export const RootFontSizeContext = createContext<RootFontSizeContextObj>(
  {} as RootFontSizeContextObj
);
