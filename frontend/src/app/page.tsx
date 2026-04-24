'use client';
import { useState } from 'react';
import { Container, Box, Button, Typography, IconButton, Tooltip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useTheme } from '@mui/material/styles';
import UploadSection from '@/components/UploadSection';
import AnalysisPanel from '@/components/AnalysisPanel';
import ChatSection from '@/components/ChatSection';
import { useColorMode } from '@/app/providers';

type AppState = 'upload' | 'chat';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('upload');
  const [documentId, setDocumentId] = useState('');
  const [filename, setFilename] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const { toggleColorMode } = useColorMode();
  const theme = useTheme();

  const handleDocumentReady = (id: string, name: string, analysisResult: any) => {
    setDocumentId(id);
    setFilename(name);
    setAnalysis(analysisResult);
    setAppState('chat');
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        <Tooltip title={theme.palette.mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
          <IconButton onClick={toggleColorMode} color="primary">
            {theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Tooltip>
      </Box>
      {appState === 'upload' && (
        <UploadSection onDocumentReady={handleDocumentReady} />
      )}

      {appState === 'chat' && (
        <Box>
          <Box sx={{ display: 'flex',alignItems:'center', gap: 1, mb: 3 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => setAppState('upload')}
              size="small"
              variant="outlined"
            >
              Upload New
            </Button>
         <Typography 
  variant="h6" 
  sx={{ 
    color: 'text.secondary', 
    ml: 1,
    fontWeight: 'bold',
    textAlign: 'center',
    width: '100%',
    mr:12,
  }}
>
  Multi-Agent PDF Intelligence
</Typography>
          </Box>

          {analysis && <AnalysisPanel analysis={analysis} filename={filename} />}
          <ChatSection documentId={documentId} />
        </Box>
      )}
    </Container>
  );
}
