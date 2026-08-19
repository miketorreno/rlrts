import { query } from "./_generated/server";

export type TreeNode = {
  id: string;
  type: "trunk" | "limb" | "branch" | "twig" | "leaf";
  name: string;
  colorTheme?: string;
  children: TreeNode[];
};

export const getFullTree = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { trunks: [] as TreeNode[], rootTwigs: [] as TreeNode[] };

    const userId = identity.subject;

    const [trunks, limbs, branches, twigs, leaves] = await Promise.all([
      ctx.db
        .query("trunks")
        .filter((q) => q.eq(q.field("userId"), userId))
        .collect(),
      ctx.db
        .query("limbs")
        .filter((q) => q.eq(q.field("userId"), userId))
        .collect(),
      ctx.db
        .query("branches")
        .filter((q) => q.eq(q.field("userId"), userId))
        .collect(),
      ctx.db
        .query("twigs")
        .filter((q) => q.eq(q.field("userId"), userId))
        .collect(),
      ctx.db
        .query("leaves")
        .filter((q) => q.eq(q.field("userId"), userId))
        .collect(),
    ]);

    // Build leaf nodes (no children) and index by twigId
    const leafNodes: TreeNode[] = leaves.map((l) => ({
      id: l._id,
      type: "leaf" as const,
      name: l.name,
      children: [],
    }));
    const leavesByTwig = new Map<string, TreeNode[]>();
    for (const node of leafNodes) {
      const leaf = leaves.find((l) => l._id === node.id)!;
      const arr = leavesByTwig.get(leaf.twigId) ?? [];
      arr.push(node);
      leavesByTwig.set(leaf.twigId, arr);
    }

    // Build twig nodes with their leaves as children
    const twigNodes: TreeNode[] = twigs.map((t) => ({
      id: t._id,
      type: "twig" as const,
      name: t.name,
      colorTheme: t.colorTheme,
      children: sortNodes(leavesByTwig.get(t._id) ?? [], leaves.filter((l) => l.twigId === t._id)),
    }));
    const twigsByBranch = new Map<string, TreeNode[]>();
    const rootTwigs: TreeNode[] = [];
    for (const node of twigNodes) {
      const twig = twigs.find((t) => t._id === node.id)!;
      if (twig.branchId) {
        const arr = twigsByBranch.get(twig.branchId) ?? [];
        arr.push(node);
        twigsByBranch.set(twig.branchId, arr);
      } else {
        rootTwigs.push(node);
      }
    }

    // Build branch nodes with their twigs
    const branchNodes: TreeNode[] = branches.map((b) => ({
      id: b._id,
      type: "branch" as const,
      name: b.name,
      children: sortNodes(twigsByBranch.get(b._id) ?? [], twigs.filter((t) => t.branchId === b._id)),
    }));
    const branchesByLimb = new Map<string, TreeNode[]>();
    for (const node of branchNodes) {
      const branch = branches.find((b) => b._id === node.id)!;
      const arr = branchesByLimb.get(branch.limbId) ?? [];
      arr.push(node);
      branchesByLimb.set(branch.limbId, arr);
    }

    // Build limb nodes with their branches
    const limbNodes: TreeNode[] = limbs.map((l) => ({
      id: l._id,
      type: "limb" as const,
      name: l.name,
      children: sortNodes(branchesByLimb.get(l._id) ?? [], branches.filter((b) => b.limbId === l._id)),
    }));
    const limbsByTrunk = new Map<string, TreeNode[]>();
    for (const node of limbNodes) {
      const limb = limbs.find((l) => l._id === node.id)!;
      const arr = limbsByTrunk.get(limb.trunkId) ?? [];
      arr.push(node);
      limbsByTrunk.set(limb.trunkId, arr);
    }

    // Build trunk nodes with their limbs
    const trunkNodes: TreeNode[] = trunks.map((t) => ({
      id: t._id,
      type: "trunk" as const,
      name: t.name,
      children: sortNodes(limbsByTrunk.get(t._id) ?? [], limbs.filter((l) => l.trunkId === t._id)),
    }));

    trunkNodes.sort((a, b) => {
      const ta = trunks.find((t) => t._id === a.id)!;
      const tb = trunks.find((t) => t._id === b.id)!;
      return (ta.position ?? Infinity) - (tb.position ?? Infinity);
    });

    rootTwigs.sort((a, b) => {
      const ta = twigs.find((t) => t._id === a.id)!;
      const tb = twigs.find((t) => t._id === b.id)!;
      return (ta.position ?? Infinity) - (tb.position ?? Infinity);
    });

    return { trunks: trunkNodes, rootTwigs };
  },
});

/** Sort TreeNode[] by the position of the corresponding raw record. */
function sortNodes(
  nodes: TreeNode[],
  rawRecords: { _id: string; position?: number }[],
): TreeNode[] {
  return nodes.sort((a, b) => {
    const ra = rawRecords.find((r) => r._id === a.id)!;
    const rb = rawRecords.find((r) => r._id === b.id)!;
    return (ra.position ?? Infinity) - (rb.position ?? Infinity);
  });
}
