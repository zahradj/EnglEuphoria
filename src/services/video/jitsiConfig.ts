
import { EnhancedVideoConfig } from './types';

export class JitsiConfigBuilder {
  static buildOptions(config: EnhancedVideoConfig, container: HTMLElement) {
    const domain = config.domain || 'meet.jit.si';
    
    return {
      roomName: config.roomName,
      width: '100%',
      height: '100%',
      parentNode: container,
      configOverwrite: {
        startWithAudioMuted: true,
        startWithVideoMuted: false,
        enableWelcomePage: false,
        enableUserRolesBasedOnToken: true,
        maxParticipants: config.maxParticipants || 10,
        recording: {
          enabled: config.enableRecording || false
        }
      },
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
          'fodeviceselection', 'hangup', 'profile', 'recording', 'livestreaming',
          'etherpad', 'sharedvideo', 'settings', 'raisehand', 'videoquality',
          'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
          'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone'
        ],
        SETTINGS_SECTIONS: ['devices', 'language', 'moderator', 'profile', 'calendar']
      },
      userInfo: {
        displayName: config.displayName
      }
    };
  }
}
