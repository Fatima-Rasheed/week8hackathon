'use client';
import { createContext, useContext, useState, useMemo } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

export const ColorModeContext = createContext({ toggleColorMode: () => {} });

export function useColorMode() {
  return useContext(ColorModeContext);
}

function buildTheme(mode: 'light' | 'dark') {
  return createTheme({
    palette: {
      mode,
      primary: { main: '#6366f1' },
      secondary: { main: '#22d3ee' },
      background: {
        default: mode === 'dark' ? '#0f0f1a' : '#f5f5f5',
        paper: mode === 'dark' ? '#1a1a2e' : '#ffffff',
      },
    },
    typography: {
      fontFamily: 'var(--font-lato), sans-serif',
      h1: { fontFamily: 'var(--font-josefin), sans-serif', fontWeight: 700 },
      h2: { fontFamily: 'var(--font-josefin), sans-serif', fontWeight: 700 },
      h3: { fontFamily: 'var(--font-josefin), sans-serif', fontWeight: 700 },
      h4: { fontFamily: 'var(--font-josefin), sans-serif', fontWeight: 700 },
      h5: { fontFamily: 'var(--font-josefin), sans-serif', fontWeight: 600 },
      h6: { fontFamily: 'var(--font-josefin), sans-serif', fontWeight: 600 },
    },
    shape: { borderRadius: 12 },
  });
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<'light' | 'dark'>('dark');

  const colorMode = useMemo(
    () => ({ toggleColorMode: () => setMode((prev) => (prev === 'dark' ? 'light' : 'dark')) }),
    []
  );

  const theme = useMemo(() => buildTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </Provider>
    </ColorModeContext.Provider>
  );
}
