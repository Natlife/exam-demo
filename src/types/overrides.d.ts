import "@mui/material/styles";
import "@mui/material/Chip";
import "@tanstack/react-table";

declare module "@mui/material/styles" {
  interface Palette {
    primary: PaletteColor & { lighter: string; darker: string };
    secondary: PaletteColor & { lighter: string; darker: string };
    error: PaletteColor & { lighter: string; darker: string };
    warning: PaletteColor & { lighter: string; darker: string };
    info: PaletteColor & { lighter: string; darker: string };
    success: PaletteColor & { lighter: string; darker: string };
  }

  interface PaletteOptions {
    primary?: PaletteColorOptions & { lighter?: string; darker?: string };
    secondary?: PaletteColorOptions & { lighter?: string; darker?: string };
    error?: PaletteColorOptions & { lighter?: string; darker?: string };
    warning?: PaletteColorOptions & { lighter?: string; darker?: string };
    info?: PaletteColorOptions & { lighter?: string; darker?: string };
    success?: PaletteColorOptions & { lighter?: string; darker?: string };
  }

  interface PaletteColor {
    lighter?: string;
    darker?: string;
  }

  interface PaletteColorOptions {
    lighter?: string;
    darker?: string;
  }

  interface TypeSettings {
    themeContrast: boolean;
  }

  interface Theme {
    customShadows: {
      z1: string;
    };
  }

  interface ThemeOptions {
    customShadows?: {
      z1?: string;
    };
  }
}

declare module "@mui/material" {
  interface PaletteColorOptions {
    lighter?: string;
    darker?: string;
  }
}

declare module "@mui/material/Chip" {
  interface ChipPropsVariantOverrides {
    light: true;
  }
}

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, columnId: string, value: any) => void;
    selectedRow?: any;
    setSelectedRow?: (row: any) => void;
  }
}
