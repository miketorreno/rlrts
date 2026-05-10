/**
 * Creates a type-safe ID for database entities.
 *
 * This is a "branded type" - a TypeScript pattern that creates compile-time
 * type safety for strings that should not be mixed up.
 *
 * Example:
 * - Id<"habits"> and Id<"calendars"> are different types
 * - This prevents accidentally using a habit ID where a calendar ID is expected
 *
 * @template T - The table/entity name this ID belongs to
 */
export type Id<T extends string> = string & { __tableName: T };

export interface Calendar {
  _id: Id<"calendars">;
  _creationTime: number;
  name: string;
  colorTheme: string;
  userId: string;
  position?: number;
}

export interface Habit {
  _id: Id<"habits">;
  _creationTime: number;
  name: string;
  calendarId: Id<"calendars">;
  userId: string;
}

export interface Completion {
  _id: Id<"completions">;
  _creationTime: number;
  habitId: Id<"habits">;
  completedAt: number;
  userId: string;
}

export type Day = string;

export type EditingCalendar = Pick<Calendar, "_id" | "name" | "colorTheme" | "position">;
export type EditingHabit = Pick<Habit, "_id" | "name">;
