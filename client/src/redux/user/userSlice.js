import { createSlice } from '@reduxjs/toolkit'

// Creacion del slice de Redux para el contador (Estado iniicial)
const initialState = {
    currentUser: null,  // Almacena el usuario actual
    error: null,        // Almacena errores
    loading: false,     // Indica si hay una carga en curso
}

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        // Acciones para el slice de usuario
        signinStart: (state) => {
            state.loading = true;  // Inicia la carga
            state.error = null;    // Resetea errores
        },
        signinSuccess: (state, action) => {
            state.currentUser = action.payload;  // Almacena el usuario actual
            state.loading = false;  // Finaliza la carga
            state.error = null;    // Resetea errores
        },
        signinFailure: (state, action) => {
            state.loading = false;  // Finaliza la carga
            state.error = action.payload;  // Almacena el error
        },
        updateStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        updateSuccess: (state, action) => {
            state.currentUser = action.payload;
            state.loading = false;
            state.error = null;
        },
        updateFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        deleteUserStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        deleteUserSuccess: (state) => {
            state.currentUser = null;
            state.loading = false;
            state.error = null;
        },
        deleteUserFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        signoutSuccess: (state) => {
            state.currentUser = null;
            state.error = null;
            state.loading = false;
        },
    },
});

// Exporta las acciones y el reducer
export const { signinStart, signinSuccess, signinFailure, updateStart, updateSuccess, updateFailure, deleteUserStart, deleteUserSuccess, deleteUserFailure, signoutSuccess } = userSlice.actions;

// Exporta el reducer para usarlo en la store de Redux
export default userSlice.reducer;