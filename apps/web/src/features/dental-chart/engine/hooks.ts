"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";
import type { ChartMarker } from "../lib/tooth-event-status";
import { onSelection, selectTooth, subscribe, tilesOf } from "./engine";

/** Bumps every time the engine reports a chart change (throttled to one per frame). */
export function useEngineRevision(enabled: boolean): number {
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    let frame = 0;
    const unsubscribe = subscribe(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setRevision((r) => r + 1));
    });
    return () => {
      cancelAnimationFrame(frame);
      unsubscribe();
    };
  }, [enabled]);
  return revision;
}

/**
 * The tooth the drawer shows: the engine's active tooth (with several teeth
 * selected, the one added last), followed through `onSelectionChange`.
 *
 * Editable chart: the engine selects on click, keyboard and selection filters.
 * Read-only chart: the engine ignores clicks, so DaliDoc selects the clicked
 * tooth through `selectTeeth()`, which is allowed in read-only mode.
 */
export function useToothSelection(rootRef: RefObject<HTMLElement | null>, editable: boolean, ready: boolean) {
  const [selection, setSelection] = useState<{ tooth: number | null; count: number }>({ tooth: null, count: 0 });

  useEffect(() => {
    if (!ready) return;
    return onSelection((teeth, active) => setSelection({ tooth: active, count: teeth.length }));
  }, [ready]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !ready || editable) return;
    const onClick = (event: MouseEvent) => {
      const tile = (event.target as Element | null)?.closest<HTMLElement>(".tooth-tile[data-tooth]");
      if (tile) selectTooth(root, Number(tile.dataset.tooth));
    };
    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }, [rootRef, editable, ready]);

  const select = useCallback((tooth: number | null) => selectTooth(rootRef.current, tooth), [rootRef]);
  return { tooth: selection.tooth, count: selection.count, select };
}

/**
 * Paints DaliDoc's workflow state onto the engine's tiles (`data-dd-flow`),
 * styled in odontogram-theme.css. Re-applied when the engine rebuilds its grid
 * (occlusal view, wisdom teeth toggle).
 */
export function useTileAnnotations(
  rootRef: RefObject<HTMLElement | null>,
  ready: boolean,
  flows: ReadonlyMap<number, ChartMarker>,
  describe: (tooth: number, flow: ChartMarker) => string,
) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !ready) return;
    const paint = () => {
      for (const tile of tilesOf(root)) {
        const tooth = Number(tile.dataset.tooth);
        const flow = flows.get(tooth);
        if (flow) {
          if (tile.dataset.ddFlow !== flow) tile.dataset.ddFlow = flow;
          const description = describe(tooth, flow);
          if (tile.getAttribute("aria-description") !== description) tile.setAttribute("aria-description", description);
        } else if (tile.dataset.ddFlow) {
          delete tile.dataset.ddFlow;
          tile.removeAttribute("aria-description");
        }
      }
    };
    paint();
    const observer = new MutationObserver((records) => {
      if (records.some((r) => r.type === "childList" && r.addedNodes.length > 0)) paint();
    });
    observer.observe(root, { subtree: true, childList: true });
    return () => observer.disconnect();
  }, [rootRef, ready, flows, describe]);
}
