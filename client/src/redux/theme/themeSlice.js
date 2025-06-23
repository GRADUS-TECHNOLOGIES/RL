import { createSlice } from '@reduxjs/toolkit';

//* Estado inicial del tema
const initialState = {
    theme: 'light',
};

const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        toggleTheme: (state) => {
            state.theme = state.theme === 'light' ? 'dark' : 'light';
        },
    }
});

export const { toggleTheme } = themeSlice.actions;

export default themeSlice.reducer;