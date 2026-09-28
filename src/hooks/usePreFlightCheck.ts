import { useState, useRef, useCallback, useEffect } from 'react';

type DeviceStatus = 'idle' | 'checking' | 'passed' | 'failed';

interface MediaDeviceInfo {
  deviceId: string;
  label: string;
  kind: string;
}

interface ConnectionQuality {
  status: 'good' | 'fair' | 'poor' | 'unknown';
  downlink?: number;
  rtt?: number;
}

interface PreFlightState {
  cameraStatus: DeviceStatus;
  micStatus: DeviceStatus;
  speakerStatus: DeviceStatus;
  videoStream: MediaStream | null;
  audioLevel: number;
  cameraError: string | null;
  micError: string | null;
  runCameraCheck: (deviceIdOverride?: string) => Promise<void>;
  runMicCheck: (deviceIdOverride?: string) => Promise<void>;
  confirmSpeaker: () => void;
  playSpeakerTest: () => void;
  allPassed: boolean;
  cleanup: () => void;
  // Device enumeration
  videoDevices: MediaDeviceInfo[];
  audioInputDevices: MediaDeviceInfo[];
  audioOutputDevices: MediaDeviceInfo[];
  selectedVideoDevice: string;
  selectedAudioInput: string;
  selectedAudioOutput: string;
  setSelectedVideoDevice: (id: string) => void;
  setSelectedAudioInput: (id: string) => void;
  setSelectedAudioOutput: (id: string) => void;
  // Connection
  connectionQuality: ConnectionQuality;
}

