export function buildTweetTree<
  T extends { id: string; parentId?: string | null },
>(tweets: T[]) {
  const map = new Map<string, any>();

  tweets.forEach((t) => {
    map.set(t.id, { ...t, replies: [] });
  });

  const roots: any[] = [];

  tweets.forEach((t) => {
    if (t.parentId) {
      const parent = map.get(t.parentId);
      if (parent) {
        parent.replies.push(map.get(t.id));
      }
    } else {
      roots.push(map.get(t.id));
    }
  });

  return roots;
}

export function sortTweetTree(node: any) {
  node.replies.sort(
    (a: any, b: any) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  node.replies.forEach((r: any) => sortTweetTree(r));
}
