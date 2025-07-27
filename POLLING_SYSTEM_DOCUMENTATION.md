# Polling System Documentation

## Overview
The application uses polling mechanisms to enable real-time features and keep data synchronized. This document explains the different polling systems and their optimizations.

## Current Polling Systems

### 1. Board Content Polling (Real-time Collaboration)
**Purpose**: Enable real-time collaboration by detecting when other users make changes to the board.

**How it works**:
- Polls every 5 seconds when active
- Compares board content hash to detect changes
- Shows refresh notification when changes are detected
- Only runs when there are collaborators or shared access

**Optimization Logic**:
```javascript
// Only poll if:
// 1. User has edit permission (not view-only)
// 2. Board has collaborators OR user is not the owner
const hasCollaborators = selectedBoard.collaborators && selectedBoard.collaborators.length > 0;
const isOwner = selectedBoard.user === userId;
const isSharedAccess = !isOwner || hasCollaborators;

if (sharePermission === 'view' || !isSharedAccess) {
  // Skip polling - no need for real-time updates
  return;
}
```

**When it runs**:
- ✅ Board has collaborators
- ✅ User is accessing shared board (not owner)
- ✅ User has edit permission
- ❌ Single user working alone
- ❌ View-only access

### 2. User Plan Polling (Admin Updates)
**Purpose**: Detect when admin changes user's plan and update UI accordingly.

**How it works**:
- Polls every 60 seconds
- Compares current plan with stored plan
- Shows notification when plan changes
- Updates localStorage and UI state

**Optimization**:
- Reduced frequency from 30s to 60s
- Only updates when plan actually changes
- Shows user notification on plan change

## Logging and Debugging

### Console Logs
The system now includes detailed logging to help debug polling behavior:

```
// Board polling logs
"Skipping board polling - no collaborators or view-only access"
"Starting board polling for real-time collaboration"
"Board content changed - showing refresh notification"
"Stopping board polling"

// Plan polling logs
"Plan updated from Basic to Pro"
```

### When You See Polling Logs
1. **Board access logs** (every 5s): Real-time collaboration is active
2. **Plan check logs** (every 60s): Checking for admin plan updates
3. **Error logs**: Network issues or API problems

## Performance Impact

### Before Optimization
- **Board polling**: Every 5s regardless of need
- **User polling**: Every 30s (duplicate calls)
- **Total API calls**: ~12-15 per minute per user

### After Optimization
- **Board polling**: Only when collaborators exist
- **User polling**: Every 60s, only when needed
- **Total API calls**: ~1-2 per minute for single users

## Configuration

### Polling Intervals
```javascript
// Board content polling (real-time collaboration)
const BOARD_POLLING_INTERVAL = 5000; // 5 seconds

// User plan polling (admin updates)
const PLAN_POLLING_INTERVAL = 60000; // 60 seconds
```

### Disabling Polling
To completely disable polling for development/testing:

```javascript
// In whiteboard.tsx, comment out the polling useEffects
// useEffect(() => {
//   // Board polling logic
// }, [selectedBoard, sharePermission, token, shareToken, lastBoardHash, userId]);

// useEffect(() => {
//   // Plan polling logic
// }, [userPlan, showNotification]);
```

## Requirements and Use Cases

### Real-time Collaboration Requirements
1. **Multiple users editing same board**
2. **Shared board access via share links**
3. **Collaborative editing features**

### Plan Update Requirements
1. **Admin can upgrade user plans**
2. **UI must reflect plan changes immediately**
3. **Feature restrictions based on plan**

## Troubleshooting

### High API Call Volume
**Symptoms**: Too many requests in network tab
**Solutions**:
1. Check if board has unnecessary collaborators
2. Verify polling intervals are correct
3. Ensure polling stops when component unmounts

### Missing Real-time Updates
**Symptoms**: Changes not appearing for collaborators
**Solutions**:
1. Verify board has collaborators
2. Check share permissions
3. Ensure polling is enabled for shared boards

### Plan Changes Not Detected
**Symptoms**: UI doesn't update after admin plan change
**Solutions**:
1. Check plan polling is running
2. Verify API endpoint responses
3. Check console for plan update logs

## Future Improvements

### WebSocket Implementation
For better real-time performance, consider replacing polling with WebSockets:
- Real-time updates without polling
- Lower server load
- Better user experience

### Smart Polling
Implement adaptive polling based on:
- User activity (pause when inactive)
- Network conditions
- Server load

### Caching Strategy
- Cache board content locally
- Only fetch changes since last update
- Reduce unnecessary data transfer 