"use client";

import { useEffect, useState, type RefObject } from "react";
import { closePerioOverlay, OdontogramProvider, PerioChart, useOdontogramUi } from "react-advanced-odontogram";
import { useI18n, usePreferences } from "@/components/providers/AppProviders";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { confirmDualState, setPerioAsPopup, setShowBone, tilesOf } from "../engine/engine";

/**
 * Hosts React Advanced Odontogram for one workspace: a single
 * `OdontogramProvider` (the engine is a page-level singleton) driven by
 * DaliDoc's language, theme and permissions. Its surfaces are placed by the
 * workspace layout; the dialogs the stock shell would render are provided
 * here in DaliDoc's style.
 */
export function OdontogramEngine({ readOnly, children }: { readOnly: boolean; children: React.ReactNode }) {
  const { locale } = useI18n();
  const { isDark } = usePreferences();
  return (
    <OdontogramProvider
      language={locale}
      numberingSystem="FDI"
      darkMode={isDark}
      readOnly={readOnly}
      enableNotes={false}
      showOrthoCard
      showStatusCard
    >
      {children}
      <EngineDialogs />
    </OdontogramProvider>
  );
}

function EngineDialogs() {
  const { t: dt } = useI18n();
  const { t, confirmOpen, perioOpen } = useOdontogramUi();
  return (
    <>
      <PerioChart open={perioOpen} onClose={closePerioOverlay} />
      <Dialog open={confirmOpen} onOpenChange={(open) => !open && confirmDualState.cancel()}>
        <DialogContent closeLabel={dt("common.close")}>
          <DialogTitle>{dt("chart.dualStateTitle")}</DialogTitle>
          <DialogDescription>{t("dualState.confirmPlannedStatusEdit")}</DialogDescription>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="outline" onClick={() => confirmDualState.cancel()}>
              {t("dualState.cancel")}
            </Button>
            <Button onClick={() => confirmDualState.accept()}>{t("dualState.accept")}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/** True once the engine has drawn its tooth grid inside `ref`; applies DaliDoc's display defaults then. */
export function useEngineReady(ref: RefObject<HTMLElement | null>): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const root = ref.current;
    if (!root || ready) return;
    const check = () => {
      if (tilesOf(root).length >= 32) {
        setPerioAsPopup();
        setShowBone(false);
        setReady(true);
        return true;
      }
      return false;
    };
    if (check()) return;
    const observer = new MutationObserver(() => {
      if (check()) observer.disconnect();
    });
    observer.observe(root, { subtree: true, childList: true });
    return () => observer.disconnect();
  }, [ref, ready]);
  return ready;
}
