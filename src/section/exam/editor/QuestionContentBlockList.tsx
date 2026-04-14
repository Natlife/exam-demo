import React, { memo, useCallback, useState } from "react";
import { Stack } from "@mui/material";
import { sourceRequest } from "@/types/question";
import { ConfirmDialog as ConfirmDelete } from "@/components/ConfirmPopup";
import { QuestionContentBlock } from "./QuestionContentBlock";

interface QuestionContentListProps {
  content: sourceRequest[];
  qIndex: number;
  errors?: Record<string, string>;
  onContentChange: (sourceId: string, value: string) => void;
  onContentRemove: (sourceId: string) => void;
  onSave: () => void;
  onGetFile: (e: React.ChangeEvent<HTMLInputElement>) => Promise<string | null>;
}

export const QuestionContentList = memo<QuestionContentListProps>(
  ({
    content,
    qIndex,
    errors,
    onContentChange,
    onContentRemove,
    onSave,
    onGetFile,
  }) => {
    const [selectedId, setSelectedId] = useState("");
    const [openConfirm, setOpenConfirm] = useState(false);

    const handleRequestDelete = useCallback((id: string) => {
      setSelectedId(id);
      setOpenConfirm(true);
    }, []);

    const handleConfirmDelete = useCallback(() => {
      if (selectedId) onContentRemove(selectedId);
      setOpenConfirm(false);
    }, [selectedId, onContentRemove]);

    const handleClose = useCallback(() => setOpenConfirm(false), []);

    return (
      <>
        <Stack>
          {content.map((sourceItem: sourceRequest) => (
            <QuestionContentBlock
              key={sourceItem.id}
              sourceItem={sourceItem}
              qIndex={qIndex}
              hasError={Boolean(errors?.[`questionList[${qIndex}].content`])}
              disableDelete={content.length === 1}
              onContentChange={onContentChange}
              onDelete={handleRequestDelete}
              onSave={onSave}
              onGetFile={onGetFile}
            />
          ))}
        </Stack>

        <ConfirmDelete
          open={openConfirm}
          title="Xác nhận xóa"
          description="Bạn có chắc chắn muốn xóa nội dung câu hỏi này không?"
          onClose={handleClose}
          onConfirm={handleConfirmDelete}
        />
      </>
    );
  },
  // Chỉ re-render khi content array hoặc error thực sự thay đổi
  (prev, next) => prev.content === next.content && prev.errors === next.errors,
);

QuestionContentList.displayName = "QuestionContentList";
