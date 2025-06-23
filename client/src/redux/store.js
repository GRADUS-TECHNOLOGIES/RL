import { configureStore, combineReducers } from '@reduxjs/toolkit'; // Importa las funciones de configuración de storage y combinación de reducers
import userReducer from './user/userSlice'; // Importa el slice de usuario
import themeReducer from './theme/themeSlice'; // Importa el slice del tema
import { persistReducer, persistStore } from 'redux-persist'; // Importa la función persistReducer
import storage from 'redux-persist/lib/storage'; // Importa el almacenamiento

const rootReducer = combineReducers({
    user: userReducer,  // Reducer para el slice de usuario
    theme: themeReducer, // Reducer para el slice del tema

});

const persistConfig = {
    key: 'root',
    storage,
    version: 1, // Versión del estado persistido
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer, // Reducer persistido
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }), // Middleware para manejar la serialización
});

export const persistor = persistStore(store) // Crea el persistor para el almacenamiento persistente