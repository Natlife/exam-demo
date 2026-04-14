import React, { useEffect, memo, useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { Color } from '@tiptap/extension-color';
import { Box, SxProps, Theme, IconButton, Tooltip, Divider, Menu, ButtonBase, Stack, Typography } from '@mui/material';
import {
  TextBold,
  TextItalic,
  TextUnderline,
  Task,
  FormatCircle,
  Eraser,
  Colorfilter,
  Forbidden,
  ArrowDown2,
  Trash
} from 'iconsax-reactjs';
import { TextStyle } from '@tiptap/extension-text-style';

interface RichTextEditorProps {
  id?: string;
  value?: string;
  onChange?: (jsonString: string) => void;
  placeholder?: string;
  hasError?: boolean;
  containerSx?: SxProps<Theme>;
  onBlur?: () => void;
  disabled?: boolean;
}

const SIMPLE_COLORS = [
  '#000000',
  '#F44336',
  '#E91E63',
  '#9C27B0',
  '#673AB7',
  '#3F51B5',
  '#2196F3',
  '#00BCD4',
  '#009688',
  '#4CAF50',
  '#8BC34A',
  '#CDDC39',
  '#FFEB3B',
  '#FFC107',
  '#FF9800',
  '#FF5722',
  '#795548',
  '#9E9E9E'
];

const ColorPaletteMenu = memo(({ editor }: { editor: any }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const applyColor = useCallback(
    (color: string) => {
      editor.chain().focus().setColor(color).run();
      handleClose();
    },
    [editor]
  );

  const removeColor = useCallback(() => {
    editor.chain().focus().unsetColor().run();
    handleClose();
  }, [editor]);

  const currentColor = editor.getAttributes('textStyle').color;

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <Tooltip title="Màu chữ">
        <IconButton
          size="small"
          onClick={handleClick}
          color={editor.isActive('textStyle') ? 'primary' : 'default'}
          sx={{ borderRadius: 1.5, position: 'relative' }}
        >
          <Colorfilter size={20} variant={open ? 'Bold' : 'Outline'} />

          {currentColor && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 3,
                width: 14,
                height: 2,
                bgcolor: currentColor,
                borderRadius: 1
              }}
            />
          )}

          <ArrowDown2 size={12} variant="Outline" />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{ sx: { px: 1, py: 1.5 } }}
        PaperProps={{ sx: { borderRadius: 2, boxShadow: 3 } }}
      >
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 1, minWidth: 160 }}>
          {SIMPLE_COLORS.map((color) => (
            <ButtonBase
              key={color}
              onClick={() => applyColor(color)}
              sx={{
                width: 24,
                height: 24,
                borderRadius: 1.5,
                bgcolor: color,
                border: '1px solid',
                borderColor: 'divider',
                ...(currentColor === color && {
                  borderColor: 'primary.main',
                  boxShadow: (theme) => `0 0 0 2px ${theme.palette.primary.lighter}`
                }),
                transition: 'all 0.1s',
                '&:hover': {
                  transform: 'scale(1.15)',
                  borderColor: 'text.secondary'
                }
              }}
            />
          ))}

          <Tooltip title="Mặc định (đen)">
            <ButtonBase
              onClick={removeColor}
              sx={{
                gridColumn: 'span 2',
                width: '100%',
                height: 24,
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'grey.100',
                color: 'error.main',
                '&:hover': { bgcolor: 'error.lighter' }
              }}
            >
              <Trash size={16} />
            </ButtonBase>
          </Tooltip>
        </Box>
      </Menu>
    </Box>
  );
});

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 0.5,
        p: 1,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'grey.50',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12
      }}
    >
      <Tooltip title="In đậm">
        <IconButton
          size="small"
          onClick={() => editor.chain().focus().toggleBold().run()}
          color={editor.isActive('bold') ? 'primary' : 'default'}
        >
          <TextBold size={18} />
        </IconButton>
      </Tooltip>

      <Tooltip title="In nghiêng">
        <IconButton
          size="small"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          color={editor.isActive('italic') ? 'primary' : 'default'}
        >
          <TextItalic size={18} />
        </IconButton>
      </Tooltip>

      <Tooltip title="Gạch chân">
        <IconButton
          size="small"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          color={editor.isActive('underline') ? 'primary' : 'default'}
        >
          <TextUnderline size={18} />
        </IconButton>
      </Tooltip>

      <Tooltip title="Gạch ngang">
        <IconButton
          size="small"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          color={editor.isActive('strike') ? 'primary' : 'default'}
        >
          <Forbidden size={18} />
        </IconButton>
      </Tooltip>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      <ColorPaletteMenu editor={editor} />

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      <Tooltip title="Danh sách số">
        <IconButton
          size="small"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          color={editor.isActive('orderedList') ? 'primary' : 'default'}
        >
          <FormatCircle size={18} />
        </IconButton>
      </Tooltip>

      <Tooltip title="Danh sách chấm">
        <IconButton
          size="small"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          color={editor.isActive('bulletList') ? 'primary' : 'default'}
        >
          <Task size={18} />
        </IconButton>
      </Tooltip>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      <Tooltip title="Xóa định dạng">
        <IconButton size="small" onClick={() => editor.chain().focus().unsetAllMarks().run()}>
          <Eraser size={18} />
        </IconButton>
      </Tooltip>

      <Box sx={{ flexGrow: 1 }} />

      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ px: 1 }}>
        <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.65rem' }}>
          Số từ:{' '}
          {
            editor
              .getText()
              .trim()
              .split(/\s+/)
              .filter((word: any) => word.length > 0).length
          }
        </Typography>

        <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.65rem' }}>
          Ký tự: {editor.getText().replace(/\s/g, '').length}
        </Typography>
      </Stack>
    </Box>
  );
};

