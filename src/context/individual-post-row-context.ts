import { createContext } from "react";
import { IndividualPostRowState } from "../model/state/IndividualPostRowState.ts";

const IndividualPostRowContext = createContext({} as IndividualPostRowState);
export default IndividualPostRowContext;
