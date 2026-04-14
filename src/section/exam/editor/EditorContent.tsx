import React from "react";
import { Paper } from "@mui/material";
import { MediaItemListEditor } from "./MediaItemListEditor";
import { MATERIAL_TYPE, sourceRequest } from "@/types/question";

interface EditorContentProps {
  contentItems: sourceRequest[];
  updateContentItem: (
    id: string,
    field: keyof sourceRequest,
    value: string,
  ) => void;
  removeContentItem: (id: string) => void;
  addContentItem: (type: MATERIAL_TYPE) => void;
  reorderContentItems: (startIndex: number, endIndex: number) => void;
  handleFileChange: (e: any) => Promise<string | null>;
}

export const EditorContent: React.FC<EditorContentProps> = ({
  contentItems,
  updateContentItem,
  removeContentItem,
  addContentItem,
  reorderContentItems,
  handleFileChange,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <MediaItemListEditor
        items={contentItems}
        onReorder={reorderContentItems}
        onUpdate={updateContentItem}
        onRemove={removeContentItem}
        onAdd={addContentItem}
        onFileChange={handleFileChange}
        droppableId="content-items"
      />
    </Paper>
  );
};
