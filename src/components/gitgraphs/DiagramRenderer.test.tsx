import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { DiagramRenderer } from "./DiagramRenderer";
import type { DiagramKind } from "./types";

const allKinds: DiagramKind[] = [
  "init",
  "staging",
  "commit",
  "branch",
  "checkout",
  "mergeFastForward",
  "mergeThreeWay",
  "remoteClone",
  "remotePush",
  "remotePull",
  "rebase",
  "stash",
];

describe("DiagramRenderer", () => {
  it.each(allKinds)("renders an svg for the %s diagram kind", (kind) => {
    const { container } = render(<DiagramRenderer kind={kind} />);
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("captions the two merge diagrams so they can be told apart when shown side by side", () => {
    const ff = render(<DiagramRenderer kind="mergeFastForward" />);
    expect(ff.container.textContent).toContain("Fast-forward");
    const threeWay = render(<DiagramRenderer kind="mergeThreeWay" />);
    expect(threeWay.container.textContent).toContain("Three-way");
  });

  it("shows the rebase's original commit as a ghost alongside its replayed copy", () => {
    const { container } = render(<DiagramRenderer kind="rebase" />);
    expect(container.textContent).toContain("F (old)");
    expect(container.textContent).toContain("F'");
    expect(container.querySelector("circle[stroke-dasharray]")).not.toBeNull();
  });
});
