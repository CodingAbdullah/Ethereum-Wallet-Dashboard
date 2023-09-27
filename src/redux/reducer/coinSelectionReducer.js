import { createSlice } from '@reduxjs/toolkit';

// Set initial coin state to empty and use localStorage for persistence
let coinState = localStorage.getItem('coin') === null ? { coin: 'bitcoin' } : { coin: localStorage.getItem('coin') };

// Reducer for handling coin selection state
const coinSelectionReducer = createSlice({
    name: 'coinSelection',
    initialState: coinState,
    reducers: {
        selectCoin: (state, action) => {
            // Set localStorage for persistence and global state to contain payload string value
            localStorage.setItem('coin', action.payload);
            state.coin = action.payload;
        }
    }
});

// Action functions to be dispatched to allow state change
export const { selectCoin } = coinSelectionReducer.actions;

// Reducer for handling state change
export default coinSelectionReducer.reducer;