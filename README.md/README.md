# Student Finance Tracker

An accessible, responsive, vanilla HTML/CSS/JS application for tracking student spending. Built as a summative assignment for the ALU ICT Mentorship program.

**Author:** mchristian2-netizen  
**Contact:** m.christian2@alustudent.com

## Setup & Usage
1. Clone the repository.
2. Open `index.html` in your browser (or use a local server like Live Server).
3. No build step or dependencies required.

## Features
- **Dashboard:** Total records, total spend, top category, 7-day trend chart, and budget cap meter.
- **Records:** Responsive table (desktop) and cards (mobile). Sort by date, description, category, or amount.
- **Regex Search:** Live search using real regular expressions with safe compilation and `<mark>` highlighting.
- **Add/Edit Form:** Real-time validation with inline error messages and ARIA live announcements.
- **Settings:** Multi-currency conversion (manual rates), category management, and spending cap.
- **Data Persistence:** Auto-saves to `localStorage`. JSON import/export with structural validation.

## Regex Catalog
| Rule | Pattern | Description |
|------|---------|-------------|
| Description (spaces) | `^\S(?:.*\S)?$` | Forbids leading/trailing spaces |
| Description (letters) | `^(?=.*[A-Za-z])` | Lookahead: must contain at least one letter |
| Description (duplicates) | `\b([A-Za-z]{2,})\s+\1\b` | Back-reference: catches duplicate words like "the the" |
| Amount | `^(0|[1-9]\d*)(\.\d{1,2})?$` | Positive number, up to 2 decimals |
| Date | `^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$` | YYYY-MM-DD format |
| Category | `^[A-Za-z]+(?:[ -][A-Za-z]+)*$` | Letters, spaces, hyphens only |
| Currency Code | `^[A-Z]{3}$` | 3 uppercase letters (e.g. USD) |

## Keyboard Map
- `Tab` / `Shift+Tab`: Navigate all interactive elements.
- `Enter` / `Space`: Activate buttons and submit forms.
- `Skip Link`: Press `Tab` on page load to skip directly to `#main`.
- All actions (edit, delete, sort, search) are reachable via keyboard.

## Accessibility Notes
- **Semantic HTML:** Uses `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`.
- **ARIA Live Regions:** Status messages (`role="status"`) and alerts (`role="alert"`) announce dynamic changes (e.g., "Record added", "Over budget").
- **Focus Management:** Visible focus rings (`:focus-visible`) and logical tab order.
- **Contrast:** All text meets WCAG AA contrast ratios against backgrounds.

## Testing
Open `tests.html` in your browser (via Live Server) to run the assertions on validators and search highlighting logic. (15/15 tests pass).

## Deployment
Deployed to GitHub Pages.