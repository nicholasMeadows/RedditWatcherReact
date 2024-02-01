import { createContext } from "react";

type RootFontSizeContextObj = {
  fontSize: number;
};
export const RootFontSizeContext = createContext<RootFontSizeContextObj>(
  {} as RootFontSizeContextObj
);
