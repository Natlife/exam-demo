import React, { useCallback } from "react";
import { Box, Button, Tooltip, Typography } from "@mui/material";
import {
  Text,
  VolumeHigh,
  VideoPlay,
  Image as ImageIcon,
} from "iconsax-reactjs";
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { MATERIAL_TYPE, sourceRequest } from "@/types/question";
import { MediaItemMap } from "./MediaItemMap";

interface MediaItemListEditorProps {
  items: sourceRequest[];
  onReorder: (startIndex: number, endIndex: number) => void;
  onUpdate: (itemId: string, field: keyof sourceRequest, value: string) => void;
  onRemove: (itemId: string) => void;
  onAdd: (type: MATERIAL_TYPE) => void;
  onFileChange: (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => Promise<string | null>;
  title?: string;
  droppableId: string;
}

export const MediaItemListEditor: React.FC<MediaItemListEditorProps> = ({
  items,
  onReorder,
  onUpdate,
  onRemove,
  onAdd,
  onFileChange,
  title,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        onReorder(oldIndex, newIndex);
      }
    },
    [items, onReorder],
  );

  const handleUpdate = useCallback(onUpdate, [onUpdate]);
  const handleRemove = useCallback(onRemove, [onRemove]);
  const handleFileChange = useCallback(onFileChange, [onFileChange]);

  return (
    <Box>
      {title && (
        <Typography
          variant="caption"
          fontWeight="bold"
          color="text.disabled"
          sx={{
            textTransform: "uppercase",
            mb: 1,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          {title}
        </Typography>
      )}

      <Box sx={{ borderRadius: 1, p: 0, bgcolor: "background.paper" }}>
        <MediaItemMap
          items={items}
          sensors={sensors}
          handleDragEnd={handleDragEnd}
          handleUpdate={handleUpdate}
          handleRemove={handleRemove}
          handleFileChange={handleFileChange}
        />

        <Box
          sx={{
            mt: 1,
            pt: 1,
            borderTop: "1px dashed",
            borderColor: "divider",
            display: "flex",
            justifyContent: "center",
            gap: 1,
          }}
        >
          {[
            {
              type: MATERIAL_TYPE.TEXT,
              icon: <Text size={20} />,
              label: "Thêm Văn bản",
            },
            {
              type: MATERIAL_TYPE.IMAGE,
              icon: <ImageIcon size={20} />,
              label: "Thêm Hình ảnh",
            },
            {
              type: MATERIAL_TYPE.AUDIO,
              icon: <VolumeHigh size={20} />,
              label: "Thêm Âm thanh",
            },
            {
              type: MATERIAL_TYPE.VIDEO,
              icon: <VideoPlay size={20} />,
              label: "Thêm Video",
            },
          ].map(({ type, icon, label }) => (
            <Tooltip key={type} title={label} placement="top">
              <Button
                variant="outlined"
                size="small"
                onClick={() => onAdd(type)}
                sx={{
                  borderRadius: 1.5,
                  borderColor: "divider",
                  color: "text.secondary",
                  minWidth: 40,
                  p: 0.75,
                }}
              >
                {icon}
              </Button>
            </Tooltip>
          ))}
        </Box>
      </Box>
    </Box>
  );
};
