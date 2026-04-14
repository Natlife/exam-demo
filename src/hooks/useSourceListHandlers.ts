import { useCallback } from "react";
import { sourceRequest } from "@/types/question";
import { createDynamicSource } from "@/utils/QuestionFactory";

export function useSourceListHandlers<T, K extends keyof T>(
  listKey: K,
  setParent: React.Dispatch<React.SetStateAction<T>>,
) {
  const getList = (state: T): sourceRequest[] =>
    state[listKey] as unknown as sourceRequest[];

  const update = useCallback(
    (id: string, field: keyof sourceRequest, value: string) => {
      setParent((prev) => ({
        ...prev,
        [listKey]: getList(prev).map((item) =>
          item.id === id ? { ...item, [field]: value } : item,
        ),
      }));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [listKey, setParent],
  );

  const remove = useCallback(
    (id: string) => {
      setParent((prev) => {
        if (getList(prev).length <= 1) return prev;
        return {
          ...prev,
          [listKey]: getList(prev).filter((item) => item.id !== id),
        };
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [listKey, setParent],
  );

  const add = useCallback(
    (type: number) => {
      setParent((prev) => ({
        ...prev,
        [listKey]: [...getList(prev), createDynamicSource(type)],
      }));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [listKey, setParent],
  );

  const reorder = useCallback(
    (startIndex: number, endIndex: number) => {
      setParent((prev) => {
        const result = [...getList(prev)];
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return { ...prev, [listKey]: result };
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [listKey, setParent],
  );

  return { update, remove, add, reorder } as const;
}
