import { createContext } from "react";
import RootFontSizeContextObj from "../model/state/RootFontSizeState.ts";

export const RootFontSizeContext = createContext<RootFontSizeContextObj>(
  {} as RootFontSizeContextObj
);
