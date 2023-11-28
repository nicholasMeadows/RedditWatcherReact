import { createSlice } from "@reduxjs/toolkit";

export const loadingPageSlice = createSlice({
    name: 'loadingslice',
    initialState: {
        loadingText: 'Loading...'
    }, reducers: {
        setLoadingText: (state, action) => {
            state.loadingText = action.payload;
        }        
    }
});

export const { setLoadingText } = loadingPageSlice.actions;
export default loadingPageSlice.reducer;