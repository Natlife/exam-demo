import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, Stack, Card, CardContent, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { loadExams } from '../mock/data';
import { ExamSetupRequest } from '../types/assignment';
import { Add, Edit2, Play } from 'iconsax-reactjs';

export default function ExamListPage() {
  const [exams, setExams] = useState<ExamSetupRequest[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setExams(loadExams());
  }, []);

  return (
    <Box p={6} sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h3" sx={{ fontWeight: 800 }}>Quản lý bài thi</Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />} 
          sx={{ borderRadius: 3, px: 3, py: 1.5, backgroundColor: 'orangered' }}
        >
          Tạo bài thi mới
        </Button>
      </Stack>

      <Stack spacing={3}>
        {exams.length > 0 ? exams.map(exam => (
          <Card key={exam.id} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', '&:hover': { boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' } }}>
            <CardContent sx={{ p: 4 }}>
              <Grid container alignItems="center">
                <Grid size={{ xs: 12, md: 8 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>{exam.name}</Typography>
                  <Stack direction="row" spacing={3} color="text.secondary">
                    <Typography variant="body2">Thời gian: <strong>{exam.duration} phút</strong></Typography>
                    <Typography variant="body2">Số phần: <strong>{exam.sectionList?.length || 0}</strong></Typography>
                    <Typography variant="body2">Session ID: <strong>{exam.sessionId}</strong></Typography>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button 
                      variant="outlined" 
                      startIcon={<Edit2 />}
                      sx={{ borderRadius: 2, borderColor: 'divider' }}
                    >
                      Sửa
                    </Button>
                    <Button 
                      variant="contained" 
                      startIcon={<Play />}
                      onClick={() => navigate(`/exams/take/${exam.id}`)}
                      sx={{ borderRadius: 2, px: 4 }}
                    >
                      Làm bài
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )) : (
          <Box sx={{ textAlign: 'center', py: 10, bgcolor: 'grey.50', borderRadius: 4, border: '1px dashed', borderColor: 'divider' }}>
            <Typography color="text.secondary">Chưa có bài thi nào được tạo.</Typography>
          </Box>
        )}
      </Stack>
    </Box>
  );
}

