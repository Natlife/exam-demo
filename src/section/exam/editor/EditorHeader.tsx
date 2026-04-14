import React from "react";
import { Box, Paper } from "@mui/material";
import { MediaItemListEditor } from "./MediaItemListEditor";
import { MATERIAL_TYPE, sourceRequest } from "@/types/question";

interface EditorHeaderProps {
  headerItems: sourceRequest[];
  updateHeaderItem: (
    id: string,
    field: keyof sourceRequest,
    value: string,
  ) => void;
  removeHeaderItem: (id: string) => void;
  addHeaderItem: (type: MATERIAL_TYPE) => void;
  reorderHeaderItems: (startIndex: number, endIndex: number) => void;
  handleFileChange: (e: any) => Promise<any>;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  headerItems,
  updateHeaderItem,
  removeHeaderItem,
  addHeaderItem,
  reorderHeaderItems,
  handleFileChange,
}) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
        }}
      >
        <MediaItemListEditor
          items={headerItems}
          onReorder={reorderHeaderItems}
          onUpdate={updateHeaderItem}
          onRemove={removeHeaderItem}
          onAdd={addHeaderItem}
          onFileChange={handleFileChange}
          droppableId="header-items"
        />
      </Paper>
    </Box>
  );
};