export const RichTextEditor = memo<RichTextEditorProps>(
  ({ value, onChange, placeholder = 'Nhập nội dung...', hasError = false, containerSx, onBlur, disabled = false }) => {
    const [, setUpdateCount] = useState(0);

    const editor = useEditor({
      extensions: [StarterKit, Underline, TextStyle, Color, Placeholder.configure({ placeholder })],
      content: (() => {
        if (!value) return '';
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      })(),
      onUpdate: () => {
        setUpdateCount((prev) => prev + 1);
      },
      onBlur: ({ editor }) => {
        const json = editor.getJSON();
        const content = editor.getText().trim().length === 0 ? '' : JSON.stringify(json);

        onChange && onChange(content);
        onBlur?.();
      }
    });

    useEffect(() => {
      if (editor && value) {
        try {
          const parsedValue = JSON.parse(value);
          if (JSON.stringify(editor.getJSON()) !== JSON.stringify(parsedValue)) {
            editor.commands.setContent(parsedValue, { emitUpdate: false });
          }
        } catch {
          if (editor.getHTML() !== value && editor.getText() !== value) {
            editor.commands.setContent(value, { emitUpdate: false });
          }
        }
      } else if (editor && !value) {
        editor.commands.setContent('', { emitUpdate: false });
      }
    }, [value, editor]);

    return (
      <Box
        sx={{
          width: '100%',
          '& .ProseMirror': {
            minHeight: 120,
            maxHeight: 450,
            overflowY: 'auto',
            p: 2,
            outline: 'none',
            '& p.is-editor-empty:first-of-type::before': {
              content: 'attr(data-placeholder)',
              color: 'text.disabled',
              float: 'left',
              pointerEvents: 'none',
              height: 0
            },
            '& ul, & ol': { paddingLeft: '1.2rem' }
          },
          ...containerSx
        }}
      >
        <MenuBar editor={editor} />

        <Box
          sx={{
            width: '100%',
            border: '1px solid',
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
            borderColor: hasError ? 'error.main' : 'divider',
            position: 'relative'
          }}
        >
          <EditorContent disabled={disabled} editor={editor} />
        </Box>
      </Box>
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';
