import React from 'react';
import { Box, Typography } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { ExportCurve } from 'iconsax-reactjs';

interface FileDropzoneProps {
  disabled?: boolean;
  value: string;
  onGetFile: (e: any) => Promise<string | null>;
  onChange: (value: string) => void;
  onBlur?: () => void;
}

const FileDropzone: React.FC<FileDropzoneProps> = ({ disabled, value, onGetFile, onChange, onBlur }) => {
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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    disabled
  });

  return (
    <Box
      {...getRootProps()}
      sx={{
        border: '2px dashed #aaa',
        borderRadius: 2,
        padding: 4,
        textAlign: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        bgcolor: isDragActive ? '#f5f5f5' : '#fafafa',
        transition: 'background-color 0.2s ease',
        borderColor: '#3F7DF8',
        width: '100%',
        minHeight: 200,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <input {...getInputProps()} />

      <ExportCurve />

      <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1, color: '#555' }}>
        Nhấp hoặc kéo file vào đây
      </Typography>

      <Typography variant="body1" sx={{ color: '#9FA2AA' }}>
        Dung lượng tối đa 5MB mỗi file.
      </Typography>
    </Box>
  );
};

export default FileDropzone;
