import React, { useState } from "react";
import { Box, Typography, Dialog, IconButton } from "@mui/material";
import { CloseSquare } from "iconsax-reactjs";
import { MATERIAL_TYPE, sourceRequest } from "@/types/question";

interface MediaRendererProps {
  item: sourceRequest;
  audioRef?: React.Ref<HTMLAudioElement>;
  onAudioPlay?: (el: HTMLAudioElement) => void;
  maxImageHeight?: number;
}

const getVideoEmbedUrl = (rawUrl: string): string => {
  if (rawUrl.includes("drive.google.com")) {
    const match = rawUrl.match(/\/d\/([a-zA-Z0-9_-]+)\//);
    if (match?.[1])
      return `https://drive.google.com/file/d/${match[1]}/preview`;
  }

  const ytMatch = rawUrl.match(
    /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/,
  );
  if (ytMatch?.[2]?.length === 11)
    return `https://www.youtube.com/embed/${ytMatch[2]}`;

  return rawUrl;
};

export const MediaRenderer: React.FC<MediaRendererProps> = ({
  item,
  audioRef,
  onAudioPlay,
  maxImageHeight,
}) => {
  const [openImage, setOpenImage] = useState(false);

  if (!item.source || item.type === MATERIAL_TYPE.TEXT) return null;

  switch (item.type) {
    case MATERIAL_TYPE.IMAGE:
      return (
        <React.Fragment>
          <Box onClick={() => setOpenImage(true)} sx={{ cursor: "pointer" }}>
            <img
              alt="Media"
              src={item.source.trim() || ""}
              referrerPolicy="no-referrer"
              loading="lazy"
              style={{
                width: "75%",
                aspectRatio: "16 / 9",
                objectFit: "cover",
                objectPosition: "center",
                height: "auto",
                maxWidth: "100%",
                display: "block",
                borderRadius: "16px",
                ...(maxImageHeight ? { maxHeight: maxImageHeight } : {}),
              }}
              onError={(e) => {
                const img = e.currentTarget as HTMLImageElement;
                img.src = "";
              }}
            />
          </Box>

          <Dialog
            open={openImage}
            onClose={() => setOpenImage(false)}
            maxWidth="xl"
            PaperProps={{
              sx: {
                bgcolor: "transparent",
                boxShadow: "none",
                overflow: "hidden",
              },
            }}
          >
            <Box
              sx={{
                position: "relative",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <IconButton
                onClick={() => setOpenImage(false)}
                sx={{
                  position: "absolute",
                  top: -40,
                  right: -40,
                  color: "white",
                }}
              >
                <CloseSquare size={32} />
              </IconButton>

              <img
                alt="Full Media"
                src={item.source.trim() || ""}
                referrerPolicy="no-referrer"
                loading="lazy"
                style={{
                  maxWidth: "100%",
                  maxHeight: "90vh",
                  objectFit: "contain",
                }}
              />
            </Box>
          </Dialog>
        </React.Fragment>
      );

    case MATERIAL_TYPE.AUDIO:
      return (
        <audio
          controls
          controlsList="nodownload"
          preload="none"
          onContextMenu={(e) => e.preventDefault()}
          style={{ width: "75%" }}
          ref={audioRef as React.Ref<HTMLAudioElement>}
          onPlay={(e) => onAudioPlay?.(e.currentTarget)}
        >
          <source src={item.source} />
          Trình duyệt của bạn không hỗ trợ phần tử audio.
        </audio>
      );

    case MATERIAL_TYPE.VIDEO: {
      const isEmbed =
        item.source.includes("drive.google.com") ||
        item.source.includes("youtu");

      if (isEmbed) {
        const embedUrl = getVideoEmbedUrl(item.source);

        return (
          <Box sx={{ position: "relative", width: "75%", pt: "56.25%" }}>
            <iframe
              src={embedUrl}
              title="Video"
              loading="lazy"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                border: 0,
              }}
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </Box>
        );
      }

      return (
        <video
          controls
          controlsList="nodownload"
          preload="none"
          onContextMenu={(e) => e.preventDefault()}
          style={{ width: "75%", borderRadius: "16px", maxWidth: "100%" }}
        >
          <source src={item.source} />
          Trình duyệt của bạn không hỗ trợ phần tử video.
        </video>
      );
    }

    default:
      return (
        <Box
          sx={{ border: "1px solid #ddd", p: 2, bgcolor: "background.paper" }}
        >
          <Typography variant="caption" color="error">
            Không thể xem trước định dạng này.
          </Typography>
        </Box>
      );
  }
};
