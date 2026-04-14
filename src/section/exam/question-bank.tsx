import {
  CSSProperties,
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";

import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import Pagination from "@mui/material/Pagination";
import Typography from "@mui/material/Typography";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  Theme,
} from "@mui/material";
import { FormattedMessage } from "react-intl";

import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  type DragEndEvent,
  type UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { rankItem } from "@tanstack/match-sorter-utils";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedMinMaxValues,
  getFacetedUniqueValues,
  getPaginationRowModel,
  getSortedRowModel,
  getGroupedRowModel,
  getExpandedRowModel,
  flexRender,
  useReactTable,
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  GroupingState,
  Row,
  FilterFn,
  Header,
} from "@tanstack/react-table";

import MainCard from "@/components/MainCard";
import IconButton from "@/components/@extended/IconButton";
import {
  EmptyTable,
  HeaderSort,
  RowEditable,
} from "@/components/third-party/react-table";

import {
  Add,
  ArrowDown2,
  ArrowRight2,
  Command,
  Edit2,
  TableDocument,
  Trash,
} from "iconsax-reactjs";
import { DEFAULT_PAGE_SIZE, PageRequest } from "@/types/paging";
import type { SectionRequest, QuestionGroupListRequest } from "@/types/question";
import { useIntl } from "react-intl";
import useAuth from "@/hooks/useAuth";
import { updateSection } from "@/api/exam";
import { HttpStatusCode } from "axios";
import * as XLSX from "xlsx";
import { parseExcelImport } from "@/utils/excelUtils";
import { MATERIAL_TYPE, QUESTION_TYPE } from "@/types/question";

const fuzzyFilter: FilterFn<QuestionGroupListRequest> = (
  row,
  columnId,
  value,
  addMeta
) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta(itemRank);
  return itemRank.passed;
};

function ActionCell({
  row,
  examId,
  sectionId,
  courseId,
  setOpenDelete,
  setSelectedQuestion,
}: {
  row: Row<QuestionGroupListRequest>;
  examId: number;
  sectionId: number;
  courseId: number;
  setOpenDelete: (open: boolean) => void;
  setSelectedQuestion: (question: QuestionGroupListRequest) => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Stack direction="row" sx={{ gap: 1, alignItems: "center" }}>
      <Tooltip title="Sửa">
        <IconButton
          color="primary"
          onClick={(e) => {
            e.stopPropagation();
            navigate(
              `/exams/edit/${examId}/section/${sectionId}/edit`,
              {
                state: {
                  aId: row.original.id,
                  group: row.original,
                  returnPath: location.pathname,
                  tabValue: "2",
                },
              }
            );
          }}
        >
          <Edit2 />
        </IconButton>
      </Tooltip>

      <Tooltip title="Xóa">
        <IconButton
          color="error"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedQuestion(row.original);
            setOpenDelete(true);
          }}
        >
          <Trash variant="Outline" />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}

const nonOrderableColumnId: UniqueIdentifier[] = [
  "drag-handle",
  "expander",
  "select",
];

function DraggableTableHeader({ header }: { header: Header<any, unknown> }) {
  const { attributes, isDragging, listeners, setNodeRef, transform } =
    useSortable({
      id: header.column.id,
    });

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    position: "relative",
    transform: CSS.Translate.toString(transform),
    transition: "width transform 0.2s ease-in-out",
    whiteSpace: "nowrap",
    width: header.column.getSize(),
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <TableCell colSpan={header.colSpan} ref={setNodeRef} style={style}>
      {header.isPlaceholder ? null : (
        <Stack
          direction="row"
          sx={{ gap: 1, alignItems: "center", justifyContent: "space-between" }}
        >
          {header.column.getCanGroup() && (
            <IconButton
              color={header.column.getIsGrouped() ? "error" : "primary"}
              onClick={header.column.getToggleGroupingHandler()}
              size="small"
              sx={{ p: 0, width: 24, height: 24, fontSize: "1rem", mr: 0.75 }}
            >
              {header.column.getIsGrouped() ? (
                <Command size="32" color="#FF8A65" variant="Bold" />
              ) : (
                <TableDocument size="32" variant="Outline" />
              )}
            </IconButton>
          )}

          <Box
            {...(!nonOrderableColumnId.includes(header.id) && {
              ...attributes,
              ...listeners,
              sx: { cursor: "move" },
            })}
          >
            {flexRender(header.column.columnDef.header, header.getContext())}
          </Box>

          {header.column.getCanSort() && (
            <HeaderSort column={header.column} sort />
          )}
        </Stack>
      )}
    </TableCell>
  );
}