export const usePreFlightCheck = (): PreFlightState => {
  const [cameraStatus, setCameraStatus] = useState<DeviceStatus>('idle');
  const [micStatus, setMicStatus] = useState<DeviceStatus>('idle');
  const [speakerStatus, setSpeakerStatus] = useState<DeviceStatus>('idle');
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);

  // Device lists
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioInputDevices, setAudioInputDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioOutputDevices, setAudioOutputDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedVideoDevice, setSelectedVideoDevice] = useState('');
  const [selectedAudioInput, setSelectedAudioInput] = useState('');
  const [selectedAudioOutput, setSelectedAudioOutput] = useState('');

  // Connection quality
  const [connectionQuality, setConnectionQuality] = useState<ConnectionQuality>({ status: 'unknown' });

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>();
  const micStreamRef = useRef<MediaStream | null>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);

  // Enumerate devices
  useEffect(() => {
    const enumerate = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        setVideoDevices(devices.filter(d => d.kind === 'videoinput' && d.deviceId).map((d, i) => ({
          deviceId: d.deviceId,
          label: d.label || `Camera ${i + 1}`,
          kind: d.kind,
        })));
        setAudioInputDevices(devices.filter(d => d.kind === 'audioinput' && d.deviceId).map((d, i) => ({
          deviceId: d.deviceId,
          label: d.label || `Microphone ${i + 1}`,
          kind: d.kind,
        })));
        setAudioOutputDevices(devices.filter(d => d.kind === 'audiooutput' && d.deviceId).map((d, i) => ({
          deviceId: d.deviceId,
          label: d.label || `Speaker ${i + 1}`,
          kind: d.kind,
        })));
      } catch {
        // Device enumeration not supported
      }
    };
    enumerate();
  }, []);

  // Check connection quality
  useEffect(() => {
    const conn = (navigator as any).connection;
    if (conn) {
      const update = () => {
        const downlink = conn.downlink;
        const rtt = conn.rtt;
        let status: ConnectionQuality['status'] = 'good';
        if (downlink < 1 || rtt > 300) status = 'poor';
        else if (downlink < 5 || rtt > 100) status = 'fair';
        setConnectionQuality({ status, downlink, rtt });
      };
      update();
      conn.addEventListener('change', update);
      return () => conn.removeEventListener('change', update);
    } else {
      // Fallback: assume good if API unavailable
      setConnectionQuality({ status: 'good' });
    }
  }, []);

  // Accepts an explicit deviceId so callers switching devices (the Select's
  // onValueChange) can pass the just-picked id directly instead of relying
  // on `selectedVideoDevice` state, which hasn't re-rendered yet at the
  // moment of the click -- calling this right after setSelectedVideoDevice
  // in the same handler would otherwise still see the OLD device via the
  // stale closure. Also stops the previous stream's tracks before opening a
  // new one; many cameras refuse a second concurrent open, which silently
  // made switching devices look like it "didn't work".
  const runCameraCheck = useCallback(async (deviceIdOverride?: string) => {
    setCameraStatus('checking');
    setCameraError(null);
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach(t => t.stop());
      videoStreamRef.current = null;
    }
    const deviceId = deviceIdOverride ?? selectedVideoDevice;
    try {
      const constraints: MediaStreamConstraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : true,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoStreamRef.current = stream;
      setVideoStream(stream);
      setCameraStatus('passed');
      // Re-enumerate after permission grant
      const devices = await navigator.mediaDevices.enumerateDevices();
      setVideoDevices(devices.filter(d => d.kind === 'videoinput' && d.deviceId).map((d, i) => ({
        deviceId: d.deviceId,
        label: d.label || `Camera ${i + 1}`,
        kind: d.kind,
      })));
    } catch (err: any) {
      setCameraError(err.name === 'NotAllowedError'
        ? 'Camera permission denied. Please allow camera access in your browser settings.'
        : 'Camera not found. Please check your device.');
      setCameraStatus('failed');
    }
  }, [selectedVideoDevice]);

  // Same deviceId-override pattern as runCameraCheck, for the same reason —
  // also tears down the previous mic stream, animation loop, and audio
  // context before creating new ones (repeated switches used to leak an
  // AudioContext + a stacked requestAnimationFrame loop per switch, on top
  // of reading the stale device).
  const runMicCheck = useCallback(async (deviceIdOverride?: string) => {
    setMicStatus('checking');
    setMicError(null);
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = undefined;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(t => t.stop());
      micStreamRef.current = null;
    }
    const deviceId = deviceIdOverride ?? selectedAudioInput;
    try {
      const constraints: MediaStreamConstraints = {
        audio: deviceId ? { deviceId: { exact: deviceId } } : true,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      micStreamRef.current = stream;

      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const update = () => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setAudioLevel((avg / 255) * 100);
        animFrameRef.current = requestAnimationFrame(update);
      };
      update();
      setMicStatus('passed');
      // Re-enumerate
      const devices = await navigator.mediaDevices.enumerateDevices();
      setAudioInputDevices(devices.filter(d => d.kind === 'audioinput' && d.deviceId).map((d, i) => ({
        deviceId: d.deviceId,
        label: d.label || `Microphone ${i + 1}`,
        kind: d.kind,
      })));
      setAudioOutputDevices(devices.filter(d => d.kind === 'audiooutput' && d.deviceId).map((d, i) => ({
        deviceId: d.deviceId,
        label: d.label || `Speaker ${i + 1}`,
        kind: d.kind,
      })));
    } catch (err: any) {
      setMicError(err.name === 'NotAllowedError'
        ? 'Microphone permission denied. Please allow mic access in your browser settings.'
        : 'Microphone not found. Please check your device.');
      setMicStatus('failed');
    }
  }, [selectedAudioInput]);

  const playSpeakerTest = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(523.25, ctx.currentTime); // C5 note
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.8);
      setTimeout(() => ctx.close(), 1000);
    } catch {
      // Audio playback not supported
    }
  }, []);

  const confirmSpeaker = useCallback(() => {
    setSpeakerStatus('passed');
  }, []);

  const cleanup = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(t => t.stop());
      micStreamRef.current = null;
    }
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach(t => t.stop());
      videoStreamRef.current = null;
    }
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const allPassed = cameraStatus === 'passed' && micStatus === 'passed';

  return {
    cameraStatus,
    micStatus,
    speakerStatus,
    videoStream,
    audioLevel,
    cameraError,
    micError,
    runCameraCheck,
    runMicCheck,
    confirmSpeaker,
    playSpeakerTest,
    allPassed,
    cleanup,
    videoDevices,
    audioInputDevices,
    audioOutputDevices,
    selectedVideoDevice,
    selectedAudioInput,
    selectedAudioOutput,
    setSelectedVideoDevice,
    setSelectedAudioInput,
    setSelectedAudioOutput,
    connectionQuality,
  };
};
