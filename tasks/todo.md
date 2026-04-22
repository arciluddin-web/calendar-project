# Calendar App — Task Checklist

## Task 1: Project Scaffold
- [x] Create `index.html` with DOCTYPE, meta viewport, charset, title
- [x] Link `css/styles.css` in `<head>`
- [x] Add `<script src="js/app.js">` at end of `<body>` (plain script — no modules, works over file://)
- [x] Create `js/app.js` (consolidated: state, rendering, modal, validation, app logic)
- [x] Create `css/styles.css` with `:root` custom properties

**Acceptance criteria:**
- Page loads in browser with no console errors
- Network tab shows all asset files returning 200
- Calendar grid renders with correct month/year in header

---

## Task 2: State Module (localStorage)
- [x] Implement `loadEvents()` with try/catch JSON.parse fallback to `[]`
- [x] Implement `saveEvents(events)`
- [x] Implement `addEvent(obj)` using `crypto.randomUUID()`
- [x] Implement `updateEvent(id, patch)` with object spread merge
- [x] Implement `deleteEvent(id)` using `Array.filter`
- [x] Implement `getEventsForMonth(year, month)` filtering by `YYYY-MM` prefix
- [x] Implement `getEventById(id)`

**Acceptance criteria:**
- `addEvent` stores an item; `loadEvents` retrieves it after page reload
- `deleteEvent` removes only the targeted event, leaving others intact
- `getEventsForMonth` returns only events whose `date` starts with `"YYYY-MM"`
- All functions handle empty or corrupt localStorage without throwing

---

## Task 3: Calendar Grid Rendering
- [x] Implement `buildMonthGrid(year, month)` returning 35 or 42 cell objects
- [x] Correctly pad leading days from the previous month
- [x] Correctly pad trailing days to fill the last week
- [x] Mark `isToday` on the cell matching today's date
- [x] Implement `renderGrid(cells, events)` building HTML via innerHTML
- [x] Implement `updateMonthLabel()` using `Intl.DateTimeFormat`
- [x] Implement `renderCalendar(year, month, events)` calling all three above
- [x] Render event pills inside correct day cells, sorted by time

**Acceptance criteria:**
- First cell of grid is the correct weekday for the 1st of the displayed month
- Today's cell has `day-cell--today` class and a visually distinct day number
- Events appear on their correct dates as colored pills
- Pills show event time prefix when time is set

---

## Task 4: Navigation Controls
- [x] Wire `#btn-prev` to decrement month (with January → December year rollover)
- [x] Wire `#btn-next` to increment month (with December → January year rollover)
- [x] Initialize `currentYear`/`currentMonth` from `new Date()` in `init()`

**Acceptance criteria:**
- Clicking prev/next updates the grid and month label immediately
- Navigating across year boundaries shows the correct year in the label
- Events from one month do not bleed into adjacent months after navigation

---

## Task 5: Modal — Add Event
- [x] Implement `openAddModal(prefillDate?)` — clears form, shows overlay
- [x] Prefill `#field-date` when `prefillDate` is provided (clicking a day cell)
- [x] Implement `closeModal()` — hides overlay and resets form + errors
- [x] Close modal when clicking the overlay background (not the panel itself)
- [x] Close modal on `Escape` keydown

**Acceptance criteria:**
- Clicking "+ Add Event" opens modal with a blank form
- Clicking a day cell opens modal with that date pre-filled
- Clicking the overlay backdrop or pressing Escape closes the modal
- Clicking inside the modal panel does not close it

---

## Task 6: Validation
- [x] Implement `validateEvent()` in `validation.js`
- [x] Title: reject empty / whitespace-only strings, enforce 100-char max
- [x] Date: reject missing, non-matching format, invalid calendar dates (e.g. Feb 30)
- [x] Time: if non-empty, validate `HH:MM` format
- [x] Description: reject if over 500 chars
- [x] Display errors in `#error-title` and `#error-date` spans
- [x] Clear error messages when modal is closed

**Acceptance criteria:**
- Submitting a blank form shows "Title is required" and "Date is required"
- Entering `2026-02-30` shows "Invalid date"
- A valid form with only title + date submits without errors
- Error messages disappear the next time the modal is opened

---

## Task 7: Modal — Edit & Delete Event
- [x] Implement `openEditModal(event)` populating all form fields
- [x] Show `#btn-delete-event` only in edit mode; hide it in add mode
- [x] Implement `handleDelete()` with a `confirm()` dialog before deletion
- [x] Route `handleFormSubmit` to `updateEvent` vs `addEvent` based on `editingId`

**Acceptance criteria:**
- Clicking an event pill opens modal pre-populated with all event data
- Saving changes updates the event in localStorage and re-renders the grid
- Clicking Delete (then confirming) removes the event and closes the modal
- Cancelling the Delete confirm dialog leaves the event intact

---

## Task 8: CSS — Layout, Modal, Responsive
- [x] Implement 7-column calendar grid with CSS Grid
- [x] Style `.day-cell--today` with a distinct purple-tinted background and circle day number
- [x] Style `.day-cell--other-month` with muted background and gray day number
- [x] Style `.modal-overlay` as a fixed fullscreen backdrop
- [x] Style `.modal-panel` centered, scrollable, responsive (`width: min(480px, 100%)`)
- [x] Style `.event-pill` with truncation (`text-overflow: ellipsis`)
- [x] Implement mobile breakpoint ≤640px (shorter cells, smaller pills)
- [x] Implement desktop max-width container ≥1025px (capped at 1200px)
- [x] Style toast notification with `fadeInUp` animation

**Acceptance criteria:**
- Grid renders without horizontal overflow on a 375px-wide screen
- Modal fits within the viewport on mobile
- Event pills truncate long titles with ellipsis
- Today's cell is visually distinct from all other cells

---

## Task 9: Toast Notifications
- [x] Implement `showToast(message, duration)` in `app.js`
- [x] Show toast after add, update, and delete actions
- [x] Auto-dismiss after 2500ms; clear pending timer before showing a new toast

**Acceptance criteria:**
- "Event added" toast appears after adding an event, then disappears
- "Event updated" toast appears after editing an event
- "Event deleted" toast appears after deleting an event
- Rapidly triggering multiple actions does not stack or break the toast

---

## Task 10: Integration & QA
- [ ] Open `index.html` in Chrome and Firefox (file:// — no server required)
- [ ] Add 3 events across different months; reload page; verify all persist
- [ ] Edit each event; verify changes persist after reload
- [ ] Delete an event; verify it is gone after reload
- [ ] Verify no console errors during any normal interaction
- [ ] Verify keyboard accessibility: Tab through modal fields; Escape closes modal
- [ ] Resize viewport to 375px; verify no horizontal overflow

**Acceptance criteria:**
- All previous task acceptance criteria pass end-to-end
- `localStorage.getItem("calendar_events")` returns valid JSON after actions
- App works fully offline (zero network requests after initial page load)
- No JavaScript errors thrown during normal use
