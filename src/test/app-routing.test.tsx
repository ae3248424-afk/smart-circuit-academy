import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });
  it.each([
    ['/diploma/beginner', '/diploma_/$level'],
    ['/diploma/beginner/part/1', '/diploma_/$level_/part/$part'],
    ['/diploma/expert/exam/level', '/diploma_/$level_/exam/$exam'],
    ['/diploma/advanced/certificate/3', '/diploma_/$level_/certificate/$exam'],
    ['/diploma/certificates', '/diploma_/certificates'],
    ['/lab', '/lab'],
  ])('matches independent diploma page %s', (path, id) => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    const matches = router.matchRoutes(path);
    expect(matches.at(-1)?.routeId).toBe(id);
    expect(matches).toHaveLength(2);
  });
});
