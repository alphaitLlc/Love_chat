import AgoraRTC, { IAgoraRTCClient, IAgoraRTCRemoteUser, ICameraVideoTrack, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';
import { apiWrapper } from './api';

// Initialize Agora client
AgoraRTC.setLogLevel(4); // Set log level to ERROR

// Create Agora client
const client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });

export const agoraService = {
  // Initialize client and join channel
  joinChannel: async (channelName: string, uid: string, token: string, role: 'host' | 'audience' = 'audience') => {
    try {
      // Set client role
      await client.setClientRole(role);
      
      // Join channel
      await client.join(
        import.meta.env.VITE_AGORA_APP_ID || 'mock-app-id',
        channelName,
        token,
        uid
      );
      
      // Create local tracks if host
      let localTracks: [IMicrophoneAudioTrack, ICameraVideoTrack] | null = null;
      
      if (role === 'host') {
        localTracks = await AgoraRTC.createMicrophoneAndCameraTracks();
        
        // Publish local tracks
        await client.publish(localTracks);
      }
      
      return {
        client,
        localTracks
      };
    } catch (error) {
      console.error('Error joining Agora channel:', error);
      throw error;
    }
  },
  
  // Leave channel and clean up
  leaveChannel: async (localTracks?: [IMicrophoneAudioTrack, ICameraVideoTrack]) => {
    try {
      // Unpublish and close local tracks
      if (localTracks) {
        await client.unpublish(localTracks);
        localTracks.forEach(track => track.close());
      }
      
      // Leave channel
      await client.leave();
    } catch (error) {
      console.error('Error leaving Agora channel:', error);
      throw error;
    }
  },
  
  // Get Agora token from backend
  getAgoraToken: async (channelName: string, uid: string, role: 'host' | 'audience' = 'audience') => {
    try {
      const response = await apiWrapper.post('/live-streams/token', {
        channelName,
        uid,
        role
      });
      
      // Ensure we have a valid token from the response
      const token = response.data?.token;
      if (typeof token === 'string' && token.length > 0) {
        return token;
      }
      
      // If no valid token from API, return mock token
      return 'mock-agora-token-' + Date.now();
    } catch (error) {
      console.error('Error getting Agora token:', error);
      
      // For development, return a mock token with timestamp to ensure uniqueness
      return 'mock-agora-token-' + Date.now();
    }
  },
  
  // Mute/unmute audio
  toggleAudio: async (track?: IMicrophoneAudioTrack) => {
    if (!track) return;
    
    if (track.isPlaying) {
      track.setMuted(true);
    } else {
      track.setMuted(false);
    }
  },
  
  // Enable/disable video
  toggleVideo: async (track?: ICameraVideoTrack) => {
    if (!track) return;
    
    if (track.isPlaying) {
      track.setMuted(true);
    } else {
      track.setMuted(false);
    }
  },
  
  // Switch camera
  switchCamera: async (track?: ICameraVideoTrack) => {
    if (!track) return;
    
    await track.switchDevice('video', track.getDeviceId() === 'default' ? 'environment' : 'default');
  }
};

export default agoraService;