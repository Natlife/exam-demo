import React, { memo, useRef } from "react";
import { Box, Button, IconButton, TextField } from "@mui/material";
import { Trash, VolumeHigh, VideoPlay, Import } from "iconsax-reactjs";
import { MATERIAL_TYPE, sourceRequest } from "@/types/question";
import { RichTextEditor } from "@/components/RickTextEditor";

interface MediaItemEditorProps {
  item: sourceRequest;
  disableDelete: boolean;
  onUpdate: (itemId: string, field: keyof sourceRequest, value: string) => void;
  onRemove: (itemId: string) => void;
  onFileChange: (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => Promise<string | null>;
}

export const MediaItemEditor = memo<MediaItemEditorProps>(
  ({ item, disableDelete, onUpdate, onRemove, onFileChange }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
      <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start", flex: 1 }}>
        <Box sx={{ flex: 1 }}>
          {item.type === MATERIAL_TYPE.TEXT && (
            <RichTextEditor
              id={`content-${item.id}`}
              value={item.source || ""}
              placeholder="Nhập nội dung câu hỏi"
              onChange={(deltaString) =>
                onUpdate(item.id, "source", deltaString)
              }
            />
          )}

          {item.type === MATERIAL_TYPE.IMAGE && (
            <Box
              sx={{
                textAlign: "center",
                p: 1,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
              }}
            >
              {item.source && (
                <img
                  src={item.source}
                  alt="Media"
                  style={{ maxHeight: 100, borderRadius: 1, marginBottom: 8 }}
                  referrerPolicy="no-referrer"
                />
              )}

              <input
                ref={fileInputRef}
                type="file"
                style={{ display: "none" }}
                accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                onChange={async (e) => {
                  const url = await onFileChange(e);
                  if (url) onUpdate(item.id, "source", url);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              />

              <Button
                size="small"
                startIcon={<Import size={12} />}
                onClick={() => fileInputRef.current?.click()}
              >
                {item.source ? "Thay đổi" : "Chọn ảnh"}
              </Button>
            </Box>
          )}

          {item.type === MATERIAL_TYPE.AUDIO && (
            <Box
              sx={{
                p: 1,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                style={{ display: "none" }}
                accept="audio/mpeg,audio/wav,audio/ogg,audio/aac,audio/flac"
                onChange={async (e) => {
                  const url = await onFileChange(e);
                  if (url) onUpdate(item.id, "source", url);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              />

              <Button
                size="small"
                startIcon={<VolumeHigh size={12} />}
                onClick={() => fileInputRef.current?.click()}
              >
                {item.source ? "Thay đổi Audio" : "Chọn Audio"}
              </Button>

              {item.source && (
                <audio
                  src={item.source}
                  controls
                  style={{ width: "100%", height: 30, marginTop: 4 }}
                />
              )}
            </Box>
          )}

          {item.type === MATERIAL_TYPE.VIDEO && (
            <Box
              sx={{
                p: 1,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
              }}
            >
              <TextField
                fullWidth
                size="small"
                placeholder="URL Video..."
                value={item.source.startsWith("data:") ? "" : item.source}
                onChange={(e) => onUpdate(item.id, "source", e.target.value)}
                sx={{ mb: 1, "& .MuiOutlinedInput-root": { borderRadius: 1 } }}
              />

              <input
                ref={fileInputRef}
                type="file"
                style={{ display: "none" }}
                accept="video/mp4,video/webm,video/ogg,video/quicktime"
                onChange={async (e) => {
                  const url = await onFileChange(e);
                  if (url) onUpdate(item.id, "source", url);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              />

              <Button
                size="small"
                startIcon={<VideoPlay size={12} />}
                onClick={() => fileInputRef.current?.click()}
              >
                Tải lên Video
              </Button>

              {item.source.startsWith("data:") && (
                <video
                  src={item.source}
                  controls
                  style={{ width: "100%", borderRadius: 1, marginTop: 4 }}
                />
              )}
            </Box>
          )}
        </Box>

        <IconButton
          size="small"
          color="error"
          onClick={() => onRemove(item.id)}
          disabled={disableDelete}
        >
          <Trash />
        </IconButton>
      </Box>
    );
  },
  (prev, next) =>
    prev.item.source === next.item.source &&
    prev.item.id === next.item.id &&
    prev.disableDelete === next.disableDelete,
);

MediaItemEditor.displayName = "MediaItemEditor";
