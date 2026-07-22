
export const VIDEO_CONFIG = {
  // Jitsi configuration
  jitsi: {
    domain: 'meet.jit.si',
    defaultOptions: {
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        enableWelcomePage: false,
        prejoinPageEnabled: false,
      },
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'hangup', 'chat', 'recording',
          'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
          'videoquality', 'filmstrip', 'feedback', 'stats', 'shortcuts'
        ],
        SETTINGS_SECTIONS: ['devices', 'language', 'moderator', 'profile', 'calendar'],
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
      }
    }
  },
  
  // Room naming convention
  generateRoomName: (classroomId: string, timestamp?: number) => {
    const ts = timestamp || Date.now();
    return `classroom-${classroomId}-${ts}`;
  },
  
  // Default participant limits
  maxParticipants: {
    oneOnOne: 2,
    groupClass: 10,
    webinar: 50
  }
};
