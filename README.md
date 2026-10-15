# Business OS — Infinite-Canvas Notes Dashboard

A single, free-flowing, pannable canvas for organizing a business or project as a
visual tree of notes. Think minimal Figma/whiteboard board — pure black canvas,
white ink, handwritten type — where the whole company's strategy lives on one
screen: tools, objectives, processes and metrics.

Built to recreate the "Marketing Framework" boards: a root summary card, colorful
app-icon clusters hanging on a trunk line, and dense framework columns below.

## Highlights

- **Infinite 2D canvas** — drag to pan, scroll/pinch to zoom (10%–400%), zoom
  centered on the cursor, GPU-accelerated transforms, zoom indicator.
- **Framework tree layout** — root card → trunk line → branches into columns
  (`[BRAND STRATEGY]`, `[OFFER STRATEGY]`, …), each with a **Tools** box,
  an **Objective** box, and collapsible sections of 2–3 column bullet tables.
- **Modular icon system** — 100+ built-in app logos (Notion, Slack, Canva,
  Stripe, HubSpot…) rendered in brand colors, plus custom image URLs.
  Icons are draggable between clusters and into any column's Tools box,
  with a searchable "Add app" picker on every cluster/box.
- **Two note sizes** — small free notes and **big notes**: cards with
  collapsible dropdown sections of bullet tables (same anatomy as a framework
  column). Every new note auto-connects to its nearest neighbor with a
  connector line, so the tree never fragments.
- **Inline editing** — double-click any text to edit in place (click/drag just
  moves the node); add/remove notes, table columns and sections;
  right-click for add-child / duplicate / delete.
- **Undo / redo** — `Ctrl/Cmd+Z`, `Ctrl/Cmd+Shift+Z` (one step per edit session).
- **Multiple boards** — tabs across the top (e.g. Marketing, Product, Finance).
- **Persistence** — autosaved to `localStorage`; export/import the whole
  workspace as JSON.

## Tech

React + TypeScript + Vite · [React Flow (xyflow)](https://reactflow.dev) for the
canvas/pan-zoom/connectors · Zustand for state (with snapshot history) ·
[simple-icons](https://simpleicons.org) for brand logos · CSS-only styling.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build to dist/
```

## Keyboard & mouse

| Action | Input |
| --- | --- |
| Pan | drag empty canvas (mouse / one finger) |
| Zoom | scroll wheel / pinch (cursor-centered) |
| Add note | double-click empty canvas, or `+ note` in the top bar |
| Add big note | `+ big note` in the top bar, or right-click → *Add big note here* |
| Edit text | double-click the text (blur or `Esc` to finish) |
| Add app icon | `+` tile in any cluster or Tools box |
| Move app icon | drag an icon tile onto another cluster or a Tools box |
| Delete icon | right-click an icon tile |
| Node menu | right-click a node (add child note, add big note, duplicate, delete) |
| Undo / redo | `Ctrl/Cmd+Z` / `Ctrl/Cmd+Shift+Z` |
| Delete node | select node, `Backspace` / `Delete` |

## Project structure

```
src/
  types.ts                  board / node / icon domain types
  data/
    seedBoard.ts            seeded "Marketing" board (mirrors the reference)
    appIcons.ts             built-in app logo library (generated)
  store/
    useBoardStore.ts        zustand store: nodes, edges, history, boards, io
    persist.ts              localStorage autosave
  components/
    CanvasBoard.tsx         React Flow canvas + viewport + context menu
    TopBar.tsx              board tabs, undo/redo, export/import
    Icons.tsx               draggable icon tiles + drop grids
    AppPicker.tsx           searchable app picker + custom URL
    EditableText.tsx        inline contentEditable editor
    TrunkEdge.tsx           elbow connector (trunk + branches)
    nodes/                  RootNode, ClusterNode, ColumnNode, CardNode, NoteNode
  utils/geometry.ts         nearest-node search for auto-connecting new notes
scripts/gen-icons.cjs       regenerates src/data/appIcons.ts from simple-icons
```

## Persistence format

`localStorage["business-os:v3"]` and exported JSON both look like:

```json
{
  "boards": [
    {
      "id": "…",
      "name": "Marketing",
      "nodes": [{ "id": "…", "type": "column", "position": { "x": 0, "y": 0 }, "data": { "kind": "column", "…": "…" } }],
      "edges": [{ "id": "…", "source": "…", "target": "…", "type": "trunk" }],
      "viewport": { "x": 0, "y": 0, "zoom": 0.32 }
    }
  ],
  "activeBoardId": "…"
}
```

## Roadmap ideas

Backend sync (Supabase/SQLite), freeform connectors with drag-to-link handles,
custom fonts upload, and light theme (not planned for v1).