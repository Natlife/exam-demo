import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

// ExamListPage is available but not mounted as a route (DetailSession handles /exams)
import StudentExamPage from "./pages/StudentExamPage";
import TeacherGradingPage from "./pages/TeacherGradingPage";
import QuestionAddPage from "./pages/QuestionAddPage";
import QuestionEditPage from "./pages/QuestionEditPage";
import { initStorage } from "./mock/data";
import DetailSession from "./section/session-detail";
import Locales from "./components/Locales";

// --- Design System Parity ---
const theme = createTheme({
  palette: {
    primary: {
      lighter: "#e0f2fe",
      light: "#7dd3fc",
      main: "#2563eb",
      dark: "#1e40af",
      darker: "#0c4a6e",
      contrastText: "#ffffff",
    },
    secondary: {
      lighter: "#fef3c7",
      light: "#fcd34d",
      main: "#f59e0b",
      dark: "#b45309",
      darker: "#78350f",
      contrastText: "#ffffff",
    },
    success: {
      lighter: "#f0fdf4",
      light: "#86efac",
      main: "#2e7d32",
      dark: "#166534",
      darker: "#064e3b",
      contrastText: "#ffffff",
    },
    error: {
      lighter: "#fef2f2",
      light: "#fca5a5",
      main: "#d32f2f",
      dark: "#991b1b",
      darker: "#7f1d1d",
      contrastText: "#ffffff",
    },
    warning: {
      lighter: "#fffbeb",
      light: "#fde68a",
      main: "#ed6c02",
      dark: "#c2410c",
      darker: "#7c2d12",
      contrastText: "#ffffff",
    },
    info: {
      lighter: "#f0f9ff",
      light: "#7dd3fc",
      main: "#0288d1",
      dark: "#075985",
      darker: "#0c4a6e",
      contrastText: "#ffffff",
    },
    background: {
      default: "#f8fafc",
      paper: "#ffffff",
    },
    grey: {
      50: "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#64748b",
    },
  },
  customShadows: {
    z1: "0 2px 4px 0 rgba(0,0,0,0.05)",
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: '"Outfit", "Inter", "Roboto", sans-serif',
    h3: { fontWeight: 800 },
    h4: { fontWeight: 800 },
    h5: { fontWeight: 700 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          boxShadow: "none",
          "&:hover": { boxShadow: "none" },
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          border: "1px solid #f1f5f9",
        },
      },
    },
  },
});

export default function App() {
  React.useEffect(() => {
    initStorage();
  }, []);

  return (
    <Locales>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/exams" replace />} />
            <Route path="/exams" element={<DetailSession />} />
            <Route
              path="/exams/edit/:id/section/:sectionId/add"
              element={<QuestionAddPage />}
            />
            <Route
              path="/exams/edit/:id/section/:sectionId/edit"
              element={<QuestionEditPage />}
            />
            <Route path="/exams/take/:id" element={<StudentExamPage />} />
            <Route
              path="/exams/grade/:examId/student/:studentId"
              element={<TeacherGradingPage />}
            />
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/exams" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </Locales>
  );
}
