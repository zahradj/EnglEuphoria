import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, Mic, Volume2, Play, Sparkles, CheckCircle2, Circle, Square } from 'lucide-react';
import { usePreFlightCheck } from '@/hooks/usePreFlightCheck';
import pipMascot from '@/assets/pip-fox-mascot-v2.png';
import ariaOwl from '@/assets/aria-owl-mascot-v2.png';
import maxEagle from '@/assets/max-eagle-mascot-v2.png';

export type HubType = 'playground' | 'academy' | 'professional';

interface PreFlightCheckProps {
  onComplete: () => void;
  hubType?: HubType;
  role?: 'student' | 'teacher';
  lessonTitle?: string;
  startTime?: string;
}

interface HubLook {
  pageBg: string;
  cardGlow: string;
  ring: string;
  title: string;
  pillBg: string;
  bubble: string;
  btn: string;
  mascot: string;
  mascotName: string;
}

const HUB_LOOK: Record<HubType, HubLook> = {
  playground: {
    pageBg:
      'radial-gradient(120% 90% at 0% 0%, #FFE9B8 0%, transparent 55%), radial-gradient(120% 90% at 100% 100%, #FFB779 0%, transparent 55%), linear-gradient(135deg,#FFF8E5,#FFE1C2)',
    cardGlow: '0 30px 80px -20px rgba(254,106,47,0.35)',
    ring: 'rgba(254,106,47,0.25)',
    title: 'text-[#E25410]',
    pillBg: 'bg-orange-100 text-orange-700',
    bubble: 'from-[#FFF6D6] via-[#FFD89B] to-[#FE6A2F]',
    btn: 'bg-gradient-to-r from-[#FE6A2F] to-[#FFB347] hover:from-[#E85A22] text-white shadow-lg shadow-orange-300/40',
    mascot: pipMascot,
    mascotName: 'Pip the Fox',
  },
  academy: {
    pageBg:
      'radial-gradient(120% 90% at 0% 0%, #EDE9FE 0%, transparent 55%), radial-gradient(120% 90% at 100% 100%, #C4B5FD 0%, transparent 55%), linear-gradient(135deg,#FAF5FF,#E9D5FF)',
    cardGlow: '0 30px 80px -20px rgba(107,33,168,0.35)',
    ring: 'rgba(107,33,168,0.25)',
    title: 'text-[#6B21A8]',
    pillBg: 'bg-purple-100 text-purple-700',
    bubble: 'from-[#F5F3FF] via-[#C4B5FD] to-[#6B21A8]',
    btn: 'bg-gradient-to-r from-[#6B21A8] to-[#A855F7] hover:from-[#581C87] text-white shadow-lg shadow-purple-300/40',
    mascot: ariaOwl,
    mascotName: 'Aria the Owl',
  },
  professional: {
    pageBg:
      'radial-gradient(120% 90% at 0% 0%, #D1FAE5 0%, transparent 55%), radial-gradient(120% 90% at 100% 100%, #6EE7B7 0%, transparent 55%), linear-gradient(135deg,#ECFDF5,#A7F3D0)',
    cardGlow: '0 30px 80px -20px rgba(5,150,105,0.35)',
    ring: 'rgba(5,150,105,0.25)',
    title: 'text-[#047857]',
    pillBg: 'bg-emerald-100 text-emerald-700',
    bubble: 'from-[#ECFDF5] via-[#6EE7B7] to-[#059669]',
    btn: 'bg-gradient-to-r from-[#059669] to-[#34D399] hover:from-[#047857] text-white shadow-lg shadow-emerald-300/40',
    mascot: maxEagle,
    mascotName: 'Max the Eagle',
  },
};

