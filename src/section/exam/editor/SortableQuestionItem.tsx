import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box } from '@mui/material';

interface SortableQuestionItemProps {
  id: string;
  children: React.ReactNode;
}

export const SortableQuestionItem: React.FC<SortableQuestionItemProps> = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : 1,
    position: 'relative' as const,
    opacity: isDragging ? 0.5 : 1,
    marginBottom: 48
  };

  return (
    <Box ref={setNodeRef} style={style}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            dragHandleProps: { ...attributes, ...listeners }
          });
        }
        return child;
      })}
    </Box>
  );
};
