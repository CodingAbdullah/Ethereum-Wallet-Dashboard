import { configureStore } from "@reduxjs/toolkit";
import coinSelectionReducer from "../reducer/coinSelectionReducer";

// Create global store containing the global coin selection state
const store = configureStore({
    reducer : {
        coinSelection: coinSelectionReducer
    }
});

export default store;