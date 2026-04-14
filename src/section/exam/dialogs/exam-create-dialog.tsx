import { useEffect, useState } from 'react';
import {
  Alert,
  alpha,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  Snackbar,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { CloseCircle, Timer1, Edit, Save2 } from 'iconsax-reactjs';
import { update } from "@/api/exam";
import { HttpStatusCode } from 'axios';
import useAuth from "@/hooks/useAuth";
import { useIntl } from 'react-intl';
import { ExamSetupRequest } from "@/types/assignment";

interface ExamCreateDialogProps {
  examData: ExamSetupRequest;
  open: boolean;
  setOpen: (open: boolean) => void;
  onSave: (id: number | string, exam: ExamSetupRequest) => void;
}

export default function ExamCreateDialog({ open, examData, setOpen, onSave }: ExamCreateDialogProps) {
  const { logout } = useAuth();
  const intl = useIntl();
  const [loading, setLoading] = useState(false);
  const [localData, setLocalData] = useState<ExamSetupRequest>(examData);
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  useEffect(() => {
    if (open) {
      setLocalData(examData);
    }
  }, [open, examData]);

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const numValue = value === '' ? 0 : parseInt(value, 10);

    if (isNaN(numValue)) return;

    const currentDuration = localData.duration || 0;
    let hours = Math.floor(currentDuration / 3600);
    let minutes = Math.floor((currentDuration % 3600) / 60);
    let seconds = currentDuration % 60;

    if (name === 'hours') hours = numValue;
    else if (name === 'minutes') minutes = Math.min(numValue, 59);
    else if (name === 'seconds') seconds = Math.min(numValue, 59);

    const newDuration = hours * 3600 + minutes * 60 + seconds;
    setLocalData({ ...localData, duration: newDuration });
  };

  const handleTotalPlayChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val === '') {
      setLocalData({ ...localData, totalPlay: 0 });
      return;
    }

    const num = parseInt(val, 10);
    if (!isNaN(num)) {
      setLocalData({ ...localData, totalPlay: num });
    }
  };

  const handleSubmit = async () => {
    if (!localData.name.trim()) {
      setAlert({ open: true, message: 'Tên bài thi không được để trống', severity: 'error' });
      return;
    }

    setLoading(true);

    try {
      const response = await update(localData);

      if (response.statusCode === HttpStatusCode.Ok) {
        setAlert({ open: true, message: 'Cập nhật thành công', severity: 'success' });
        onSave(localData.id!, localData);
        setTimeout(() => setOpen(false), 800);
      } else if (response.statusCode === HttpStatusCode.Unauthorized) {
        logout();
      } else {
        setAlert({ open: true, message: response.message || intl.formatMessage({ id: 'unknown-error' }), severity: 'error' });
      }
    } catch {
      setAlert({ open: true, message: 'Lỗi hệ thống', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      open={open}
      onClose={() => setOpen(false)}
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{ p: 3, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'grey.200' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Chỉnh sửa thông tin
          </Typography>

          <IconButton onClick={() => setOpen(false)} size="small">
            <CloseCircle size={24} />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: 4 }}>
        <Stack spacing={3.5} sx={{ mt: 1 }}>
          <Stack spacing={1}>
            <InputLabel htmlFor="exam-name" sx={{ fontWeight: 700, px: 0.5 }}>
              Tên bài thi
            </InputLabel>

            <TextField
              id="exam-name"
              fullWidth
              variant="outlined"
              placeholder="Nhập tên bài thi"
              value={localData.name}
              onChange={(e) => setLocalData({ ...localData, name: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Edit size={18} color="#64748b" />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2, bgcolor: alpha('#f8fafc', 0.8) }
              }}
            />
          </Stack>

          <Stack spacing={1.5}>
            <InputLabel sx={{ fontWeight: 700, px: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Timer1 size={18} /> Thời gian làm bài
            </InputLabel>

            <Grid container spacing={2}>
              <Grid size={4}>
                <TextField
                  name="hours"
                  label="Giờ"
                  type="number"
                  value={Math.floor(localData.duration / 3600) || ''}
                  onChange={handleDurationChange}
                  InputProps={{ sx: { borderRadius: 2 } }}
                />
              </Grid>

              <Grid size={4}>
                <TextField
                  name="minutes"
                  label="Phút"
                  type="number"
                  value={Math.floor((localData.duration % 3600) / 60) || ''}
                  onChange={handleDurationChange}
                  InputProps={{ sx: { borderRadius: 2 } }}
                />
              </Grid>

              <Grid size={4}>
                <TextField
                  name="seconds"
                  label="Giây"
                  type="number"
                  value={localData.duration % 60 || ''}
                  onChange={handleDurationChange}
                  InputProps={{ sx: { borderRadius: 2 } }}
                />
              </Grid>
            </Grid>
          </Stack>

          <Stack spacing={1}>
            <InputLabel htmlFor="total-play" sx={{ fontWeight: 700, px: 0.5 }}>
              Số lượt nghe audio
            </InputLabel>

            <TextField
              id="total-play"
              fullWidth
              type="number"
              variant="outlined"
              placeholder="Nhập số lượt nghe"
              value={localData.totalPlay === 0 ? '' : localData.totalPlay}
              onChange={handleTotalPlayChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Timer1 size={18} color="#64748b" />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2, bgcolor: alpha('#f8fafc', 0.8) }
              }}
            />
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 4, pt: 0 }}>
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={<Save2 variant="Bold" />}
          sx={{
            py: 1.5,
            borderRadius: 2.5,
            fontWeight: 700,
            boxShadow: (theme) => `0 8px 16px -4px ${alpha(theme.palette.primary.main, 0.3)}`,
            '&:hover': { transform: 'translateY(-1px)', boxShadow: (theme) => `0 12px 20px -6px ${alpha(theme.palette.primary.main, 0.4)}` }
          }}
        >
          Lưu thông tin
        </Button>
      </DialogActions>

      <Snackbar
        open={alert.open}
        autoHideDuration={4000}
        onClose={() => setAlert({ ...alert, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={alert.severity} variant="filled" sx={{ borderRadius: 2 }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}

