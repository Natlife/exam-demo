import { useNavigate } from "react-router-dom";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Divider,
  InputLabel,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Edit2, SearchNormal, Trash } from "iconsax-reactjs";
import { ExamSetupRequest } from "@/types/assignment";
import { SectionRequest } from "@/types/question";
import { useEffect, useState } from "react";
import ExamQuestionBank from "./question-bank";
import ExamCreateDialog from "./dialogs/exam-create-dialog";
import { createSection, deleteSection } from "@/api/exam";
import { HttpStatusCode } from "axios";
import useAuth from "@/hooks/useAuth";
import { useIntl } from "react-intl";
import { ConfirmDialog } from "@/components/ConfirmPopup";
import DetailPreview from "./preview-detail";
import { parseExamFromFile, downloadExamTemplate } from "@/api/import";
import { Dialog, DialogActions } from "@mui/material";

interface AssignmentSetupProps {
  examData: ExamSetupRequest;
  onSave: (id: number | string, exam: ExamSetupRequest) => void;
  onUpdate: (exam: ExamSetupRequest) => void;
  index: number;
  courseId: number;
  handleDeleteExam: (exam: ExamSetupRequest) => void;
  getNewExamQuestionBank: () => SectionRequest;
  fetchExams: () => void;
  isDone: boolean;
  setAlert: (alert: {
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }) => void;
  alert: {
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  };
}

