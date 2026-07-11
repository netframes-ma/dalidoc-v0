# Feature: Odontogram

## Purpose

The odontogram is the flagship clinical workspace.

## Visual Requirement

Use an oval open-mouth FDI arch, not a flat grid.

## FDI Numbers

Upper: `18 17 16 15 14 13 12 11 21 22 23 24 25 26 27 28`

Lower: `48 47 46 45 44 43 42 41 31 32 33 34 35 36 37 38`

## Components

```txt
OdontogramWorkspace, PatientContextPanel, OdontogramView, OvalDentalArch, Tooth, ToothLegend, SelectedToothDrawer, AssistantDraftValidation, DiagnosisSection, PlannedTreatmentsSection, CompletedTreatmentsSection, ToothTimeline
```

## Drawer Must Show

diagnosis, planned treatments, completed treatments, assistant drafts, dentist validation, notes, timeline, linked appointment, linked invoice, quick actions.

## Assistant Draft Rule

Assistant entries are `pending_validation` until dentist approval.
