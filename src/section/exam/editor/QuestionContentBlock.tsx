import React, { memo, useRef } from "react";
import { Box, IconButton } from "@mui/material";
import { MATERIAL_TYPE, sourceRequest } from "@/types/question";
import { ExportCurve, Trash } from "iconsax-reactjs";
import { RichTextEditor } from "@/components/RickTextEditor";

interface ContentBlockProps {
  sourceItem: sourceRequest;
  qIndex: number;
  hasError: boolean;
  disableDelete: boolean;
  onContentChange: (sourceId: string, value: string) => void;
  onDelete: (sourceId: string) => void;
  onSave: () => void;
  onGetFile: (e: React.ChangeEvent<HTMLInputElement>) => Promise<string | null>;
}

export const QuestionContentBlock = memo<ContentBlockProps>(
  ({
    sourceItem,
    qIndex,
    hasError,
    disableDelete,
    onContentChange,
    onDelete,
    onSave,
    onGetFile,
  }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const placeholderMap: Partial<Record<MATERIAL_TYPE, string>> = {
      [MATERIAL_TYPE.IMAGE]: "hình ảnh",
      [MATERIAL_TYPE.AUDIO]: "audio",
      [MATERIAL_TYPE.VIDEO]: "video",
    };

    return (
      <Box
        sx={{
          mb: 1,
          width: "100%",
          display: "flex",
          gap: 1,
          alignItems: "flex-start",
        }}
      >
        {sourceItem.type === MATERIAL_TYPE.TEXT ? (
          <RichTextEditor
            id={`content-${sourceItem.id}`}
            value={sourceItem.source}
            placeholder="Nhập nội dung câu hỏi"
            hasError={hasError}
            onChange={(deltaString) =>
              onContentChange(sourceItem.id, deltaString)
            }
          />
        ) : (
          <>
            <input
              ref={fileInputRef}
              type="file"
              hidden
              onChange={async (e) => {
                const url = await onGetFile(e);
                if (url) onContentChange(sourceItem.id, url);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            />

            <Box sx={{ width: "100%", display: "flex", gap: 1 }}>
              <input
                id={`content-${sourceItem.id}`}
                value={sourceItem.source}
                placeholder={`Nhập đáp án ${placeholderMap[sourceItem.type as MATERIAL_TYPE] ?? ""}`}
                onChange={(e) => onContentChange(sourceItem.id, e.target.value)}
                onBlur={onSave}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: `1px solid ${hasError ? "#d32f2f" : "#ccc"}`,
                  borderRadius: "16px",
                  fontSize: 14,
                }}
              />

              <IconButton
                size="medium"
                onClick={() => fileInputRef.current?.click()}
              >
                <ExportCurve />
              </IconButton>
            </Box>
          </>
        )}

        <IconButton
          color="error"
          onClick={() => onDelete(sourceItem.id)}
          disabled={disableDelete}
        >
          <Trash />
        </IconButton>
      </Box>
    );
  },
  (prev, next) =>
    prev.sourceItem === next.sourceItem &&
    prev.hasError === next.hasError &&
    prev.disableDelete === next.disableDelete,
);

QuestionContentBlock.displayName = "QuestionContentBlock";
