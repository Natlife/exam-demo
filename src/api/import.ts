import { ExamSetupRequest } from "@/types/assignment";
import {
  AnswerRequest,
  MATERIAL_TYPE,
  QUESTION_TYPE,
  QuestionGroupListRequest,
  QuestionGroupRequest,
  QuestionRequest,
  SectionRequest,
  sourceRequest,
} from "@/types/question";
import * as XLSX from "xlsx";
import templateUrl from "../assets/images/form_assignment.xlsx";

export interface ExamImportMeta {
  totalQuestions: number;
  totalGroups: number;
  totalSections: number;
  totalScore: number;
}

export interface ExamImportResult {
  exam: ExamSetupRequest;
  meta: ExamImportMeta;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function hasValue(v: unknown): boolean {
  return v !== null && v !== undefined && v !== "";
}

function parseSource(cellVal: unknown): sourceRequest[] {
  if (!hasValue(cellVal)) return [];

  const lines = String(cellVal)
    .trim()
    .split(/\n|\\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  return lines.map((l) => {
    const match = l.match(/^\[(text|image|audio|video)\]\s*(.*)/i);
    if (match) {
      const typeMap: Record<string, MATERIAL_TYPE> = {
        text: MATERIAL_TYPE.TEXT,
        image: MATERIAL_TYPE.IMAGE,
        audio: MATERIAL_TYPE.AUDIO,
        video: MATERIAL_TYPE.VIDEO,
      };
      return {
        id: uid(),
        type: typeMap[match[1].toLowerCase()],
        source: match[2].trim(),
      };
    }
    return { id: uid(), type: MATERIAL_TYPE.TEXT, source: l };
  });
}

function parseInputTypes(val: unknown): MATERIAL_TYPE[] {
  if (!hasValue(val)) return [MATERIAL_TYPE.TEXT];
  return String(val)
    .split(",")
    .map((s) => s.trim())
    .map((s) => {
      if (s === "IMAGE") return MATERIAL_TYPE.IMAGE;
      if (s === "AUDIO") return MATERIAL_TYPE.AUDIO;
      if (s === "VIDEO") return MATERIAL_TYPE.VIDEO;
      return MATERIAL_TYPE.TEXT;
    });
}

function parseQuestionType(val: unknown): QUESTION_TYPE {
  switch (
    String(val ?? "")
      .toUpperCase()
      .trim()
  ) {
    case "MCQ":
      return QUESTION_TYPE.MCQ;
    case "FILL":
      return QUESTION_TYPE.FILL;
    case "ESSAY":
      return QUESTION_TYPE.ESSAY;
    case "SOURCE_ONLY":
      return QUESTION_TYPE.SOURCE_ONLY;
    default:
      return QUESTION_TYPE.MCQ;
  }
}

function parseIsCorrect(val: unknown): number {
  const s = String(val ?? "").trim();
  return s === "Đúng" || s === "1" ? 1 : 0;
}

function buildAnswer(
  ndDapAn: unknown,
  ndPhuDA: unknown,
  dapAnDung: unknown,
): AnswerRequest {
  const content = parseSource(ndDapAn);
  if (hasValue(ndPhuDA)) {
    content.push({
      id: uid(),
      type: MATERIAL_TYPE.TEXT,
      source: String(ndPhuDA),
      subContent: String(ndPhuDA),
    });
  }
  return { id: uid(), content, isCorrect: parseIsCorrect(dapAnDung) };
}

// ─── Core parser ──────────────────────────────────────────────────────────────

function parseRows(rows: unknown[][]): ExamImportResult {
  const sections: SectionRequest[] = [];
  let curSection: SectionRequest | null = null;
  let curGroup: QuestionGroupListRequest | null = null;
  let curSubGroup: QuestionGroupRequest | null = null;
  let curQuestion: QuestionRequest | null = null;

  for (const r of rows) {
    const [
      sttPhan,
      tenPhan,
      sttNhomLon,
      tieuDeNhomLon,
      sttNhomNho,
      ndNhomNho,
      sttCauHoi,
      loaiCauHoi,
      diem,
      ndCauHoi,
      ghiChu,
      giaiThich,
      batDanY,
      dinhDang,
      ndDapAn,
      ndPhuDA,
      dapAnDung,
    ] = r;

    // ── Section: merge into existing if same name ──────────────────────────
    if (hasValue(sttPhan)) {
      const name = String(tenPhan || `Phần ${sttPhan}`);
      const existing = sections.find((s) => s.name === name);
      if (existing) {
        curSection = existing;
      } else {
        curSection = { id: uid(), name, questionGroupList: [] };
        sections.push(curSection);
      }
      curGroup = null;
      curSubGroup = null;
      curQuestion = null;
    }

    if (!curSection) continue;

    // ── QuestionGroupList (nhóm lớn / part) ───────────────────────────────
    if (hasValue(sttNhomLon)) {
      curGroup = {
        id: uid(),
        serialNumber: Number(sttNhomLon),
        title: parseSource(tieuDeNhomLon),
        totalPlayed: 0,
        questionGroup: [],
      };
      curSection.questionGroupList.push(curGroup);
      curSubGroup = null;
      curQuestion = null;
    }

    if (!curGroup) continue;

    // ── QuestionGroup (nhóm nhỏ / group) ──────────────────────────────────
    if (hasValue(sttNhomNho)) {
      curSubGroup = {
        id: uid(),
        serialNumber: Number(sttNhomNho),
        content: parseSource(ndNhomNho),
        totalPlayed: 0,
        questionList: [],
      };
      curGroup.questionGroup.push(curSubGroup);
      curQuestion = null;
    }

    if (!curSubGroup) continue;

    // ── Question ───────────────────────────────────────────────────────────
    if (hasValue(sttCauHoi)) {
      const qtype = parseQuestionType(loaiCauHoi);
      curQuestion = {
        id: uid(),
        serialNumber: Number(sttCauHoi),
        type: qtype,
        content: parseSource(ndCauHoi),
        note: String(ghiChu ?? ""),
        gradingExplanation: String(giaiThich ?? ""),
        explanation: "",
        totalPlayed: 0,
        score: Number(diem ?? 0),
        answerList: [],
        review: "",
        isNote: batDanY === "Bật" || batDanY === "1",
        inputType: parseInputTypes(dinhDang),
        isMultipleChoice: qtype === QUESTION_TYPE.MCQ,
        status: 0,
        createdAt: new Date().toISOString(),
      };
      curSubGroup.questionList.push(curQuestion);

      // First answer on the same row as the question
      if (hasValue(ndDapAn)) {
        curQuestion.answerList.push(buildAnswer(ndDapAn, ndPhuDA, dapAnDung));
      }
      continue;
    }

    // ── Additional answer rows (MCQ continuation) ──────────────────────────
    if (curQuestion && hasValue(ndDapAn)) {
      curQuestion.answerList.push(buildAnswer(ndDapAn, ndPhuDA, dapAnDung));
    }
  }

  // ── Compute meta ───────────────────────────────────────────────────────────
  let totalQuestions = 0;
  let totalGroups = 0;
  let totalScore = 0;

  for (const s of sections) {
    for (const g of s.questionGroupList) {
      for (const sg of g.questionGroup) {
        totalGroups++;
        totalQuestions += sg.questionList.length;
        totalScore += sg.questionList.reduce((acc, q) => acc + q.score, 0);
      }
    }
  }

  return {
    exam: {
      id: uid(),
      name: "Bài tập mới",
      total: totalScore,
      duration: 60,
      sessionId: 0,
      totalPlay: 0,
      submitDeadline: "",
      sectionList: sections,
    },
    meta: {
      totalSections: sections.length,
      totalGroups,
      totalQuestions,
      totalScore,
    },
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Parse an xlsx File object into an ExamSetupRequest.
 *
 * @example
 * const { exam, meta } = await parseExamFromFile(file);
 * setExam(exam);
 */
export async function parseExamFromFile(file: File): Promise<ExamImportResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target?.result as ArrayBuffer, {
          type: "array",
        });
        // Ưu tiên tìm sheet "Nhập Câu Hỏi", nếu không thấy thì lấy sheet đầu tiên
        let ws = wb.Sheets["Nhập Câu Hỏi"];
        if (!ws) {
          const firstSheetName = wb.SheetNames[0];
          ws = wb.Sheets[firstSheetName];
        }
        
        if (!ws) throw new Error("File Excel không có dữ liệu hoặc không hợp lệ");

        const allRows = XLSX.utils.sheet_to_json(ws, {
          header: 1,
          defval: null,
        }) as unknown[][];

        const dataRows = allRows
          .slice(1) // skip header row
          .filter((r) => r.some((c) => c !== null && c !== ""));

        resolve(parseRows(dataRows));
      } catch (err) {
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    };

    reader.onerror = () => reject(new Error("Không thể đọc file"));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Parse an xlsx ArrayBuffer directly into an ExamSetupRequest.
 * Useful when you already have the raw buffer (e.g. from fetch or Node.js fs).
 *
 * @example
 * const buffer = await fetch(url).then(r => r.arrayBuffer());
 * const { exam, meta } = parseExamFromBuffer(buffer);
 */
export function parseExamFromBuffer(buffer: ArrayBuffer): ExamImportResult {
  const wb = XLSX.read(buffer, { type: "array" });
  let ws = wb.Sheets["Nhập Câu Hỏi"];
  if (!ws) {
    const firstSheetName = wb.SheetNames[0];
    ws = wb.Sheets[firstSheetName];
  }
  if (!ws) throw new Error("File Excel không có dữ liệu");

  const allRows = XLSX.utils.sheet_to_json(ws, {
    header: 1,
    defval: null,
  }) as unknown[][];

  const dataRows = allRows
    .slice(1)
    .filter((r) => r.some((c) => c !== null && c !== ""));

  return parseRows(dataRows);
}

export function downloadExamTemplate(): void {
  const link = document.createElement("a");
  link.href = templateUrl;
  link.download = "form_assignment.xlsx";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
