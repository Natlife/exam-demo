import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box } from '@mui/material';

interface SortableMediaItemProps {
  id: string;
  children: (dragHandleProps: any) => React.ReactNode;
}

export const SortableMediaItem: React.FC<SortableMediaItemProps> = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : 1,
    position: 'relative' as const,
    opacity: isDragging ? 0.5 : 1
  };

  const dragHandleProps = { ...attributes, ...listeners };

  return (
    <Box ref={setNodeRef} style={style}>
      {children(dragHandleProps)}
    </Box>
  );
};