function DraggableRow({ row }: { row: Row<any> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1 : 0,
    position: "relative",
  };

  return (
    <TableRow ref={setNodeRef} style={style}>
      {row.getVisibleCells().map((cell) => {
        let bgcolor = "background.paper";

        if (cell.getIsGrouped()) bgcolor = "primary.lighter";
        if (cell.getIsAggregated()) bgcolor = "warning.lighter";
        if (cell.getIsPlaceholder()) bgcolor = "error.lighter";

        if (
          cell.column.columnDef.meta !== undefined &&
          cell.column.getCanSort()
        ) {
          Object.assign(cell.column.columnDef.meta, {
            style: { background: bgcolor },
          });
        }

        return (
          <TableCell
            key={cell.id}
            {...cell.column.columnDef.meta}
            {...(cell.getIsGrouped() &&
              cell.column.columnDef.meta === undefined && {
                style: { background: bgcolor },
              })}
            sx={{
              width:
                cell.column.columnDef.meta &&
                "width" in cell.column.columnDef.meta
                  ? (cell.column.columnDef.meta as { width?: string | number })
                      .width
                  : undefined,
              justifyContent: cell.column.id === "action" ? "center" : "left",
              verticalAlign: "middle",
            }}
          >
            {cell.getIsGrouped() ? (
              <Stack direction="row" sx={{ gap: 0.5, alignItems: "center" }}>
                <IconButton
                  color="secondary"
                  onClick={row.getToggleExpandedHandler()}
                  size="small"
                  sx={{ p: 0, width: 24, height: 24 }}
                >
                  {row.getIsExpanded() ? (
                    <ArrowDown2 size="32" variant="Outline" />
                  ) : (
                    <ArrowRight2 size="32" variant="Outline" />
                  )}
                </IconButton>
                <Box>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </Box>{" "}
                <Box>({row.subRows.length})</Box>
              </Stack>
            ) : cell.getIsAggregated() ? (
              flexRender(
                cell.column.columnDef.aggregatedCell ??
                  cell.column.columnDef.cell,
                cell.getContext()
              )
            ) : cell.getIsPlaceholder() ? null : (
              flexRender(cell.column.columnDef.cell, cell.getContext())
            )}
          </TableCell>
        );
      })}
    </TableRow>
  );
}

