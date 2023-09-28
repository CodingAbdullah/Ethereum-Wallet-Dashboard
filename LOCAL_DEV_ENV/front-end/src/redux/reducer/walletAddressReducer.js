import { createSlice } from '@reduxjs/toolkit';

// Persist storage or set to a default value
let walletAddressState = localStorage.getItem('walletAddress') === null ? 
                            { walletAddress: '' } : 
                            localStorage.getItem('walletAddress');


// Create slice of global data to represent wallet address
const walletAddressReducer = createSlice({
    name: 'wallet',
    initialState: walletAddressState,
    reducers: {
        updateAddress: (state, action) => {
            localStorage.setItem('walletAddress', action.payload);
            state.walletAddress = action.payload;
        },
        resetAddress: (state) => {
            localStorage.setItem('walletAddress', '');
            state.walletAddress = ''
        }
    }
});

// Export update and reset address functions as actions
// Export the reducer function

export const { updateAddress, resetAddress } = walletAddressReducer.actions;
export default walletAddressReducer.reducer;