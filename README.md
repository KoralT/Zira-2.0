# Zira Prototype

Zira is Sigma's operational product and experience layer.

This repository contains the v1.0 product prototype demonstrating:

- בשבילי — personal operational Attention workspace
- מרחב המפקדה — shared Situation Picture and Situation Assessment
- ניהול מבצעים
- ניהול אירועים / לחימה
- evidence-backed operational meaning
- the canonical Lavi vertical slice:
  observed fact → planned state → relationship → spatial evidence →
  operational signal → attention → human action → continuity

**Important:**
This is a product prototype, not a production implementation of Sigma's
domain platforms or infrastructure.

**Source-of-truth release:** `v1.0.0`

## Run locally

```
npm install
npm run dev
```

Then open the URL printed in the terminal (typically `http://localhost:5173`).
The prototype is fully client-side (React + TypeScript + Vite); there is no
backend, and demo state persists in the browser's `localStorage`.