interface QuestionBankProps {
  courseId: number;
  responseData: SectionRequest;
  examId: number;
  sectionId: number;
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

export default function ExamQuestionBank({
  courseId,
  responseData,
  examId,
  sectionId,
  alert,
  setAlert,
}: QuestionBankProps) {
  const intl = useIntl();
  const navigate = useNavigate();
  const location = useLocation();

  const [data, setData] = useState<SectionRequest>(responseData);

  const handleDeleteQuestion = useCallback(
    async (id: string) => {
      const newList = (data.questionGroupList ?? []).filter(
        (group) => group.id !== id
      );
      const updatedData: SectionRequest = {
        ...data,
        questionGroupList: newList,
      };

      const response = await updateSection(sectionId, updatedData);

      if (response.statusCode === HttpStatusCode.Ok) {
        setAlert({
          open: true,
          message: "Xóa câu hỏi thành công",
          severity: "success",
        });
        setData(updatedData);
      } else {
        setAlert({
          open: true,
          message: intl.formatMessage({ id: "unknown-error" }),
          severity: "error",
        });
      }
    },
    [data, intl, sectionId, setAlert]
  );

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataArray = new Uint8Array(event.target?.result as ArrayBuffer);
      const workbook = XLSX.read(dataArray, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const parsedGroups = parseExcelImport(jsonData, (data.questionGroupList ?? []).length);
      
      const mapMediaType = (type: string): MATERIAL_TYPE => {
        switch (type.toLowerCase()) {
          case 'image': return MATERIAL_TYPE.IMAGE;
          case 'audio': return MATERIAL_TYPE.AUDIO;
          case 'video': return MATERIAL_TYPE.VIDEO;
          default: return MATERIAL_TYPE.TEXT;
        }
      };

      const mapQuestionType = (type: string): QUESTION_TYPE => {
        switch (type.toLowerCase()) {
          case 'fill-blank': return QUESTION_TYPE.FILL;
          case 'essay': return QUESTION_TYPE.ESSAY;
          default: return QUESTION_TYPE.MCQ;
        }
      };

      const newGroups: QuestionGroupListRequest[] = parsedGroups.map((g, idx) => ({
        id: `gl-${Date.now()}-${idx}`,
        serialNumber: (data.questionGroupList ?? []).length + idx + 1,
        totalPlayed: 0,
        title: g.contentItems.map(item => ({
          id: item.id,
          type: mapMediaType(item.type),
          source: item.value
        })),
        questionGroup: [{
          id: `g-${g.id}`,
          serialNumber: 1,
          totalPlayed: 0,
          content: [],
          questionList: g.questions.map((q, qIdx) => ({
            id: q.id,
            serialNumber: qIdx + 1,
            type: mapQuestionType(q.type),
            content: q.questionItems.map(qi => ({
              id: qi.id,
              type: mapMediaType(qi.type),
              source: qi.value
            })),
            totalPlayed: 0,
            score: 1,
            isNote: false,
            isMultipleChoice: q.type === 'mcq',
            inputType: q.allowedAnswerTypes?.map(t => mapMediaType(t)) || [MATERIAL_TYPE.TEXT],
            explanation: q.explanation,
            answerList: q.options.map(opt => ({
              id: opt.id,
              content: [{
                id: `c-${opt.id}`,
                type: mapMediaType(opt.type),
                source: opt.value
              }],
              isCorrect: opt.id === q.correctOptionId ? 1 : 0
            })),
            review: ""
          }))
        }]
      }));

      const updatedData = {
        ...data,
        questionGroupList: [...(data.questionGroupList ?? []), ...newGroups]
      };

      const response = await updateSection(sectionId, updatedData);
      if (response.statusCode === HttpStatusCode.Ok) {
        setAlert({
          open: true,
          message: "Import bài tập thành công",
          severity: "success",
        });
        setData(updatedData);
      } else {
        setAlert({
          open: true,
          message: "Lỗi khi import bài tập",
          severity: "error",
        });
      }
    };
    reader.readAsArrayBuffer(file);
    // Reset input
    e.target.value = '';
  };

  const handleFormatGroups = async () => {
    const updated = (data.questionGroupList ?? []).map((group, index) => ({
      ...group,
      serialNumber: index + 1,
    }));

    const updatedData = {
      ...data,
      questionGroupList: updated,
    };

    const response = await updateSection(sectionId, updatedData);

    if (response.statusCode === HttpStatusCode.Ok) {
      setAlert({
        open: true,
        message: "Format STT thành công",
        severity: "success",
      });
      setData(updatedData);
    } else {
      setAlert({
        open: true,
        message: intl.formatMessage({ id: "unknown-error" }),
        severity: "error",
      });
    }
  };

