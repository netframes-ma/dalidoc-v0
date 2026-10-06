"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import type { ChartMarker } from "../lib/tooth-event-status";
import { selectedTeeth, subscribe, tilesOf } from "./engine";

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
 * The tooth the drawer shows.
 *
 * Editable chart: follows the engine's own selection (a tile click, the
 * keyboard, the selection filters); with several teeth selected, the one added
 * last wins. Read-only chart: the engine ignores clicks, so DaliDoc selects
 * the tooth itself and marks the tile with `data-dd-selected`.
 */
export function useToothSelection(rootRef: RefObject<HTMLElement | null>, editable: boolean, ready: boolean) {
  const [tooth, setTooth] = useState<number | null>(null);
  const [count, setCount] = useState(0);
  const previous = useRef<number[]>([]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !ready || !editable) return;
    const read = () => {
      const now = selectedTeeth(root);
      const added = now.filter((n) => !previous.current.includes(n));
      previous.current = now;
      setCount(now.length);
      setTooth((current) => {
        if (now.length === 0) return null;
        if (added.length > 0) return added[added.length - 1] ?? null;
        return current !== null && now.includes(current) ? current : (now[0] ?? null);
      });
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, [rootRef, editable, ready]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !ready || editable) return;
    const onClick = (event: MouseEvent) => {
      const tile = (event.target as Element | null)?.closest<HTMLElement>(".tooth-tile[data-tooth]");
      if (tile) setTooth(Number(tile.dataset.tooth));
    };
    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }, [rootRef, editable, ready]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !ready || editable) return;
    for (const tile of tilesOf(root)) {
      if (Number(tile.dataset.tooth) === tooth) tile.dataset.ddSelected = "";
      else delete tile.dataset.ddSelected;
    }
  }, [rootRef, editable, ready, tooth]);

  const select = useCallback((n: number | null) => setTooth(n), []);
  return { tooth, count: editable ? count : tooth === null ? 0 : 1, select };
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
