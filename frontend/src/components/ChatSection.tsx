'use client';
import { useState, useRef, useEffect } from 'react';
import {
  Box, TextField, IconButton, Typography, Paper, Chip,
  CircularProgress, Avatar, Divider,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import { useChatWithDocumentMutation } from '@/store/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  intent?: string;
  foundInDocument?: boolean;
}

const INTENT_COLORS: Record<string, 'primary' | 'secondary' | 'warning' | 'error' | 'default'> = {
  summary: 'secondary',
  qa: 'primary',
  analysis: 'warning',
  blocked: 'error',
  off_topic: 'error',
};

const SUGGESTED = [
  'Give me a summary of this document',
  'What are the main topics covered?',
  'What type of document is this?',
  'What are the key findings?',
];

interface Props {
  documentId: string;
}

export default function ChatSection({ documentId }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Document is ready. Ask me anything about it — I can summarize, analyze, or answer specific questions.',
    },
  ]);
  const [input, setInput] = useState('');
  const [chat] = useChatWithDocumentMutation();
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (query: string) => {
    if (!query.trim() || loading) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: query }]);
    setLoading(true);

    try {
      const res = await chat({ documentId, query }).unwrap();
      const result = res.result;
      const intent = result.intent || 'qa';
      let content = '';

      if (intent === 'summary') {
        content = result.executiveSummary || '';
        if (result.bulletHighlights?.length) {
          content += '\n\nHighlights:\n' + result.bulletHighlights.map((b: string) => `• ${b}`).join('\n');
        }
        if (result.keyTakeaway) content += `\n\nKey Takeaway: ${result.keyTakeaway}`;
      } else if (intent === 'analysis') {
        content = result.summary || JSON.stringify(result, null, 2);
      } else if (intent === 'blocked' || intent === 'off_topic') {
        content = result.answer || 'This question is outside the document scope.';
      } else {
        content = result.answer || 'No answer found.';
      }

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content, intent, foundInDocument: result.foundInDocument },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Error contacting the agent. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Ask the AI Agents</Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        {SUGGESTED.map((s) => (
          <Chip
            key={s}
            label={s}
            size="small"
            variant="outlined"
            onClick={() => sendMessage(s)}
            sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'rgba(99,102,241,0.1)' } }}
          />
        ))}
      </Box>

      <Paper
        sx={{
          height: 420,
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          bgcolor: 'background.default',
        }}
      >
        {messages.map((msg, i) => (
          <Box
            key={i}
            sx={{
              display: 'flex',
              gap: 1.5,
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
            }}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: msg.role === 'user' ? 'primary.main' : 'secondary.main',
                flexShrink: 0,
              }}
            >
              {msg.role === 'user' ? <PersonIcon fontSize="small" /> : <SmartToyIcon fontSize="small" />}
            </Avatar>
            <Box sx={{ maxWidth: '80%' }}>
              <Paper
                sx={{
                  p: 1.5,
                  bgcolor: msg.role === 'user' ? 'primary.dark' : 'background.paper',
                  borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                  {msg.content}
                </Typography>
              </Paper>
              {msg.intent && (
                <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                  <Chip
                    label={`Agent: ${msg.intent}`}
                    size="small"
                    color={INTENT_COLORS[msg.intent] || 'default'}
                    sx={{ height: 18, fontSize: 10 }}
                  />
                  {msg.foundInDocument === false && msg.intent !== 'blocked' && (
                    <Chip label="Not in document" size="small" color="warning" sx={{ height: 18, fontSize: 10 }} />
                  )}
                </Box>
              )}
            </Box>
          </Box>
        ))}
        {loading && (
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
              <SmartToyIcon fontSize="small" />
            </Avatar>
            <CircularProgress size={18} color="secondary" />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Agents thinking...</Typography>
          </Box>
        )}
        <div ref={bottomRef} />
      </Paper>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Ask anything about the document..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
          disabled={loading}
          multiline
          maxRows={3}
        />
        <IconButton
          color="primary"
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || loading}
          sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' }, borderRadius: 2 }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