  const handleReorder = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        setData((old: SectionRequest) => {
          const oldList = old.questionGroupList ?? [];
          const activeIndex = oldList.findIndex((q) => q.id === active.id);
          const overIndex = oldList.findIndex((q) => q.id === over.id);

          const newList = arrayMove(oldList, activeIndex, overIndex).map(
            (row: QuestionGroupListRequest, index) => ({
              ...row,
              serialNumber: index + 1,
            })
          );

          const updatedData = { ...old, questionGroupList: newList };

          updateSection(sectionId, updatedData).then((response) => {
            if (response.statusCode === HttpStatusCode.Ok) {
              setAlert({
                open: true,
                message: "Cập nhật thứ tự thành công",
                severity: "success",
              });
            }
          });

          return updatedData;
        });
      }
    },
    [sectionId, setAlert]
  );

  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const [selectedQuestion, setSelectedQuestion] =
    useState<QuestionGroupListRequest | null>(null);

  const onConfirmDialog = (qId: string | null) => {
    if (qId === null) return;
    setOpenDelete(false);
    handleDeleteQuestion(qId);
  };

  const columns = useMemo<ColumnDef<QuestionGroupListRequest>[]>(
    () => [
      {
        id: "id",
        title: "Id",
        header: "#",
        accessorKey: "id",
        dataType: "text",
        enableColumnFilter: false,
        enableGrouping: false,
        meta: { className: "cell-center" },
      },
      {
        id: "question-content",
        header: "Số câu",
        accessorKey: "serialNumber",
        cell: (cell) => {
          const { serialNumber } = cell.row.original;
          return <Typography>{serialNumber}</Typography>;
        },
        dataType: "text",
        enableGrouping: false,
      },
      {
        header: intl.formatMessage({ id: "action" }),
        id: "action",
        meta: { className: "cell-center", width: "10%" },
        cell: ({ row }: { row: Row<QuestionGroupListRequest> }) => (
          <ActionCell
            row={row}
            examId={examId}
            sectionId={sectionId}
            courseId={courseId}
            setOpenDelete={setOpenDelete}
            setSelectedQuestion={setSelectedQuestion}
          />
        ),
        enableGrouping: false,
      },
    ],
    [intl, sectionId, courseId]
  );

  const [pageRequest, setPageRequest] = useState<PageRequest>({
    page: 0,
    size: DEFAULT_PAGE_SIZE,
  });

  const pagedData = useMemo(() => {
    const start =
      (pageRequest.page ?? 0) * Number(pageRequest.size ?? DEFAULT_PAGE_SIZE);
    return (data.questionGroupList ?? []).slice(
      start,
      start + Number(pageRequest.size ?? DEFAULT_PAGE_SIZE)
    );
  }, [data.questionGroupList, pageRequest]);

  const totalElements = (data.questionGroupList ?? []).length;
  const totalPages = Math.ceil(
    totalElements / Number(pageRequest.size ?? DEFAULT_PAGE_SIZE)
  );

  const filteredData = useMemo(
    () => data.questionGroupList ?? [],
    [data.questionGroupList]
  );
  const [columnOrder, setColumnOrder] = useState<string[]>(() =>
    columns.map((c) => c.id!)
  );

  const [rowSelection, setRowSelection] = useState({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [grouping, setGrouping] = useState<GroupingState>([]);

  const [columnVisibility, setColumnVisibility] = useState({});
  const [selectedRow, setSelectedRow] = useState({});
  const dataIds = useMemo<UniqueIdentifier[]>(
    () => filteredData.map((q) => q.id as UniqueIdentifier),
    [filteredData]
  );

  const handleChangePageSize = (event: SelectChangeEvent<number>) => {
    setPageRequest((prev) => ({ ...prev, size: Number(event.target.value) }));
  };

  useEffect(() => {
    setData(responseData);
  }, [responseData]);

  useEffect(() => {
    if (location.state?.alert) {
      setAlert(location.state.alert);
      window.history.replaceState({}, document.title);
    }
  }, [location.state, setAlert]);

  const table = useReactTable<QuestionGroupListRequest>({
    data: pagedData,
    columns,
    manualPagination: true,
    defaultColumn: { cell: RowEditable },
    getRowId: (row: QuestionGroupListRequest) => (row.id ?? "").toString(),
    state: {
      rowSelection,
      columnFilters,
      sorting,
      grouping,
      columnOrder,
      columnVisibility,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onGroupingChange: setGrouping,
    onColumnFiltersChange: setColumnFilters,
    onColumnOrderChange: setColumnOrder,
    onColumnVisibilityChange: setColumnVisibility,
    getRowCanExpand: () => true,
    getExpandedRowModel: getExpandedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    globalFilterFn: fuzzyFilter,
    meta: {
      selectedRow,
      setSelectedRow,
      updateData: (rowIndex: number, columnId: string, value: any) => {
        setData((old: SectionRequest) => {
          const newList = old.questionGroupList.map((row, index) => {
            if (index === rowIndex) {
              return { ...row, [columnId]: value };
            }
            return row;
          });
          return { ...old, questionGroupList: newList };
        });
      },
    },
  });

  const columnSensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  function handleColumnDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active && over && active.id !== over.id) {
      if (nonOrderableColumnId.includes(over.id)) return;

      setColumnOrder((columnOrder) => {
        const oldIndex = columnOrder.indexOf(active.id as string);
        const newIndex = columnOrder.indexOf(over.id as string);
        return arrayMove(columnOrder, oldIndex, newIndex);
      });
    }
  }

  useEffect(
    () =>
      setColumnVisibility({
        id: false,
        role: false,
        contact: false,
        country: false,
        progress: false,
      }),
    []
  );

  return (
    <Stack sx={{ p: 0 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        sx={(theme: Theme) => ({
          gap: 2,
          justifyContent: "space-between",
          pb: 3,
          [theme.breakpoints.down("sm")]: {
            "& .MuiOutlinedInput-root, & .MuiFormControl-root": { width: 1 },
          },
        })}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          sx={{ width: "100%" }}
        >
          <Stack>
            <Typography variant="h5" gutterBottom>
              <FormattedMessage id="question-bank-list" />
            </Typography>
          </Stack>

          <Stack gap={1} direction="row" justifyContent="flex-end">
            <Button
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "orangered",
              }}
              size="medium"
              onClick={() =>
                navigate(
                  `/exams/edit/${examId}/section/${sectionId}/add`,
                  {
                    state: {
                      sectionId: sectionId,
                      returnPath: location.pathname,
                      tabValue: "2",
                      index:
                        (data.questionGroupList ?? []).length !== 0
                          ? data.questionGroupList[
                              data.questionGroupList.length - 1
                            ].serialNumber + 1
                          : 1,
                    },
                  }
                )
              }
            >
              <Add />
              <FormattedMessage id="add-question-bank" />
            </Button>

            <Divider orientation="vertical" flexItem />

            <Button
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "orangered",
              }}
              size="medium"
              onClick={handleFormatGroups}
            >
              Format STT
            </Button>

            <Divider orientation="vertical" flexItem />

            <Button
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "orangered",
              }}
              size="medium"
              component="label"
            >
              Import
              <input
                hidden
                type="file"
                accept=".xlsx, .xls"
                onChange={handleImportExcel}
              />
            </Button>
          </Stack>
        </Stack>
      </Stack>

      <MainCard content={false}>
        <DndContext
          sensors={columnSensors}
          collisionDetection={closestCenter}
          onDragEnd={handleColumnDragEnd}
          modifiers={[restrictToHorizontalAxis]}
        >
          <TableContainer>
            <Table>
              <TableHead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    <SortableContext
                      items={columnOrder}
                      strategy={horizontalListSortingStrategy}
                    >
                      {headerGroup.headers.map((header) => (
                        <DraggableTableHeader key={header.id} header={header} />
                      ))}
                    </SortableContext>
                  </TableRow>
                ))}
              </TableHead>

              <TableBody>
                <DndContext
                  sensors={columnSensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleReorder}
                  modifiers={[restrictToHorizontalAxis]}
                >
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.length > 0 ? (
                      table.getRowModel().rows.map((row) => (
                        <Fragment key={row.id}>
                          <DraggableRow row={row} />
                        </Fragment>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={columns.length}>
                          <EmptyTable msg="Không có câu hỏi nào" />
                        </TableCell>
                      </TableRow>
                    )}
                  </SortableContext>
                </DndContext>
              </TableBody>
            </Table>
          </TableContainer>
        </DndContext>

        <Divider />

        <Box sx={{ p: 2 }}>
          <Grid
            container
            sx={{ alignItems: "center", justifyContent: "space-between" }}
          >
            <Grid>
              <Stack direction="row" sx={{ gap: 1, alignItems: "center" }}>
                <Typography variant="caption" color="secondary">
                  Số hàng mỗi trang
                </Typography>

                <FormControl sx={{ m: 1 }}>
                  <Select
                    value={pageRequest.size}
                    onChange={handleChangePageSize}
                    size="small"
                  >
                    {[10, 25, 50, 100].map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </Grid>

            <Grid>
              <Pagination
                count={totalPages}
                page={(pageRequest.page ?? 0) + 1}
                onChange={(_, value) =>
                  setPageRequest((prev) => ({ ...prev, page: value - 1 }))
                }
                color="primary"
                variant="outlined"
                showFirstButton
                showLastButton
              />
            </Grid>
          </Grid>
        </Box>
      </MainCard>

      <Dialog
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        disableEscapeKeyDown
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Xác nhận xoá câu hỏi</DialogTitle>

        <DialogContent>
          <Typography>Bạn có chắc chắn muốn xoá câu hỏi không?</Typography>
        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button
            variant="outlined"
            sx={{ borderColor: "orangered", color: "orangered" }}
            color="inherit"
            onClick={(e) => {
              e.stopPropagation();
              setOpenDelete(false);
            }}
          >
            Huỷ
          </Button>

          <Button
            variant="contained"
            sx={{
              backgroundColor: "orangered",
              "&:hover": { backgroundColor: "#e64a19" },
            }}
            onClick={(e) => {
              e.stopPropagation();
              onConfirmDialog(selectedQuestion ? selectedQuestion.id : null);
            }}
          >
            Xoá
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

