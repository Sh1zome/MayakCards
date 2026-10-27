import type { Test } from '../types';

const STORAGE_KEY = 'mayak_tests_override';

function testsUrl(): string {
  const base = import.meta.env.BASE_URL || '/';
  return `${base}tests.json`;
}

export async function loadTestsFromPublic(): Promise<Test[]> {
  try {
    const res = await fetch(testsUrl(), { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data)) return data as Test[];
    if (data && Array.isArray(data.tests)) return data.tests as Test[];
    return [];
  } catch {
    return [];
  }
}

export function loadTestsOverride(): Test[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Test[]) : null;
  } catch {
    return null;
  }
}

export function saveTestsOverride(tests: Test[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tests));
}

export function clearTestsOverride(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function exportTestsJson(tests: Test[]): void {
  const blob = new Blob([JSON.stringify(tests, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'tests.json';
  a.click();
  URL.revokeObjectURL(url);
}

export function parseImportedTests(fileText: string): Test[] {
  const data = JSON.parse(fileText);
  if (Array.isArray(data)) return data as Test[];
  if (data && Array.isArray(data.tests)) return data.tests as Test[];
  throw new Error('Неверный формат JSON: ожидается массив тестов');
}
