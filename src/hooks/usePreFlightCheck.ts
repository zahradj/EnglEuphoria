import { useState, useRef, useCallback, useEffect } from 'react';

type DeviceStatus = 'idle' | 'checking' | 'passed' | 'failed';
export type MicTestPhase = 'idle' | 'recording' | 'playing';

/** Input level (0-100) above which we count the microphone as having heard the person. */
const MIC_HEARD_LEVEL = 8;
const MIC_TEST_SECONDS = 3;

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
  /** True once the microphone has picked up speech-level sound since it was last (re)started. */
  micHeard: boolean;
  micTestPhase: MicTestPhase;
  micTestSeconds: number;
  /** Records a few seconds from the chosen microphone, then plays it back on the chosen speaker. */
  runMicRecordTest: () => void;
  /** 'denied' (permission refused) or 'missing' (no device) — the screen words it in the person's language. */
  cameraError: 'denied' | 'missing' | null;
  micError: 'denied' | 'missing' | null;
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
  const [micHeard, setMicHeard] = useState(false);
  const [micTestPhase, setMicTestPhase] = useState<MicTestPhase>('idle');
  const [cameraError, setCameraError] = useState<'denied' | 'missing' | null>(null);
  const [micError, setMicError] = useState<'denied' | 'missing' | null>(null);

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
  const recorderRef = useRef<MediaRecorder | null>(null);
  const playbackRef = useRef<HTMLAudioElement | null>(null);
  const playbackUrlRef = useRef<string | null>(null);
  const selectedOutputRef = useRef('');

  useEffect(() => {
    selectedOutputRef.current = selectedAudioOutput;
  }, [selectedAudioOutput]);

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
      setCameraError(err.name === 'NotAllowedError' ? 'denied' : 'missing');
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
    setMicHeard(false);
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
        const level = (avg / 255) * 100;
        setAudioLevel(level);
        if (level > MIC_HEARD_LEVEL) setMicHeard(true);
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
      setMicError(err.name === 'NotAllowedError' ? 'denied' : 'missing');
      setMicStatus('failed');
    }
  }, [selectedAudioInput]);

  const playSpeakerTest = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      // Play on the speaker the person picked (Chrome/Edge); other browsers use the default output.
      const out = selectedOutputRef.current;
      if (out && typeof (ctx as any).setSinkId === 'function') {
        (ctx as any).setSinkId(out).catch(() => {});
      }
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

  const stopPlayback = useCallback(() => {
    playbackRef.current?.pause();
    playbackRef.current = null;
    if (playbackUrlRef.current) {
      URL.revokeObjectURL(playbackUrlRef.current);
      playbackUrlRef.current = null;
    }
  }, []);

  const runMicRecordTest = useCallback(() => {
    const stream = micStreamRef.current;
    if (!stream || typeof MediaRecorder === 'undefined' || micTestPhase !== 'idle') return;
    stopPlayback();
    const chunks: Blob[] = [];
    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(stream);
    } catch {
      return;
    }
    recorderRef.current = recorder;
    recorder.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
    recorder.onstop = () => {
      recorderRef.current = null;
      if (!chunks.length) { setMicTestPhase('idle'); return; }
      const url = URL.createObjectURL(new Blob(chunks, { type: recorder.mimeType || 'audio/webm' }));
      playbackUrlRef.current = url;
      const audio = new Audio(url);
      playbackRef.current = audio;
      const done = () => { setMicTestPhase('idle'); stopPlayback(); };
      audio.onended = done;
      audio.onerror = done;
      const out = selectedOutputRef.current;
      const start = () => { setMicTestPhase('playing'); audio.play().catch(done); };
      if (out && typeof (audio as any).setSinkId === 'function') {
        (audio as any).setSinkId(out).catch(() => {}).finally(start);
      } else {
        start();
      }
    };
    setMicTestPhase('recording');
    recorder.start();
    setTimeout(() => { if (recorder.state === 'recording') recorder.stop(); }, MIC_TEST_SECONDS * 1000);
  }, [micTestPhase, stopPlayback]);

  const confirmSpeaker = useCallback(() => {
    setSpeakerStatus('passed');
  }, []);

  const cleanup = useCallback(() => {
    if (recorderRef.current) {
      recorderRef.current.onstop = null;
      if (recorderRef.current.state === 'recording') recorderRef.current.stop();
      recorderRef.current = null;
    }
    stopPlayback();
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
  }, [stopPlayback]);

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
    micHeard,
    micTestPhase,
    micTestSeconds: MIC_TEST_SECONDS,
    runMicRecordTest,
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
