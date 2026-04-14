import React from 'react';
import { Backdrop, CircularProgress, Typography, Stack, alpha } from '@mui/material';

interface OverlayLoaderProps {
  open: boolean;
  message?: string;
}

/**
 * A global overlay loader that blocks user interaction during long-running tasks.
 * Designed with a premium, semi-transparent backdrop and smooth typography.
 */
export default function OverlayLoader({ open, message }: OverlayLoaderProps) {
  return (
    <Backdrop
      sx={{
        color: '#fff',
        zIndex: (theme) => Math.max(theme.zIndex.drawer, theme.zIndex.modal, 2000) + 100,
        backgroundColor: (theme) => alpha(theme.palette.grey[900], 0.7),
        backdropFilter: 'blur(4px)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease-in-out'
      }}
      open={open}
    >
      <Stack spacing={2} alignItems="center">
        <CircularProgress 
          color="inherit" 
          size={50} 
          thickness={4} 
          sx={{ 
            filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.3))' 
          }} 
        />
        {message && (
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600, 
              letterSpacing: '0.05em',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              animation: 'pulse 2s infinite ease-in-out',
              '@keyframes pulse': {
                '0%': { opacity: 0.8 },
                '50%': { opacity: 1 },
                '100%': { opacity: 0.8 }
              }
            }}
          >
            {message}
          </Typography>
        )}
      </Stack>
    </Backdrop>
  );
}
