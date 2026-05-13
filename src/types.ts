/**
 * Creates a type-safe ID for database entities.
 *
 * This is a "branded type" - a TypeScript pattern that creates compile-time
 * type safety for strings that should not be mixed up.
 *
 * Example:
 * - Id<"leaves"> and Id<"twigs"> are different types
 * - This prevents accidentally using a leaf ID where a twig ID is expected
 *
 * @template T - The table/entity name this ID belongs to
 */
export type Id<T extends string> = string & { __tableName: T };

export interface Twig {
  _id: Id<"twigs">;
  _creationTime: number;
  name: string;
  colorTheme: string;
  userId: string;
  position?: number;
}

export interface Leaf {
  _id: Id<"leaves">;
  _creationTime: number;
  name: string;
  twigId: Id<"twigs">;
  userId: string;
}

export interface Completion {
  _id: Id<"completions">;
  _creationTime: number;
  leafId: Id<"leaves">;
  completedAt: number;
  userId: string;
}

export type Day = string;

export type EditingTwig = Pick<
  Twig,
  "_id" | "name" | "colorTheme" | "position"
>;
export type EditingLeaf = Pick<Leaf, "_id" | "name">;
