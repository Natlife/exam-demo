import React from 'react';
import { Box, Typography } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { Camera } from 'iconsax-reactjs';

interface FileDropzoneProps {
  value: string;
  onGetFile: (e: any) => string | null;
  onChange: (value: string) => void;
  onBlur?: () => void;
  width?: string;
  height?: string;
}

const ImageDropZone: React.FC<FileDropzoneProps> = ({ value, onGetFile, onChange, onBlur, width, height }) => {
  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const fakeEvent = {
      target: {
        files: acceptedFiles
      }
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    const url = await onGetFile(fakeEvent);

    if (url) {
      onChange(url);
      onBlur?.();
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'image/*': []
    }
  });

  return (
    <Box
      {...getRootProps()}
      sx={{
        border: '2px dashed #aaa',
        borderRadius: 2,
        padding: 4,
        textAlign: 'center',
        cursor: 'pointer',
        bgcolor: '#f5f5f5',
        transition: 'background-color 0.2s ease',
        width: width,
        height: height,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <input {...getInputProps()} />

      <Camera />

      <Typography variant="body1" sx={{ mb: 1, mt: 1, color: '#555' }}>
        Tải ảnh
      </Typography>
    </Box>
  );
};

export default ImageDropZone;