export default function ExamComponent({
  examData,
  onSave,
  onUpdate,
  handleDeleteExam,
  courseId,
  getNewExamQuestionBank,
  fetchExams,
  alert,
  setAlert,
}: AssignmentSetupProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [openPreview, setOpenPreview] = useState(false);
  const [localData, setLocalData] = useState<ExamSetupRequest>(examData);
  const intl = useIntl();

  const [openDeleteExam, setOpenDeleteExam] = useState(false);
  const [openDeleteSection, setOpenDeleteSection] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<
    number | string | null
  >(null);
  const [pendingImportExam, setPendingImportExam] =
    useState<ExamSetupRequest | null>(null);
  const [importPreviewOpen, setImportPreviewOpen] = useState(false);

  const onClosePreview = () => {
    setOpenPreview(false);
  };

  useEffect(() => {
    if (examData) {
      setLocalData(examData);
    }
  }, [examData, courseId]);

  const handleChangeName = (section: SectionRequest, e: any) => {
    setLocalData((prev) => {
      return {
        ...prev,
        sectionList: prev.sectionList.map((sec) => {
          if (sec.id === section.id) {
            return {
              ...sec,
              name: e.target.value,
            };
          }
          return sec;
        }),
      };
    });
  };

  const handleChangeImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { exam } = await parseExamFromFile(file);
      setPendingImportExam(exam);
      setImportPreviewOpen(true);
    } catch (error) {
      console.error("Import error:", error);
      setAlert({
        open: true,
        message:
          error instanceof Error
            ? error.message
            : "Lỗi khi import file Excel. Vui lòng kiểm tra lại định dạng file.",
        severity: "error",
      });
    } finally {
      e.target.value = "";
    }
  };

  const handleConfirmImport = () => {
    if (!pendingImportExam) return;

    const importedExam = pendingImportExam;
    const currentSections = [...examData.sectionList];

    importedExam.sectionList.forEach((newSection) => {
      const existingSectionIdx = currentSections.findIndex(
        (s) => s.name === newSection.name,
      );

      if (existingSectionIdx !== -1) {
        currentSections[existingSectionIdx] = {
          ...currentSections[existingSectionIdx],
          questionGroupList: [
            ...(currentSections[existingSectionIdx].questionGroupList || []),
            ...(newSection.questionGroupList || []),
          ],
        };
      } else {
        currentSections.push(newSection);
      }
    });

    const newTotal = currentSections.reduce((acc, sec) => {
      const sectionScore = (sec.questionGroupList || []).reduce((gAcc, gl) => {
        const groupScore = (gl.questionGroup || []).reduce((sgAcc, sg) => {
          return (
            sgAcc +
            (sg.questionList || []).reduce(
              (qAcc, q) => qAcc + (q.score || 0),
              0,
            )
          );
        }, 0);
        return gAcc + groupScore;
      }, 0);
      return acc + sectionScore;
    }, 0);

    const updatedExam = {
      ...examData,
      sectionList: currentSections,
      total: newTotal,
    };

    onUpdate(updatedExam);
    setImportPreviewOpen(false);
    setPendingImportExam(null);
    setAlert({
      open: true,
      message: "Gộp dữ liệu từ Excel thành công!",
      severity: "success",
    });
  };

  const handleAddNewSection = async () => {
    const newSectionTemplate = getNewExamQuestionBank();
    const response = await createSection(
      localData.id ? Number(localData.id) : 0,
      newSectionTemplate,
    );

    if (response.statusCode === HttpStatusCode.Ok) {
      const realId = response.data;
      setLocalData((prev) => {
        return {
          ...prev,
          sectionList: [
            ...prev.sectionList,
            { ...newSectionTemplate, id: realId },
          ],
        };
      });
      fetchExams();
    } else {
      setAlert({
        open: true,
        message: intl.formatMessage({ id: "unknown-error" }),
        severity: "error",
      });
    }
  };

  const handleSave = () => {
    onSave(localData.id ? localData.id : 0, localData);
  };

  const handleDeleteSection = async () => {
    if (selectedSectionId === null) return;
    const response = await deleteSection(selectedSectionId);

    if (response.statusCode === HttpStatusCode.Ok) {
      const updatedSectionList = localData.sectionList.filter(
        (section) => String(section.id) !== String(selectedSectionId),
      );

      const updatedData = {
        ...localData,
        sectionList: updatedSectionList,
      };

      setLocalData(updatedData);
      onUpdate(updatedData);

      setAlert({
        open: true,
        message: "Xóa phần thành công",
        severity: "success",
      });
    } else {
      setAlert({
        open: true,
        message: intl.formatMessage({ id: "unknown-error" }),
        severity: "error",
      });
    }

    setOpenDeleteSection(false);
    setSelectedSectionId(null);
  };

  if (!localData) return null;
  else {
    return (
      <Box p={3} sx={{ borderRadius: 2, border: "1px solid #d9d6d6" }}>
        <Stack direction={"column"} gap={2}>
          <Stack
            direction={"row"}
            justifyContent={"space-between"}
            alignItems={"center"}
          >
            <Typography variant="h5">{localData.name}</Typography>

            <Stack
              gap={1}
              direction={"row"}
              justifyContent={"center"}
              alignItems={"center"}
            >
              <Button
                variant="text"
                size="small"
                startIcon={<SearchNormal />}
                component="label"
                onClick={() => downloadExamTemplate()}
              >
                Download form
              </Button>

              <Divider orientation="vertical" flexItem />

              <Button
                variant="text"
                size="small"
                startIcon={<SearchNormal />}
                component="label"
              >
                Import
                <input
                  type="file"
                  hidden
                  accept=".xlsx, .xls"
                  onChange={handleChangeImport}
                />
              </Button>

              <Divider orientation="vertical" flexItem />

              <Button
                variant="text"
                size="small"
                startIcon={<Trash />}
                onClick={() => setOpenDeleteExam(true)}
              >
                Xoá
              </Button>

              <Divider orientation="vertical" flexItem />

              <Button
                variant="text"
                size="small"
                startIcon={<Edit2 />}
                onClick={() => setOpen(true)}
              >
                Sửa
              </Button>

              <Divider orientation="vertical" flexItem />

              <Button
                variant="text"
                size="small"
                startIcon={<SearchNormal />}
                onClick={() => setOpenPreview(true)}
              >
                Xem mẫu
              </Button>

              <Divider orientation="vertical" flexItem />

              <Button
                variant="text"
                size="small"
                startIcon={<SearchNormal />}
                onClick={() => navigate(`/exams/take/${examData.id}`)}
              >
                Test làm bài (trong bản chính thức không có nút này)
              </Button>

              <Divider orientation="vertical" flexItem />

              <Button
                variant="text"
                size="small"
                startIcon={<SearchNormal />}
                onClick={() =>
                  navigate(`/exams/grade/${examData.id}/student/test-student`)
                }
              >
                Test chấm bài (trong bản chính thức không có nút này)
              </Button>
            </Stack>
          </Stack>

          <Stack
            direction={"row"}
            justifyContent={"start"}
            gap={1}
            alignItems={"center"}
          >
            <Box>
              Tổng số câu:{" "}
              {
                localData.sectionList.flatMap(
                  (section) => section.questionGroupList,
                ).length
              }
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box>
              Thời gian làm bài: {Math.floor(localData.duration / 60)} phút
            </Box>
          </Stack>

          <Divider orientation="horizontal" />

          {localData.sectionList.map(
            (section: SectionRequest, sIndex: number) => {
              return (
                <Accordion
                  disableGutters
                  defaultExpanded={false}
                  key={sIndex}
                  sx={{
                    "&:before": { display: "none" },
                    borderBottom: "1px solid #e0e0e0",
                    "&.Mui-expanded": {
                      borderBottom: "1px solid #e0e0e0",
                    },
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  <AccordionSummary
                    aria-controls="panel1-content"
                    id="panel1-header"
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-around"
                      alignItems="center"
                      sx={{ width: "100%", p: 1 }}
                    >
                      <Typography sx={{ width: "100%" }} variant="h5">
                        {section.name ? section.name : `Phần ${sIndex + 1}:`}
                      </Typography>

                      <Stack
                        direction="row"
                        justifyContent="center"
                        alignItems="center"
                        onClickCapture={(e) => {
                          e.stopPropagation();
                          setSelectedSectionId(section.id);
                          setOpenDeleteSection(true);
                        }}
                        sx={{ color: "red" }}
                      >
                        <Trash />
                      </Stack>
                    </Stack>
                  </AccordionSummary>

                  <AccordionDetails>
                    <Stack direction="column" gap={1}>
                      <InputLabel sx={{ mb: 1, mt: 1 }}>Tên phần:</InputLabel>

                      <TextField
                        sx={{ width: "100%", backgroundColor: "white", mb: 1 }}
                        placeholder="Nhập tên"
                        size="medium"
                        value={section.name}
                        onChange={(e) => {
                          handleChangeName(section, e);
                        }}
                        onBlur={() => handleSave()}
                      />

                      <Stack direction="column">
                        <ExamQuestionBank
                          courseId={courseId}
                          responseData={section}
                          examId={localData.id as number}
                          sectionId={section.id as number}
                          alert={alert}
                          setAlert={setAlert}
                        />
                      </Stack>
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              );
            },
          )}

          <Typography
            sx={{
              width: "15%",
              color: "orangered",
              fontWeight: "semibold",
              cursor: "pointer",
            }}
            onClick={() => {
              handleAddNewSection();
            }}
          >
            Tạo phần
          </Typography>
        </Stack>

        <ExamCreateDialog
          onSave={onSave}
          open={open}
          examData={examData}
          setOpen={setOpen}
        />

        <ConfirmDialog
          open={openDeleteExam}
          onClose={() => setOpenDeleteExam(false)}
          title="Xác nhận xoá bài kiểm tra"
          description="Bạn có chắc chắn muốn xoá bài kiểm tra này? Tất cả các phần và câu hỏi bên trong sẽ bị xoá."
          onConfirm={() => {
            handleDeleteExam(examData);
            setOpenDeleteExam(false);
          }}
        />

        <ConfirmDialog
          open={openDeleteSection}
          onClose={() => setOpenDeleteSection(false)}
          title="Xác nhận xoá phần thi"
          description="Bạn có chắc chắn muốn xoá phần thi này? Tất cả câu hỏi bên trong phần này sẽ bị xoá."
          onConfirm={handleDeleteSection}
        />
        <DetailPreview
          id={Number(examData.id)}
          open={openPreview}
          onClose={onClosePreview}
        />

        {/* Dialog Preview Nội dung từ Excel */}
        {pendingImportExam && (
          <DetailPreview
            open={importPreviewOpen}
            onClose={() => {
              setImportPreviewOpen(false);
              setPendingImportExam(null);
            }}
            examData={pendingImportExam}
            onConfirm={handleConfirmImport}
          />
        )}
      </Box>
    );
  }
}
