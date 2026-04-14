import React, { memo } from "react";
import { Box } from "@mui/material";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { AnimatePresence, motion } from "framer-motion";
import { sourceRequest } from "@/types/question";
import { SortableMediaItem } from "./SortableMediaItem";
import { MediaItemEditor } from "./MediaItemEditor";

interface MediaItemMapProps {
  items: sourceRequest[];
  sensors: any;
  handleDragEnd: (event: any) => void;
  handleUpdate: (
    itemId: string,
    field: keyof sourceRequest,
    value: string,
  ) => void;
  handleRemove: (itemId: string) => void;
  handleFileChange: (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => Promise<string | null>;
}

const DragHandle: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props) => (
  <Box
    {...props}
    sx={{ pt: 1, color: "text.disabled", cursor: "grab", flexShrink: 0 }}
  >
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
    </svg>
  </Box>
);

export const MediaItemMap = memo<MediaItemMapProps>(
  ({
    items,
    sensors,
    handleDragEnd,
    handleUpdate,
    handleRemove,
    handleFileChange,
  }) => {
    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext
          items={items.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <SortableMediaItem key={item.id} id={item.id}>
                {(dragHandleProps) => (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        alignItems: "flex-start",
                        mb: 1,
                      }}
                    >
                      <DragHandle {...dragHandleProps} />
                      <MediaItemEditor
                        item={item}
                        disableDelete={items.length <= 1}
                        onUpdate={handleUpdate}
                        onRemove={handleRemove}
                        onFileChange={handleFileChange}
                      />
                    </Box>
                  </motion.div>
                )}
              </SortableMediaItem>
            ))}
          </AnimatePresence>
        </SortableContext>
      </DndContext>
    );
  },
  (prev, next) => prev.items === next.items,
);

MediaItemMap.displayName = "MediaItemMap";
