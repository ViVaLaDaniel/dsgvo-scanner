# Feature Plan: Add Re-scan Functionality

## Goal
Allow users to re-scan a website that has already been scanned. Currently, once a scan results in a report, the UI only allows viewing that report, with no option to trigger a fresh scan.

## User Story
As a user, I want to be able to re-scan a client's website (e.g., after they fixed issues) directly from the dashboard list, even if a previous report exists.

## Implementation Steps

1.  **UI Update (`app/dashboard/websites/page.tsx`)**:
    *   Locate the action buttons area for each website card (lines 250-290).
    *   Currently, it conditionally renders *either* "Scan Now" *or* "Bericht" (Report).
    *   **Change**:
        *   If no scan exists: Keep "Scan Now".
        *   If scan exists: Show "Bericht" (Primary) AND allow a "Re-scan" action.
    *   **Design**: Add a secondary button (ghost or outline) with a "Refresh" or "Play" icon next to the "Bericht" button.
    *   **Action**: Clicking this new button should call `startScan(website.id)` (which is already exposed by `useScanner`).

2.  **Logic Update**:
    *   Ensure `handleAction` handles re-scanning correctly (it currently separates based on `scanId` presence).
    *   We can invoke `startScan` directly for the new button.

3.  **Feedback**:
    *   The `isScanning` state already tracks loading per website ID.
    *   The button should show a loading spinner when `isScanning === website.id`.

4.  **Verification**:
    *   Verify the button appears.
    *   Verify it calls the API.
    *   Verify the UI updates after the new scan is complete (via `refreshData` or simpler `router.refresh`).

## Technical Details

### File: `app/dashboard/websites/page.tsx`

**Current Logic:**
```tsx
<Button onClick={() => handleAction(website.id, scan?.id)}>
  {isScanning ? ... : scan ? 'Bericht' : 'Jetzt scannen'}
</Button>
```

**New Logic:**
```tsx
{/* View Report Button (Only if scan exists) */}
{scan && (
  <Button onClick={() => router.push(...) }>
    Bericht
  </Button>
)}

{/* Scan/Rescan Button */}
<Button onClick={() => startScan(website.id)}>
  {scan ? <RefreshCw /> : 'Jetzt scannen'}
</Button>
```

*Refinement*: To save space and keep clean design:
- If scan exists: Show "Bericht" button AND a small "Refresh/Rescan" icon button.
- If no scan: Show large "Jetzt scannen" button.

### DNS Note
The user is currently facing DNS propagation issues (`nslookup` shows Strato parking IP). The features will be implemented but might fail network requests until DNS resolves. We will assume DNS will be fixed shortly.
