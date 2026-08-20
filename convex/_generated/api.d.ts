/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as branches from "../branches.js";
import type * as dashboard from "../dashboard.js";
import type * as leaves from "../leaves.js";
import type * as limbs from "../limbs.js";
import type * as migrations from "../migrations.js";
import type * as todos from "../todos.js";
import type * as tree from "../tree.js";
import type * as tree_utils from "../tree_utils.js";
import type * as trunks from "../trunks.js";
import type * as twig_sync from "../twig_sync.js";
import type * as twigs from "../twigs.js";
import type * as xp from "../xp.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  branches: typeof branches;
  dashboard: typeof dashboard;
  leaves: typeof leaves;
  limbs: typeof limbs;
  migrations: typeof migrations;
  todos: typeof todos;
  tree: typeof tree;
  tree_utils: typeof tree_utils;
  trunks: typeof trunks;
  twig_sync: typeof twig_sync;
  twigs: typeof twigs;
  xp: typeof xp;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
