# WebRTC Video System Documentation

## Overview

This document describes the real-time video/voice communication system built using WebRTC for the Engleuphoria platform.

## Architecture

The video system consists of several key components:

### 1. **WebRTC Signaling Server** (`supabase/functions/webrtc-signaling/index.ts`)
- Manages WebSocket connections for peer-to-peer signaling
- Handles room creation and participant tracking
- Relays SDP offers/answers and ICE candidates between peers
- Deployed as a Supabase Edge Function

### 2. **Peer Connection Manager** (`src/services/video/peerConnectionManager.ts`)
- Manages individual WebRTC peer connections
- Handles ICE negotiation and connection state
- Supports automatic ICE restart on connection failure
- Uses Google STUN servers for NAT traversal

### 3. **RealTime Video Service** (`src/services/video/realTimeVideoService.ts`)
- High-level API for video room management
- Participant tracking and management
- Media control (mute/unmute, camera on/off)
- Connection quality monitoring
- Automatic reconnection support

### 4. **Connection Quality Monitor** (`src/services/video/connectionQualityMonitor.ts`)
- Real-time connection quality metrics
- Tracks packet loss, latency, jitter, and bandwidth
- Provides quality ratings (excellent/good/fair/poor)

### 5. **Reconnection Manager** (`src/services/video/reconnectionManager.ts`)
- Automatic reconnection with exponential backoff
- Configurable retry attempts and delays
- Status callbacks for UI updates

## Usage

### Basic Setup

```typescript
import { realTimeVideoService } from '@/services/video/realTimeVideoService';

// 1. Get local media stream
const stream = await navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
});

// 2. Configure room
const roomId = 'my-room-id';
const userId = 'user-123';
realTimeVideoService.setRoomConfig(roomId, userId, stream);

// 3. Join room
await realTimeVideoService.joinRoom();

// 4. Listen for participants
realTimeVideoService.onParticipantsChange((participants) => {
  console.log('Participants:', participants);
  // Update UI with participant streams
});
```

### Media Controls

```typescript
// Toggle microphone
await realTimeVideoService.toggleMicrophone();

// Toggle camera
await realTimeVideoService.toggleCamera();

// Leave room
await realTimeVideoService.leaveRoom();
```

### Connection Quality Monitoring

```typescript
// Start monitoring
realTimeVideoService.startQualityMonitoring((metrics) => {
  console.log('Quality:', metrics.quality);
  console.log('Latency:', metrics.latency);
  console.log('Packet Loss:', metrics.packetLoss);
});

// Stop monitoring
realTimeVideoService.stopQualityMonitoring();
```

## Components

### ConnectionQualityIndicator

Displays real-time connection quality with detailed metrics.

```tsx
import { ConnectionQualityIndicator } from '@/components/classroom/video/ConnectionQualityIndicator';

<ConnectionQualityIndicator quality={connectionMetrics} />
```

### ReconnectionBanner

Shows reconnection status and progress.

```tsx
import { ReconnectionBanner } from '@/components/classroom/video/ReconnectionBanner';

<ReconnectionBanner 
  reconnectionStatus={status} 
  onRetry={handleRetry}
/>
```

## Testing

### Video Test Page

A dedicated test page is available at `/video-test`:

```
https://your-app.lovable.app/video-test?roomId=test-room-123
```

Features:
- Local video preview
- Remote participant streams
- Media controls (mute/unmute, camera on/off)
- Connection quality metrics
- Debug information

### Testing Workflow

1. **Single User Test**:
   - Navigate to `/video-test?roomId=test-123`
   - Verify local stream appears
   - Check media controls work

2. **Multi-User Test**:
   - Open the same room in two browser tabs/windows
   - Verify peers can see each other
   - Test audio/video transmission
   - Test connection quality indicators

3. **Connection Recovery**:
   - Simulate network disruption
   - Verify automatic reconnection
   - Check reconnection banner displays

## Database Integration

### Teacher Availability

Teachers set availability slots which students can book:

```sql
-- Teacher creates availability
INSERT INTO teacher_availability (
  teacher_id, 
  start_time, 
  end_time, 
  duration,
  is_available
) VALUES (...);

-- Student books lesson (triggers are_availability update)
INSERT INTO lessons (
  teacher_id,
  student_id,
  scheduled_at,
  room_id,
  status
) VALUES (...);
```

### Classroom Sessions

Sessions are tracked in the `classroom_sessions` table:

```sql
CREATE TABLE classroom_sessions (
  id UUID PRIMARY KEY,
  room_id TEXT UNIQUE,
  teacher_id UUID,
  student_id UUID,
  session_status TEXT,
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  ...
);
```

## Configuration

### WebRTC STUN Servers

Default configuration uses Google STUN servers:

```typescript
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};
```

For production, consider adding TURN servers for better NAT traversal.

### Reconnection Settings

Default reconnection configuration:

```typescript
{
  maxAttempts: 5,
  initialDelay: 2000,    // 2 seconds
  maxDelay: 30000,       // 30 seconds
  backoffMultiplier: 2   // Exponential backoff
}
```

## Troubleshooting

### Common Issues

1. **No Video/Audio**
   - Check browser permissions for camera/microphone
   - Verify HTTPS is used (required for getUserMedia)
   - Check if media devices are available

2. **Connection Fails**
   - Verify WebSocket endpoint is accessible
   - Check firewall/network restrictions
   - Ensure STUN servers are reachable

3. **Poor Quality**
   - Check network bandwidth
   - Reduce video resolution
   - Consider adding TURN servers

### Debug Logging

The system includes extensive console logging:

```typescript
// Enable verbose logging
console.log('🎥', '📹', '🔗', '🧊', '📤', '📥', '✅', '❌', '⚠️', '🔄')
```

Filter browser console by emoji to track specific operations.

## Security Considerations

1. **Authentication**: Always verify user authentication before allowing room access
2. **Authorization**: Check user permissions for teacher/student roles
3. **RLS Policies**: Database tables have Row Level Security enabled
4. **HTTPS**: Required for WebRTC functionality
5. **Room Access**: Validate room access permissions

## Performance Optimization

1. **Video Resolution**: Adjust based on network quality
2. **Audio Processing**: Enable echo cancellation and noise suppression
3. **Connection Pooling**: Reuse peer connections when possible
4. **Resource Cleanup**: Properly dispose of streams and connections

## Future Enhancements

- [ ] TURN server integration for better NAT traversal
- [ ] Screen sharing support
- [ ] Recording functionality
- [ ] Virtual backgrounds
- [ ] Breakout rooms
- [ ] Hand raise notifications
- [ ] Chat integration
- [ ] Network quality-based video resolution adjustment

## Support

For issues or questions, check the browser console for debug logs and refer to the WebRTC documentation at https://webrtc.org
