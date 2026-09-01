export function getLocalDateKey(date: Date = new Date()): string {
  const year = String(date.getFullYear()).padStart(4, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getLocalWeekdayIndex(date: Date = new Date()): number {
  const sundayFirstIndex = date.getDay();
  return sundayFirstIndex === 0 ? 6 : sundayFirstIndex - 1;
}

export function getLocalWeekDates(date: Date = new Date()): Date[] {
  const mondayIndex = getLocalWeekdayIndex(date);
  return Array.from({ length: 7 }, (_, index) => (
    new Date(date.getFullYear(), date.getMonth(), date.getDate() - mondayIndex + index)
  ));
}

export function getLocalTodayIndex(date: Date = new Date()): number {
  return getLocalWeekdayIndex(date);
}

export function formatLocalDate(date: Date): string {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export function parseLocalDateKey(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return getLocalDateKey(date) === value ? date : null;
}

export function formatLocalDateKey(value: string): string {
  const date = parseLocalDateKey(value);
  return date ? formatLocalDate(date) : value;
}

export function getLocalWeekStartKey(date: Date = new Date()): string {
  return getLocalDateKey(getLocalWeekDates(date)[0]);
}
