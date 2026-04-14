import * as XLSX from 'xlsx';
import { Quiz, Part, MediaType, MediaItem, SubQuestion, Option, QuestionType, QuestionGroup } from '../types';

export const downloadPartsTemplate = () => {
  const templateData = [
    {
      'STT': 1,
      'Tên Part': 'Part 1: Listening Comprehension',
      'Mô tả Part': 'Thí sinh nghe các đoạn hội thoại và trả lời câu hỏi.',
      'Tên bài tập': 'Bài tập 1: Short Conversations',
      'Loại tiêu đề': 'audio',
      'Dữ liệu tiêu đề': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      'Nhóm câu hỏi': 'Nhóm 1',
      'Loại nội dung': 'text',
      'Dữ liệu nội dung': 'Listen to the conversation and choose the best answer.',
      'Tiêu đề câu hỏi': '1',
      'Dẫn nhập': 'Choose the correct answer',
      'Loại câu hỏi': 'Trắc nghiệm',
      'Loại nội dung câu hỏi': 'text',
      'Nội dung câu hỏi': 'Where are the speakers?',
      'Loại phương án': 'text',
      'Phương án 1': 'At the office',
      'Mô tả 1': 'Office location',
      'Phương án 2': 'At the park',
      'Mô tả 2': 'Park location',
      'Phương án 3': 'At a restaurant',
      'Mô tả 3': 'Restaurant location',
      'Phương án 4': 'At the airport',
      'Mô tả 4': 'Airport location',
      'Đáp án': '3',
      'Giải thích': 'The speakers mention ordering food and a menu.',
      'Loại đáp án cho phép': ''
    },
    {
      'STT': 1,
      'Tên Part': 'Part 1: Listening Comprehension',
      'Mô tả Part': 'Thí sinh nghe các đoạn hội thoại và trả lời câu hỏi.',
      'Tên bài tập': 'Bài tập 1: Short Conversations',
      'Loại tiêu đề': 'audio',
      'Dữ liệu tiêu đề': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      'Nhóm câu hỏi': 'Nhóm 1',
      'Loại nội dung': 'text',
      'Dữ liệu nội dung': 'Listen to the conversation and choose the best answer.',
      'Tiêu đề câu hỏi': '2',
      'Dẫn nhập': 'Choose the correct answer',
      'Loại câu hỏi': 'Trắc nghiệm',
      'Loại nội dung câu hỏi': 'text',
      'Nội dung câu hỏi': 'What are they talking about?',
      'Loại phương án': 'text',
      'Phương án 1': 'A new job',
      'Mô tả 1': '',
      'Phương án 2': 'A vacation',
      'Mô tả 2': '',
      'Phương án 3': 'A lunch order',
      'Mô tả 3': '',
      'Phương án 4': 'A flight schedule',
      'Mô tả 4': '',
      'Đáp án': '3',
      'Giải thích': 'They are discussing the menu.',
      'Loại đáp án cho phép': ''
    },
    {
      'STT': 1,
      'Tên Part': 'Part 1: Listening Comprehension',
      'Mô tả Part': 'Thí sinh nghe các đoạn hội thoại và trả lời câu hỏi.',
      'Tên bài tập': 'Bài tập 1: Short Conversations',
      'Loại tiêu đề': 'audio',
      'Dữ liệu tiêu đề': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      'Nhóm câu hỏi': 'Nhóm 2',
      'Loại nội dung': 'text',
      'Dữ liệu nội dung': 'Listen to the second conversation.',
      'Tiêu đề câu hỏi': '3',
      'Dẫn nhập': '',
      'Loại câu hỏi': 'Tự luận',
      'Loại nội dung câu hỏi': 'text|image',
      'Nội dung câu hỏi': 'Write a summary of the conversation.|https://picsum.photos/200',
      'Loại phương án': '',
      'Phương án 1': '',
      'Mô tả 1': '',
      'Phương án 2': '',
      'Mô tả 2': '',
      'Phương án 3': '',
      'Mô tả 3': '',
      'Phương án 4': '',
      'Mô tả 4': '',
      'Đáp án': 'The conversation is about...',
      'Giải thích': 'Key points: food, menu, restaurant.',
      'Loại đáp án cho phép': 'text,image'
    }
  ];

  const ws = XLSX.utils.json_to_sheet(templateData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template Parts");
  XLSX.writeFile(wb, "mau_import_hang_loat_part.xlsx");
};

export const downloadBulkTemplate = () => {
  const templateData = [
    {
      'STT': 1,
      'Tên bài tập': 'Bài tập 1: Nghe và chọn',
      'Nhóm câu hỏi': 'Nhóm 1',
      'Loại tiêu đề': 'audio',
      'Dữ liệu tiêu đề': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      'Loại nội dung': 'text',
      'Dữ liệu nội dung': 'Hãy nghe đoạn hội thoại sau và trả lời câu hỏi.',
      'Tiêu đề câu hỏi': '1',
      'Dẫn nhập': 'Chọn đáp án đúng nhất',
      'Loại câu hỏi': 'Trắc nghiệm',
      'Loại nội dung câu hỏi': 'text',
      'Nội dung câu hỏi': 'Người đàn ông muốn đi đâu?',
      'Loại phương án': 'text',
      'Phương án 1': 'Đáp án đúng',
      'Mô tả 1': 'Giải thích ngắn',
      'Phương án 2': 'Đáp án sai 1',
      'Mô tả 2': '',
      'Phương án 3': 'Đáp án sai 2',
      'Mô tả 3': '',
      'Phương án 4': 'Đáp án sai 3',
      'Mô tả 4': '',
      'Đáp án': '1',
      'Giải thích': 'Giải thích cho câu 1',
      'Loại đáp án cho phép': ''
    },
    {
      'STT': 1,
      'Tên bài tập': 'Bài tập 1: Nghe và chọn',
      'Nhóm câu hỏi': 'Nhóm 2',
      'Loại tiêu đề': 'audio',
      'Dữ liệu tiêu đề': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      'Loại nội dung': 'text',
      'Dữ liệu nội dung': 'Nội dung cho nhóm 2.',
      'Tiêu đề câu hỏi': '2',
      'Dẫn nhập': '',
      'Loại câu hỏi': 'Trắc nghiệm',
      'Loại nội dung câu hỏi': 'text',
      'Nội dung câu hỏi': 'Câu hỏi cho nhóm 2?',
      'Loại phương án': 'text',
      'Phương án 1': 'A',
      'Mô tả 1': '',
      'Phương án 2': 'B',
      'Mô tả 2': '',
      'Phương án 3': 'C',
      'Mô tả 3': '',
      'Phương án 4': 'D',
      'Mô tả 4': '',
      'Đáp án': '2',
      'Giải thích': 'Giải thích cho câu 2',
      'Loại đáp án cho phép': ''
    }
  ];

  const ws = XLSX.utils.json_to_sheet(templateData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template");
  XLSX.writeFile(wb, "mau_import_nhieu_bai_tap.xlsx");
};

export const downloadTemplate = () => {
  const templateData = [
    {
      'Nhóm câu hỏi': 'Nhóm 1',
      'Loại nội dung': 'text',
      'Dữ liệu nội dung': 'Nội dung cho nhóm 1',
      'Tiêu đề': '1',
      'Dẫn nhập': 'Chọn đáp án đúng',
      'Loại': 'Trắc nghiệm',
      'Loại nội dung câu hỏi': 'text',
      'Nội dung câu hỏi': 'Nội dung câu hỏi ở đây',
      'Phương án 1': 'Đáp án 1',
      'Mô tả 1': '',
      'Phương án 2': 'Đáp án 2',
      'Mô tả 2': '',
      'Phương án 3': 'Đáp án 3',
      'Mô tả 3': '',
      'Phương án 4': 'Đáp án 4',
      'Mô tả 4': '',
      'Đáp án': '1',
      'Giải thích': 'Giải thích cho câu 1',
      'Loại đáp án cho phép': ''
    },
    {
      'Nhóm câu hỏi': 'Nhóm 2',
      'Loại nội dung': 'text',
      'Dữ liệu nội dung': 'Nội dung cho nhóm 2',
      'Tiêu đề': '2',
      'Dẫn nhập': 'Chọn đáp án đúng',
      'Loại': 'Trắc nghiệm',
      'Loại nội dung câu hỏi': 'text',
      'Nội dung câu hỏi': 'Nội dung câu hỏi cho nhóm 2',
      'Phương án 1': 'A',
      'Mô tả 1': '',
      'Phương án 2': 'B',
      'Mô tả 2': '',
      'Phương án 3': 'C',
      'Mô tả 3': '',
      'Phương án 4': 'D',
      'Mô tả 4': '',
      'Đáp án': '2',
      'Giải thích': 'Giải thích cho câu 2',
      'Loại đáp án cho phép': ''
    }
  ];

  const ws = XLSX.utils.json_to_sheet(templateData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template");
  XLSX.writeFile(wb, "template_import_cau_hoi.xlsx");
};

const parseQuestionType = (typeStr: string): QuestionType => {
  const s = (typeStr || '').toString().toLowerCase();
  if (s.includes('điền')) return 'fill-blank';
  if (s.includes('luận') || s.includes('essay')) return 'essay';
  if (s.includes('dữ liệu') || s.includes('data')) return 'data';
  return 'mcq';
};

const toRichText = (text: string): string => {
  if (!text) return '';
  const trimmed = text.toString().trim();
  // If it's already JSON, return it
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      JSON.parse(trimmed);
      return trimmed;
    } catch (e) {
      // Not valid JSON, continue to wrap
    }
  }

  const paragraphs = trimmed.split('\n').filter(p => p.trim() !== '');
  const doc = {
    type: 'doc',
    content: paragraphs.length > 0 ? paragraphs.map(p => ({
      type: 'paragraph',
      content: [{ type: 'text', text: p }]
    })) : [{
      type: 'paragraph',
      content: [{ type: 'text', text: '' }]
    }]
  };
  
  return JSON.stringify(doc);
};

const parseMediaItems = (typesStr: string, valuesStr: string, baseId: string): MediaItem[] => {
  const validMediaTypes: MediaType[] = ['text', 'audio', 'video', 'image'];
  const types = (typesStr || 'text').toString().split('|').map(t => t.trim().toLowerCase());
  const values = (valuesStr || '').toString().split('|').map(v => v.trim());
  
  return types.map((t, idx) => {
    const type = validMediaTypes.includes(t as MediaType) ? (t as MediaType) : 'text';
    let value = values[idx] || '';
    if (type === 'text') {
      value = toRichText(value);
    }
    return {
      id: `${baseId}-${idx}`,
      type,
      value
    };
  });
};

export const parseBulkImport = (data: any[], currentPartId: string | null): Quiz[] => {
  const quizGroups: { [key: string]: any[] } = {};
  data.forEach((row: any) => {
    const quizName = (row['Tên bài tập'] || 'Bài tập không tiêu đề').toString();
    if (!quizGroups[quizName]) quizGroups[quizName] = [];
    quizGroups[quizName].push(row);
  });

  const now = Date.now();
  return Object.entries(quizGroups).map(([quizName, rows], qIdx) => {
    const firstRow = rows[0];
    const quizId = (now + qIdx).toString();
    const order = parseInt(firstRow['STT'] || firstRow['Thứ tự'] || (qIdx + 1).toString());

    const headerItems = parseMediaItems(firstRow['Loại tiêu đề'], firstRow['Dữ liệu tiêu đề'] || quizName, `h-${quizId}`);
    
    // Group rows by Nhóm câu hỏi within this quiz
    const groupMap: { [key: string]: any[] } = {};
    const groupOrder: string[] = [];
    
    rows.forEach((row: any) => {
      const groupName = (row['Nhóm câu hỏi'] || row['Dữ liệu nội dung'] || 'Default Group').toString();
      if (!groupMap[groupName]) {
        groupMap[groupName] = [];
        groupOrder.push(groupName);
      }
      groupMap[groupName].push(row);
    });

    const questionGroups: QuestionGroup[] = groupOrder.map((groupName, gIdx) => {
      const gRows = groupMap[groupName];
      const firstGRow = gRows[0];
      const contentItems = parseMediaItems(firstGRow['Loại nội dung'], firstGRow['Dữ liệu nội dung'] || 'Nội dung bài tập', `c-${quizId}-${gIdx}`);
      
      const questions: SubQuestion[] = gRows.map((row, rIdx) => {
        const qId = (now + qIdx + gIdx * 100 + rIdx + 1000).toString();
        const type = parseQuestionType(row['Loại câu hỏi'] || row['Loại']);
        
        let options: Option[] = [];
        let correctOptionId: string | undefined = undefined;

        if (type === 'mcq') {
          const labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
          const numericLabels = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
          const optTypeRaw = (row['Loại phương án'] || 'text').toString().toLowerCase();
          const validMediaTypes: MediaType[] = ['text', 'audio', 'video', 'image'];
          const optType = validMediaTypes.includes(optTypeRaw as MediaType) ? (optTypeRaw as MediaType) : 'text';

          numericLabels.forEach((num, lIdx) => {
            const val = row[`Phương án ${num}`] || row[num] || '';
            const desc = row[`Mô tả ${num}`] || '';
            if (val.toString().trim() !== '') {
              options.push({
                id: `o-num-${lIdx + 1}-${qId}`,
                label: '',
                type: optType,
                value: optType === 'text' ? toRichText(val.toString()) : val.toString(),
                description: toRichText(desc.toString())
              });
            }
          });

          if (options.length === 0) {
            labels.forEach((label, lIdx) => {
              const val = row[`Phương án ${label}`] || row[label] || '';
              const desc = row[`Mô tả ${label}`] || '';
              if (val.toString().trim() !== '') {
                options.push({
                  id: `o${lIdx + 1}-${qId}`,
                  label: '',
                  type: optType,
                  value: optType === 'text' ? toRichText(val.toString()) : val.toString(),
                  description: toRichText(desc.toString())
                });
              }
            });
          }

          const correctValue = (row['Đáp án'] || '1').toString().toUpperCase();
          const numIdx = parseInt(correctValue) - 1;
          if (!isNaN(numIdx) && options[numIdx]) {
            correctOptionId = options[numIdx].id;
          } else {
            const labelIndex = labels.indexOf(correctValue);
            correctOptionId = options[labelIndex]?.id || options[0]?.id;
          }
        }

        const allowedAnswerTypesRaw = (row['Loại đáp án cho phép'] || '').toString();
        const allowedAnswerTypes = allowedAnswerTypesRaw ? allowedAnswerTypesRaw.split(',').map(t => t.trim().toLowerCase() as MediaType) : undefined;

        return {
          id: qId,
          label: row['Tiêu đề câu hỏi'] || row['Tiêu đề'] || `Câu ${rIdx + 1}`,
          type,
          questionItems: parseMediaItems(row['Loại nội dung câu hỏi'], row['Nội dung câu hỏi'] || row['Nội dung'] || row['Câu hỏi'] || '', `qi-${qId}`),
          prompt: toRichText((row['Dẫn nhập'] || '').toString()),
          options,
          correctOptionId,
          answer: (type === 'fill-blank' || type === 'essay') ? (row['Đáp án'] || '').toString() : '',
          explanation: toRichText((row['Giải thích'] || '').toString()),
          allowedAnswerTypes
        };
      });

      return {
        id: `g-${quizId}-${gIdx}`,
        contentItems: contentItems.length > 0 ? contentItems : [{ id: `c-${quizId}-${gIdx}-0`, type: 'text', value: 'Nội dung bài tập' }],
        questions
      };
    });

    return {
      id: quizId,
      title: toRichText(quizName),
      order,
      headerItems: headerItems.length > 0 ? headerItems : [{ id: `h-${quizId}-0`, type: 'text', value: toRichText(quizName) }],
      questionGroups,
      createdAt: now,
      updatedAt: now,
      partId: currentPartId || undefined
    };
  });
};

export const parsePartsImport = (data: any[]): { parts: Part[], quizzes: Quiz[] } => {
  const partGroups: { [key: string]: any[] } = {};
  data.forEach((row: any) => {
    const partName = (row['Tên Part'] || 'Part không tiêu đề').toString();
    if (!partGroups[partName]) partGroups[partName] = [];
    partGroups[partName].push(row);
  });

  const newParts: Part[] = [];
  const newQuizzes: Quiz[] = [];
  const now = Date.now();

  Object.entries(partGroups).forEach(([partName, partRows], pIdx) => {
    const partId = (now + pIdx).toString();
    const firstPartRow = partRows[0];
    
    newParts.push({
      id: partId,
      title: toRichText(partName),
      description: toRichText((firstPartRow['Mô tả Part'] || '').toString()),
      createdAt: now,
      updatedAt: now
    });

    const quizGroups: { [key: string]: any[] } = {};
    partRows.forEach((row: any) => {
      const quizName = (row['Tên bài tập'] || 'Bài tập không tiêu đề').toString();
      if (!quizGroups[quizName]) quizGroups[quizName] = [];
      quizGroups[quizName].push(row);
    });

    Object.entries(quizGroups).forEach(([quizName, quizRows], qIdx) => {
      const quizId = (now + pIdx + qIdx + 1000).toString();
      const firstQuizRow = quizRows[0];

      const headerItems = parseMediaItems(firstQuizRow['Loại tiêu đề'], firstQuizRow['Dữ liệu tiêu đề'] || quizName, `h-${quizId}`);
      
      // Group rows by Nhóm câu hỏi within this quiz
      const groupMap: { [key: string]: any[] } = {};
      const groupOrder: string[] = [];
      
      quizRows.forEach((row: any) => {
        const groupName = (row['Nhóm câu hỏi'] || row['Dữ liệu nội dung'] || 'Default Group').toString();
        if (!groupMap[groupName]) {
          groupMap[groupName] = [];
          groupOrder.push(groupName);
        }
        groupMap[groupName].push(row);
      });

      const questionGroups: QuestionGroup[] = groupOrder.map((groupName, gIdx) => {
        const gRows = groupMap[groupName];
        const firstGRow = gRows[0];
        const contentItems = parseMediaItems(firstGRow['Loại nội dung'], firstGRow['Dữ liệu nội dung'] || 'Nội dung bài tập', `c-${quizId}-${gIdx}`);
        
        const questions: SubQuestion[] = gRows.map((row, rIdx) => {
          const qId = (now + pIdx + qIdx + gIdx * 100 + rIdx + 2000).toString();
          const type = parseQuestionType(row['Loại câu hỏi'] || row['Loại']);
          
          let options: Option[] = [];
          let correctOptionId: string | undefined = undefined;

          if (type === 'mcq') {
            const labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
            const numericLabels = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
            const optTypeRaw = (row['Loại phương án'] || 'text').toString().toLowerCase();
            const validMediaTypes: MediaType[] = ['text', 'audio', 'video', 'image'];
            const optType = validMediaTypes.includes(optTypeRaw as MediaType) ? (optTypeRaw as MediaType) : 'text';

            numericLabels.forEach((num, lIdx) => {
              const val = row[`Phương án ${num}`] || row[num] || '';
              const desc = row[`Mô tả ${num}`] || '';
              if (val.toString().trim() !== '') {
                options.push({
                  id: `o-num-${lIdx + 1}-${qId}`,
                  label: '',
                  type: optType,
                  value: optType === 'text' ? toRichText(val.toString()) : val.toString(),
                  description: toRichText(desc.toString())
                });
              }
            });

            if (options.length === 0) {
              labels.forEach((label, lIdx) => {
                const val = row[`Phương án ${label}`] || row[label] || '';
                const desc = row[`Mô tả ${label}`] || '';
                if (val.toString().trim() !== '') {
                  options.push({
                    id: `o${lIdx + 1}-${qId}`,
                    label: '',
                    type: optType,
                    value: optType === 'text' ? toRichText(val.toString()) : val.toString(),
                    description: toRichText(desc.toString())
                  });
                }
              });
            }

            const correctValue = (row['Đáp án'] || '1').toString().toUpperCase();
            const numIdx = parseInt(correctValue) - 1;
            if (!isNaN(numIdx) && options[numIdx]) {
              correctOptionId = options[numIdx].id;
            } else {
              const labelIndex = labels.indexOf(correctValue);
              correctOptionId = options[labelIndex]?.id || options[0]?.id;
            }
          }

          const allowedAnswerTypesRaw = (row['Loại đáp án cho phép'] || '').toString();
          const allowedAnswerTypes = allowedAnswerTypesRaw ? allowedAnswerTypesRaw.split(',').map(t => t.trim().toLowerCase() as MediaType) : undefined;

          return {
            id: qId,
            label: row['Tiêu đề câu hỏi'] || row['Tiêu đề'] || (rIdx + 1).toString(),
            type,
            questionItems: parseMediaItems(row['Loại nội dung câu hỏi'], row['Nội dung câu hỏi'] || row['Nội dung'] || row['Câu hỏi'] || '', `qi-${qId}`),
            prompt: toRichText((row['Dẫn nhập'] || '').toString()),
            options,
            correctOptionId,
            answer: (type === 'fill-blank' || type === 'essay') ? (row['Đáp án'] || '').toString() : '',
            explanation: toRichText((row['Giải thích'] || '').toString()),
            allowedAnswerTypes
          };
        });

        return {
          id: `g-${quizId}-${gIdx}`,
          contentItems: contentItems.length > 0 ? contentItems : [{ id: `c-${quizId}-${gIdx}-0`, type: 'text', value: 'Nội dung bài tập' }],
          questions
        };
      });

      newQuizzes.push({
        id: quizId,
        title: toRichText(quizName),
        order: parseInt(firstQuizRow['STT'] || firstQuizRow['Thứ tự'] || (qIdx + 1).toString()),
        headerItems: headerItems.length > 0 ? headerItems : [{ id: `h-${quizId}-0`, type: 'text', value: toRichText(quizName) }],
        questionGroups,
        createdAt: now,
        updatedAt: now,
        partId: partId
      });
    });
  });

  return { parts: newParts, quizzes: newQuizzes };
};

export const parseExcelImport = (data: any[], currentQuestionCount: number): QuestionGroup[] => {
  const now = Date.now();
  
  // Group rows by Nhóm câu hỏi
  const groupMap: { [key: string]: any[] } = {};
  const groupOrder: string[] = [];
  
  data.forEach((row: any) => {
    const groupName = (row['Nhóm câu hỏi'] || row['Dữ liệu nội dung'] || 'Default Group').toString();
    if (!groupMap[groupName]) {
      groupMap[groupName] = [];
      groupOrder.push(groupName);
    }
    groupMap[groupName].push(row);
  });

  let questionCounter = currentQuestionCount;

  return groupOrder.map((groupName, gIdx) => {
    const gRows = groupMap[groupName];
    const firstGRow = gRows[0];
    const contentItems = parseMediaItems(firstGRow['Loại nội dung'], firstGRow['Dữ liệu nội dung'] || 'Nội dung bài tập', `c-imp-${now}-${gIdx}`);
    
    const questions: SubQuestion[] = gRows.map((row: any) => {
      questionCounter++;
      const qId = (now + gIdx * 100 + questionCounter).toString();
      const type = parseQuestionType(row['Loại câu hỏi'] || row['Loại']);
      
      let options: Option[] = [];
      let correctOptionId: string | undefined = undefined;

      if (type === 'mcq') {
        const labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        const numericLabels = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
        const optTypeRaw = (row['Loại phương án'] || 'text').toString().toLowerCase();
        const validMediaTypes: MediaType[] = ['text', 'audio', 'video', 'image'];
        const optType = validMediaTypes.includes(optTypeRaw as MediaType) ? (optTypeRaw as MediaType) : 'text';
        
        numericLabels.forEach((num, lIdx) => {
          const val = row[`Phương án ${num}`] || row[num] || '';
          const desc = row[`Mô tả ${num}`] || '';
          if (val.toString().trim() !== '') {
            options.push({
              id: `o-num-${lIdx + 1}-${qId}`,
              label: '',
              type: optType,
              value: optType === 'text' ? toRichText(val.toString()) : val.toString(),
              description: toRichText(desc.toString())
            });
          }
        });

        if (options.length === 0) {
          labels.forEach((label, lIdx) => {
            const val = row[`Phương án ${label}`] || row[label] || '';
            const desc = row[`Mô tả ${label}`] || '';
            if (val.toString().trim() !== '') {
              options.push({
                id: `o${lIdx + 1}-${qId}`,
                label: '',
                type: optType,
                value: optType === 'text' ? toRichText(val.toString()) : val.toString(),
                description: toRichText(desc.toString())
              });
            }
          });
        }

        const correctValue = (row['Đáp án'] || '1').toString().toUpperCase();
        const numIdx = parseInt(correctValue) - 1;
        if (!isNaN(numIdx) && options[numIdx]) {
          correctOptionId = options[numIdx].id;
        } else {
          const labelIndex = labels.indexOf(correctValue);
          correctOptionId = options[labelIndex]?.id || options[0]?.id;
        }
      }

      const allowedAnswerTypesRaw = (row['Loại đáp án cho phép'] || '').toString();
      const allowedAnswerTypes = allowedAnswerTypesRaw ? allowedAnswerTypesRaw.split(',').map(t => t.trim().toLowerCase() as MediaType) : undefined;

      return {
        id: qId,
        label: row['Tiêu đề'] || row['Label'] || questionCounter.toString(),
        type,
        options,
        correctOptionId,
        answer: (type === 'fill-blank' || type === 'essay') ? (row['Đáp án'] || '').toString() : '',
        explanation: toRichText((row['Giải thích'] || '').toString()),
        prompt: toRichText((row['Dẫn nhập'] || '').toString()),
        allowedAnswerTypes,
        questionItems: parseMediaItems(row['Loại nội dung câu hỏi'], row['Nội dung câu hỏi'] || row['Nội dung'] || row['Câu hỏi'] || '', `qi-${qId}`)
      };
    });

    return {
      id: `g-imp-${now}-${gIdx}`,
      contentItems: contentItems.length > 0 ? contentItems : [{ id: `c-imp-${now}-${gIdx}-0`, type: 'text', value: 'Nội dung bài tập' }],
      questions
    };
  });
};

