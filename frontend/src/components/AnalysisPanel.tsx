'use client';
import { Box, Typography, Chip, Paper, Divider, Stack } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import LabelIcon from '@mui/icons-material/Label';
import CategoryIcon from '@mui/icons-material/Category';

interface Props {
  analysis: {
    documentType?: string;
    sections?: string[];
    themes?: string[];
    entities?: string[];
    summary?: string;
  };
  filename: string;
}

export default function AnalysisPanel({ analysis, filename }: Props) {
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <DescriptionIcon color="primary" />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Document Analysis</Typography>
        <Chip label={analysis.documentType || 'Unknown'} color="primary" size="small" sx={{ ml: 'auto' }} />
      </Box>

      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
        <strong>File:</strong> {filename}
      </Typography>

      {analysis.summary && (
        <>
          <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.7 }}>
            {analysis.summary}
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </>
      )}

      <Stack spacing={2}>
        {analysis.sections && analysis.sections.length > 0 && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
              <CategoryIcon fontSize="small" color="secondary" />
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'secondary.main' }}>SECTIONS</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {analysis.sections.map((s) => (
                <Chip key={s} label={s} size="small" variant="outlined" />
              ))}
            </Box>
          </Box>
        )}

        {analysis.themes && analysis.themes.length > 0 && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
              <LabelIcon fontSize="small" color="secondary" />
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'secondary.main' }}>THEMES</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {analysis.themes.map((t) => (
                <Chip key={t} label={t} size="small" color="secondary" variant="outlined" />
              ))}
            </Box>
          </Box>
        )}

        {analysis.entities && analysis.entities.length > 0 && (
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>KEY ENTITIES</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
              {analysis.entities.map((e) => (
                <Chip key={e} label={e} size="small" />
              ))}
            </Box>
          </Box>
        )}
      </Stack>
    </Paper>
  );
}
