import { configureStore } from "@reduxjs/toolkit";
import coinSelectionReducer from "../reducer/coinSelectionReducer";
import walletAddressReducer from "../reducer/walletAddressReducer";

// Create global store containing the global coin selection state
const store = configureStore({
    reducer : {
        coinSelection: coinSelectionReducer,
        walletAddress: walletAddressReducer
    }
});

export default store;