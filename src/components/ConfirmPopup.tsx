import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { FormattedMessage } from 'react-intl';

interface ConfirmDialogProps {
  open: boolean;
  title?: React.ReactNode;
  description?: React.ReactNode;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ open, title, description, loading = false, onClose, onConfirm }) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth keepMounted>
    <DialogTitle>{title ? title : 'Xác nhận hành động'} </DialogTitle>

    {description && (
      <DialogContent>
        <DialogContentText>{description}</DialogContentText>
      </DialogContent>
    )}

    <DialogActions>
      <Button onClick={onClose} color="inherit" size="small" disabled={loading}>
        <FormattedMessage id="cancel" defaultMessage="Hủy" />
      </Button>

      <Button onClick={onConfirm} sx={{ backgroundColor: 'orangered' }} variant="contained" size="small" disabled={loading} autoFocus>
        Xác nhận
      </Button>
    </DialogActions>
  </Dialog>
);
