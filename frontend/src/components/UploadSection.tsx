'use client';
import { useState, useCallback } from 'react';
import {
  Box, Typography, Button, CircularProgress, Alert, Paper, Chip,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useUploadDocumentMutation, useAnalyzeDocumentMutation } from '@/store/api';

interface Props {
  onDocumentReady: (id: string, filename: string, analysis: any) => void;
}

export default function UploadSection({ onDocumentReady }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadDoc] = useUploadDocumentMutation();
  const [analyzeDoc] = useAnalyzeDocumentMutation();
  const [status, setStatus] = useState<'idle' | 'uploading' | 'analyzing' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleFile = useCallback((f: File) => {
    if (f.type !== 'application/pdf') {
      setError('Only PDF files are supported.');
      return;
    }
    setFile(f);
    setError('');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleProcess = async () => {
    if (!file) return;
    setStatus('uploading');
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await uploadDoc(formData).unwrap();

      setStatus('analyzing');
      const analysisRes = await analyzeDoc(uploadRes.documentId).unwrap();

      setStatus('done');
      onDocumentReady(uploadRes.documentId, uploadRes.filename, analysisRes.result);
    } catch (err: any) {
      setStatus('error');
      setError(err?.data?.message || 'Something went wrong. Check backend is running.');
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 6 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, textAlign: 'center', mb: 1 }}>
        PDF Intelligence Platform
      </Typography>
      <Typography variant="body1" sx={{ textAlign: 'center', color: 'text.secondary', mb: 4 }}>
        Upload a PDF — 4 AI agents will analyze, summarize, and answer your questions.
      </Typography>

      <Paper
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        sx={{
          border: `2px dashed ${dragOver ? '#6366f1' : '#333'}`,
          borderRadius: 3,
          p: 5,
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'border-color 0.2s',
          bgcolor: dragOver ? 'rgba(99,102,241,0.05)' : 'background.paper',
        }}
        onClick={() => document.getElementById('pdf-input')?.click()}
      >
        <input
          id="pdf-input"
          type="file"
          accept="application/pdf"
          hidden
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
        <Typography variant="h6">Drag & drop your PDF here</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>or click to browse</Typography>
      </Paper>

      {file && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
          <PictureAsPdfIcon color="error" />
          <Typography variant="body2">{file.name}</Typography>
          <Chip label={`${(file.size / 1024).toFixed(1)} KB`} size="small" />
        </Box>
      )}

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

      {status === 'uploading' && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
          <CircularProgress size={20} />
          <Typography variant="body2">Uploading & extracting text...</Typography>
        </Box>
      )}
      {status === 'analyzing' && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
          <CircularProgress size={20} color="secondary" />
          <Typography variant="body2">Document Analysis Agent running...</Typography>
        </Box>
      )}

      <Button
        variant="contained"
        fullWidth
        sx={{ mt: 3, py: 1.5, fontWeight: 700 }}
        disabled={!file || status === 'uploading' || status === 'analyzing'}
        onClick={handleProcess}
      >
        {status === 'uploading' || status === 'analyzing' ? 'Processing...' : 'Analyze Document'}
      </Button>
    </Box>
  );
}