export const PreFlightCheck: React.FC<PreFlightCheckProps> = ({
  onComplete,
  hubType = 'academy',
  role = 'student',
  lessonTitle,
  startTime,
}) => {
  const {
    cameraStatus, micStatus, speakerStatus, videoStream, audioLevel,
    micHeard, micTestPhase, micTestSeconds, runMicRecordTest, micError,
    runCameraCheck, runMicCheck, playSpeakerTest, confirmSpeaker,
    cleanup,
    videoDevices, audioInputDevices, audioOutputDevices,
    selectedVideoDevice, selectedAudioInput, selectedAudioOutput,
    setSelectedVideoDevice, setSelectedAudioInput, setSelectedAudioOutput,
  } = usePreFlightCheck();

  const videoRef = useRef<HTMLVideoElement>(null);
  const [speakerPlayed, setSpeakerPlayed] = useState(false);
  const [speakerNotHeard, setSpeakerNotHeard] = useState(false);

  const cameraOk = cameraStatus === 'passed';
  const micOk = micStatus === 'passed' && micHeard;
  const speakerOk = speakerStatus === 'passed';
  const allReady = cameraOk && micOk && speakerOk;
  const checks = [
    { key: 'camera', label: 'Camera', ok: cameraOk },
    { key: 'mic', label: 'Microphone', ok: micOk },
    { key: 'speaker', label: 'Speaker', ok: speakerOk },
  ];

  useEffect(() => {
    void runCameraCheck();
    void runMicCheck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream;
    }
  }, [videoStream]);

  const handleJoin = () => {
    cleanup();
    onComplete();
  };

  const headline = lessonTitle
    ? `Your next class "${lessonTitle}"${startTime ? ` starts at ${startTime}` : ''}`
    : role === 'teacher'
      ? 'Get ready to enter the classroom'
      : 'Your class is about to begin';

  const look = HUB_LOOK[hubType];

  return (
    <div className="min-h-dvh flex flex-col relative overflow-hidden" style={{ background: look.pageBg }}>
      {/* Header pill */}
      <header className="px-6 py-4 flex items-center justify-center">
        <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.18em] px-3 py-1.5 rounded-full ${look.pillBg}`}>
          <Sparkles className="h-3.5 w-3.5" /> Waiting room
        </span>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-10">
        {/* Character bubble */}
        <div className="relative mb-5">
          <div
            className={`w-32 h-32 rounded-full bg-gradient-to-br ${look.bubble} ring-[5px] ring-white flex items-center justify-center overflow-hidden`}
            style={{ boxShadow: look.cardGlow }}
            aria-label={look.mascotName}
          >
            <img src={look.mascot} alt={look.mascotName} className="w-28 h-28 object-contain drop-shadow-md select-none" draggable={false} loading="lazy" />
          </div>
        </div>

        <h1 className={`text-2xl md:text-3xl font-extrabold text-center mb-1 ${look.title}`}>{headline}</h1>
        <p className="text-sm text-slate-600 mb-8 text-center max-w-md">
          Take a moment to check your camera, mic and speakers — {look.mascotName.split(' ')[0]} will be ready when you are.
        </p>

        {/* Glass card */}
        <div
          className="w-full max-w-4xl rounded-3xl bg-white/85 backdrop-blur-xl p-6 md:p-8"
          style={{ boxShadow: look.cardGlow, border: `1px solid ${look.ring}` }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Camera preview */}
            <div className="rounded-2xl overflow-hidden bg-slate-900 aspect-video shadow-inner ring-1 ring-slate-200">
              {videoStream ? (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                  style={{ transform: 'scaleX(-1)' }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/60 text-sm">
                  {cameraStatus === 'failed' ? 'Camera unavailable' : 'Starting camera…'}
                </div>
              )}
            </div>

            {/* Devices */}
            <div className="space-y-5">
              <h2 className="text-base font-bold text-foreground">Choose your devices</h2>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Camera className="h-4 w-4" /> Video device
                </label>
                <Select value={selectedVideoDevice} onValueChange={(v) => { setSelectedVideoDevice(v); void runCameraCheck(v); }}>
                  <SelectTrigger className="h-10 rounded-xl bg-white/80">
                    <SelectValue placeholder="Select camera" />
                  </SelectTrigger>
                  <SelectContent>
                    {videoDevices.map(d => (
                      <SelectItem key={d.deviceId} value={d.deviceId}>{d.label || 'Camera'}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Mic className="h-4 w-4" /> Microphone
                </label>
                <Select value={selectedAudioInput} onValueChange={(v) => { setSelectedAudioInput(v); void runMicCheck(v); }}>
                  <SelectTrigger className="h-10 rounded-xl bg-white/80">
                    <SelectValue placeholder="Select microphone" />
                  </SelectTrigger>
                  <SelectContent>
                    {audioInputDevices.map(d => (
                      <SelectItem key={d.deviceId} value={d.deviceId}>{d.label || 'Microphone'}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden" aria-label="Microphone input level">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-[width] duration-75"
                    style={{ width: `${Math.min(100, Math.max(4, audioLevel))}%` }}
                  />
                </div>
                {micStatus === 'failed' ? (
                  <p className="text-xs text-red-600" role="alert">{micError}</p>
                ) : micHeard ? (
                  <p className="text-xs text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> We can hear you.
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">Say “Hello!” — the bar should move.</p>
                )}
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 w-full rounded-xl"
                  onClick={runMicRecordTest}
                  disabled={micStatus !== 'passed' || micTestPhase !== 'idle'}
                >
                  {micTestPhase === 'recording' ? (
                    <><Square className="h-4 w-4 mr-1 text-red-500" /> Recording… speak for {micTestSeconds} seconds</>
                  ) : micTestPhase === 'playing' ? (
                    <><Volume2 className="h-4 w-4 mr-1" /> Playing it back…</>
                  ) : (
                    <><Mic className="h-4 w-4 mr-1" /> Record {micTestSeconds} seconds and play it back</>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground">Use headphones if you hear an echo.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Volume2 className="h-4 w-4" /> Speaker
                </label>
                <div className="flex gap-2">
                  <Select value={selectedAudioOutput} onValueChange={setSelectedAudioOutput}>
                    <SelectTrigger className="h-10 flex-1 rounded-xl bg-white/80">
                      <SelectValue placeholder="Select speaker" />
                    </SelectTrigger>
                    <SelectContent>
                      {audioOutputDevices.map(d => (
                        <SelectItem key={d.deviceId} value={d.deviceId}>{d.label || 'Speaker'}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="outline" className="h-10 shrink-0 rounded-xl" onClick={() => { playSpeakerTest(); setSpeakerPlayed(true); setSpeakerNotHeard(false); }}>
                    <Play className="h-4 w-4 mr-1" /> Test
                  </Button>
                </div>
                {speakerOk ? (
                  <p className="text-xs text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Speaker works.
                  </p>
                ) : speakerPlayed ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-foreground">Did you hear the tone?</span>
                    <Button type="button" size="sm" className="h-8 rounded-full" onClick={() => { confirmSpeaker(); setSpeakerNotHeard(false); }}>
                      Yes
                    </Button>
                    <Button type="button" size="sm" variant="outline" className="h-8 rounded-full" onClick={() => setSpeakerNotHeard(true)}>
                      No
                    </Button>
                    {speakerNotHeard && (
                      <p className="w-full text-xs text-red-600" role="alert">
                        Turn the volume up, check your headphones, or pick another speaker, then press Test again.
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Click Test — you should hear a short tone.</p>
                )}
              </div>

              <div className="pt-4 border-t border-slate-200/70 space-y-3">
                <ul className="flex flex-wrap gap-x-4 gap-y-1" aria-label="Check list">
                  {checks.map(c => (
                    <li key={c.key} className={`flex items-center gap-1.5 text-sm ${c.ok ? 'text-emerald-700 font-semibold' : 'text-muted-foreground'}`}>
                      {c.ok ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                      {c.label}
                    </li>
                  ))}
                </ul>
                <Button onClick={handleJoin} disabled={!allReady} className={`w-full h-11 rounded-full ${look.btn}`}>
                  Join lesson
                </Button>
                {!allReady && (
                  <button
                    type="button"
                    onClick={handleJoin}
                    className="block mx-auto text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                  >
                    Skip the check and join anyway
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
