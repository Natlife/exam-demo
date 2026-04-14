import { Box, Backdrop, IconButton } from '@mui/material';
import { CloseCircle } from 'iconsax-reactjs';

const defaultCourse = 'https://placehold.co/600x400?text=No+Image+Available';

interface Prop {
  source: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const ZoomImage = ({ source, open, setOpen }: Prop) => {
  const handleClose = () => {
    setOpen(false);
  };

  if (!open || !source) return null;

  return (
    <Box>
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'rgb(0, 0, 0)',
          display: 'flex',
          flexDirection: 'column'
        }}
        open={open}
        onClick={handleClose}
      >
        <IconButton onClick={handleClose} sx={{ position: 'absolute', top: 20, right: 20, color: 'white' }}>
          <CloseCircle />
        </IconButton>

        <Box
          component="img"
          src={source && source.trim() ? source : defaultCourse}
          alt="Ảnh hiển thị bị lỗi"
          onClick={(e) => e.stopPropagation()}
          sx={{
            maxWidth: '90%',
            maxHeight: '90%',
            objectFit: 'contain',
            backgroundColor: 'white',
            boxShadow: 24,
            borderRadius: 1
          }}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.backgroundColor = '#ffe6e6';
            (e.currentTarget as HTMLImageElement).style.color = '#cc0000';
            (e.currentTarget as HTMLImageElement).style.content = '';
            (e.currentTarget as HTMLImageElement).style.padding = '20px';
            (e.currentTarget as HTMLImageElement).style.borderRadius = '10px';
          }}
        />
      </Backdrop>
    </Box>
  );
};

export default ZoomImage;
