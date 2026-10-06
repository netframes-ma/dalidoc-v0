# Feature: Odontogram

## Purpose

The odontogram is the flagship clinical workspace (ADR-0004): where dentists
and assistants chart a patient's teeth, and where every finding, planned
treatment and completed treatment is recorded, validated and linked to the
appointment and the invoice.

## Charting Engine

The chart itself is [React Advanced Odontogram](https://github.com/ZoliQua/React-Advanced-Odontogram)
2.5.0 (ADR-0005): FDI numbering, caries and fillings per surface, endodontics,
crowns, bridges, implants, a Status chart and a Plan chart, a periodontal
chart, and FHIR R4 / SVG / PNG export.

DaliDoc composes the engine's surfaces in its own layout under a single
`OdontogramProvider`:

| Engine surface | Where it lives in DaliDoc |
|---|---|
| `OdontogramChartSurface` | The lightbox — the chart on an ink panel in every theme |
| `ToothControlsSurface` | The drawer's **Saisie / Charting** tab (editing roles only) |
| `ToothInfoSurface` | The collapsible **Synthèse clinique** card |
| `PerioChart` | Opened from the lightbox (**Parodontogramme**) |

Language, dark mode and read-only mode are driven by DaliDoc's preferences and
permissions; colours come from DaliDoc's tokens (`apps/web/src/styles/odontogram-theme.css`).

## Visual Requirement

- The chart is the engine's two-row FDI grid (upper 18→28, lower 48→38), side
  and occlusal views, with the patient's right on the viewer's left.
- The oval open-mouth FDI arch is kept as DaliDoc's **arch navigator**: an
  overview coloured by workflow state when no tooth is selected, a locator in
  the drawer header, and a way to open any tooth.
- Workflow markers sit on the engine's tiles: **À valider** (amber, pulsing),
  **Traitement prévu** (brand), **Traitement réalisé** (green), and
  **Non enregistré** (dashed amber) for edits not saved yet.

## FDI Numbers

Upper: `18 17 16 15 14 13 12 11 21 22 23 24 25 26 27 28`

Lower: `48 47 46 45 44 43 42 41 31 32 33 34 35 36 37 38`

## Components

```txt
apps/web/src/features/dental-chart/
  components/
    OdontogramWorkspace      page composition, data loading states
    OdontogramEngine         the single OdontogramProvider + perio and confirm dialogs
    PatientContextPanel      identity, medical alerts, linked appointment, plan, balance
    ChartStage               lightbox around OdontogramChartSurface, export, perio
    ChartChangesBar          unsaved charting → save (dentist) / submit (assistant)
    ToothLegend              workflow marker legend
    OvalDentalArch           oval FDI arch: navigator and locator
    SelectedToothDrawer      tooth record + engine controls tab
    AssistantDraftValidation pending entries, validate / reject with reason
    ToothEventSections       DiagnosisSection, PlannedTreatmentsSection,
                             CompletedTreatmentsSection, NotesSection
    ToothTimeline            who entered, validated, rejected, completed — and when
    ToothEventForm           quick diagnosis / planned act / note
    PlanProposalsPanel       Plan chart → priced acts → planned tooth events
  engine/                    the only code that calls the engine's API
  hooks/                     useOdontogramRecord, useChartWorkflow
  lib/                       pure logic: statuses, chart diff, acts, arch geometry
  api/                       typed client + in-memory implementation
```

## Drawer Shows

Charted findings (the engine's own description of the tooth), unsaved changes,
entries waiting for validation, diagnoses, planned treatments, completed
treatments, notes, linked appointment, linked invoice, quick actions
(diagnosis, planned act, note, mark done, invoice) and the timeline.

## Chart ↔ Tooth Events

The chart is a projection of clinical facts; tooth events explain every change.

1. The API stores the validated chart as a **sparse diff** of the engine's
   export format (only what differs from a healthy mouth), with a version.
2. The workspace loads it into the engine, plus every pending charting draft,
   so the chart shows what is waiting for validation.
3. Anything the user charts beyond that is **unsaved** (dashed amber marker,
   changes bar). Saving creates one `diagnosis` tooth event per changed tooth
   carrying the before/after state of the changed fields:
   - dentist or owner → `validated`, written into the stored chart;
   - assistant → `pending_validation`, stored chart unchanged.
4. **Validate** writes the draft's change into the stored chart.
   **Reject** requires a reason, keeps the event in the history and takes the
   change off the chart.
5. In **Plan** mode the user draws the intended result. The difference between
   the Status and Plan charts is priced from the act catalogue (composite by
   number of new surfaces, crowns by material, single/multi-root endodontics,
   simple/surgical extraction, implant…). **Ajouter au plan** saves the plan
   chart and creates `planned` tooth events.
6. **Marquer réalisé** completes a planned event (dentist/owner) and applies
   its planned drawing to the Status chart; it links today's appointment.
7. **Facturer** creates an invoice from validated or completed treatment only.

## Assistant Draft Rule

Assistant entries are `pending_validation` until dentist approval. Only
dentists and owners validate or reject; a rejection needs a reason.

## Statuses

Tooth event: `draft`, `pending_validation`, `validated`, `rejected`,
`cancelled`, `completed`, `invoiced`, `paid`. Transitions are append-only
(`lib/tooth-event-status.ts`); rejected and cancelled events stay in the
timeline.

## Permissions

| Role | Chart | Validate | Plan | Billing |
|---|---|---|---|---|
| owner, dentist | edit (entries validated) | yes | yes | read, create |
| assistant | edit (entries pending) | no | yes | — |
| receptionist | read | no | no | read |
| accountant | read | no | no | read, create |

The UI hides what a role cannot do; the API enforces the same matrix.

## Privacy

Exports (FHIR, SVG, PNG) are generated in the browser. The engine's
localStorage persistence is not enabled: clinical data is only stored by the
API. External calendar invitations never carry treatment details.

## Known Limitations

- One chart per page (the engine is a singleton).
- Engine-generated text (charted findings, plan change labels, the clinical
  summary) uses the engine's own translations, which are partly English in
  French and Arabic.
- The API is an in-memory mock (`api/mock-dental-chart.api.ts`) with the
  backend's rules; the Fastify service replaces it behind the same interface.
