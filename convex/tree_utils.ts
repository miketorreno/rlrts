import { Id } from "./_generated/dataModel";
import { MutationCtx } from "./_generated/server";

export async function deleteLeafAndCompletions(
  ctx: MutationCtx,
  leafId: Id<"leaves">,
): Promise<void> {
  const leaf = await ctx.db.get(leafId);
  if (leaf) {
    if (leaf.scheduledTimer) {
      await ctx.scheduler.cancel(leaf.scheduledTimer);
    }
    if (leaf.scheduledReminder) {
      await ctx.scheduler.cancel(leaf.scheduledReminder);
    }
  }

  const completions = await ctx.db
    .query("completions")
    .filter((q) => q.eq(q.field("leafId"), leafId))
    .collect();
  await Promise.all(completions.map((c) => ctx.db.delete(c._id)));
  await ctx.db.delete(leafId);
}

export async function deleteTwigSubtree(ctx: MutationCtx, twigId: Id<"twigs">): Promise<void> {
  const leaves = await ctx.db
    .query("leaves")
    .filter((q) => q.eq(q.field("twigId"), twigId))
    .collect();
  for (const leaf of leaves) await deleteLeafAndCompletions(ctx, leaf._id);
  await ctx.db.delete(twigId);
}

export async function deleteBranchSubtree(ctx: MutationCtx, branchId: Id<"branches">): Promise<void> {
  const twigs = await ctx.db
    .query("twigs")
    .filter((q) => q.eq(q.field("branchId"), branchId))
    .collect();
  for (const twig of twigs) await deleteTwigSubtree(ctx, twig._id);
  await ctx.db.delete(branchId);
}

export async function deleteLimbSubtree(ctx: MutationCtx, limbId: Id<"limbs">): Promise<void> {
  const branches = await ctx.db
    .query("branches")
    .filter((q) => q.eq(q.field("limbId"), limbId))
    .collect();
  for (const branch of branches) await deleteBranchSubtree(ctx, branch._id);
  await ctx.db.delete(limbId);
}

export async function deleteTrunkSubtree(ctx: MutationCtx, trunkId: Id<"trunks">): Promise<void> {
  const limbs = await ctx.db
    .query("limbs")
    .filter((q) => q.eq(q.field("trunkId"), trunkId))
    .collect();
  for (const limb of limbs) await deleteLimbSubtree(ctx, limb._id);
  await ctx.db.delete(trunkId);
}
