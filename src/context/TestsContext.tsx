import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Test } from '../types';
import {
  clearTestsOverride,
  exportTestsJson,
  loadTestsFromPublic,
  loadTestsOverride,
  parseImportedTests,
  saveTestsOverride,
} from '../lib/storage';
import { uid } from '../lib/id';

interface TestsContextValue {
  tests: Test[];
  loading: boolean;
  usingOverride: boolean;
  refresh: () => Promise<void>;
  getTest: (id: string) => Test | undefined;
  saveTest: (test: Test) => void;
  createTest: (partial?: Partial<Test>) => Test;
  deleteTest: (id: string) => void;
  replaceAll: (tests: Test[]) => void;
  exportJson: () => void;
  importJson: (fileText: string) => void;
  clearOverride: () => Promise<void>;
}

const TestsContext = createContext<TestsContextValue | null>(null);

export function TestsProvider({ children }: { children: ReactNode }) {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingOverride, setUsingOverride] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    const override = loadTestsOverride();
    if (override) {
      setTests(override);
      setUsingOverride(true);
      setLoading(false);
      return;
    }
    const fromPublic = await loadTestsFromPublic();
    setTests(fromPublic);
    setUsingOverride(false);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const persist = useCallback((next: Test[]) => {
    setTests(next);
    saveTestsOverride(next);
    setUsingOverride(true);
  }, []);

  const getTest = useCallback(
    (id: string) => tests.find((t) => t.id === id),
    [tests],
  );

  const saveTest = useCallback(
    (test: Test) => {
      const now = new Date().toISOString();
      const updated = { ...test, updatedAt: now };
      const idx = tests.findIndex((t) => t.id === updated.id);
      const next =
        idx >= 0
          ? tests.map((t, i) => (i === idx ? updated : t))
          : [...tests, updated];
      persist(next);
    },
    [tests, persist],
  );

  const createTest = useCallback(
    (partial?: Partial<Test>) => {
      const now = new Date().toISOString();
      const test: Test = {
        id: uid('test'),
        title: partial?.title ?? 'Новый тест',
        description: partial?.description ?? '',
        shuffle: partial?.shuffle ?? false,
        cards: partial?.cards ?? [],
        createdAt: now,
        updatedAt: now,
      };
      persist([...tests, test]);
      return test;
    },
    [tests, persist],
  );

  const deleteTest = useCallback(
    (id: string) => {
      persist(tests.filter((t) => t.id !== id));
    },
    [tests, persist],
  );

  const replaceAll = useCallback(
    (next: Test[]) => {
      persist(next);
    },
    [persist],
  );

  const exportJson = useCallback(() => {
    exportTestsJson(tests);
  }, [tests]);

  const importJson = useCallback(
    (fileText: string) => {
      const parsed = parseImportedTests(fileText);
      persist(parsed);
    },
    [persist],
  );

  const clearOverride = useCallback(async () => {
    clearTestsOverride();
    await refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      tests,
      loading,
      usingOverride,
      refresh,
      getTest,
      saveTest,
      createTest,
      deleteTest,
      replaceAll,
      exportJson,
      importJson,
      clearOverride,
    }),
    [
      tests,
      loading,
      usingOverride,
      refresh,
      getTest,
      saveTest,
      createTest,
      deleteTest,
      replaceAll,
      exportJson,
      importJson,
      clearOverride,
    ],
  );

  return <TestsContext.Provider value={value}>{children}</TestsContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- hook paired with provider
export function useTests(): TestsContextValue {
  const ctx = useContext(TestsContext);
  if (!ctx) throw new Error('useTests must be used within TestsProvider');
  return ctx;
}
