import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import getTheme from './theme/theme';
import ColorModeContext from './utils/ColorModeContext';
import Layout from './layout/Layout';
import Home from './pages/Home';
import RentalDetail from './pages/RentalDetail';
import Login from './pages/Login';
import AuthRoute from './components/AuthRoute';
import AuthProvider from './hooks/AuthProvider';
import NotFoundPage from './pages/NotFoundPage';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Provider as ReduxProvider } from 'react-redux';
import store from './store';
import { StoreInitializer } from './store/initializer';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const defaultTheme = 'light';

const App = (): JSX.Element => {
  const [mode, setMode] = useState('dark');
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        window.localStorage.setItem(
          'themeMode',
          mode === 'dark' ? 'light' : 'dark',
        );
        setMode((prevMode) => (prevMode === 'dark' ? 'light' : 'dark'));
      },
    }),
    [mode],
  );

  useEffect(() => {
    try {
      const localTheme = window.localStorage.getItem('themeMode');
      localTheme ? setMode(localTheme) : setMode(defaultTheme);
    } catch {
      setMode(defaultTheme);
    }
  }, []);

  return (
    <HelmetProvider>
      <Helmet
        titleTemplate="%s | Opérateur Location Forestar"
        defaultTitle="Opérateur Location Forestar"
      />
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={getTheme(mode)}>
          <CssBaseline />
          <BrowserRouter>
            <AuthProvider>
              <ReduxProvider store={store}>
                <StoreInitializer />
                <LocalizationProvider
                  dateAdapter={AdapterDayjs}
                  adapterLocale={'fr'}
                >
                  <Layout>
                    <ToastContainer />
                    <Routes>
                      <Route path="/login" element={<Login />} />
                      <Route element={<AuthRoute />}>
                        <Route path="/" element={<Home />} />
                        <Route path="/rental/:id" element={<RentalDetail />} />
                      </Route>
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </Layout>
                </LocalizationProvider>
              </ReduxProvider>
            </AuthProvider>
          </BrowserRouter>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </HelmetProvider>
  );
};

export default App;
