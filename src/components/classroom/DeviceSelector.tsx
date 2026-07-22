import React, { useEffect, useState, useCallback } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings, Mic, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DeviceSelectorProps {
  /** Current live stream — used to detect the active devices. */
  stream: MediaStream | null;
  /** Hot-swap the live camera. */
  onSwitchCamera: (deviceId: string) => Promise<boolean>;
  /** Hot-swap the live microphone. */
  onSwitchMicrophone: (deviceId: string) => Promise<boolean>;
  /** Optional className overrides for the trigger button. */
  className?: string;
}

const CAMERA_KEY = "preferredCameraId";
const MIC_KEY = "preferredMicId";

/**
 * Settings popover that lets the user pick which camera / microphone to use.
 * Reads available devices via `navigator.mediaDevices.enumerateDevices()` and
 * hot-swaps the active media track without rejoining the call.
 */
export const DeviceSelector: React.FC<DeviceSelectorProps> = ({
  stream,
  onSwitchCamera,
  onSwitchMicrophone,
  className = "",
}) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [selectedMicId, setSelectedMicId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const refreshDevices = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      setCameras(devices.filter((d) => d.kind === "videoinput"));
      setMics(devices.filter((d) => d.kind === "audioinput"));
    } catch (err) {
      console.error("Failed to enumerate devices", err);
    }
  }, []);

  // Detect the device IDs currently active in the live stream so the
  // dropdowns reflect reality rather than just localStorage.
  useEffect(() => {
    const videoId = stream?.getVideoTracks()[0]?.getSettings().deviceId;
    const audioId = stream?.getAudioTracks()[0]?.getSettings().deviceId;
    if (videoId) setSelectedCameraId(videoId);
    else setSelectedCameraId(localStorage.getItem(CAMERA_KEY) || "");
    if (audioId) setSelectedMicId(audioId);
    else setSelectedMicId(localStorage.getItem(MIC_KEY) || "");
  }, [stream]);

  // Load the device list when the popover opens (labels are only revealed
  // after permission is granted, which has happened by this point).
  useEffect(() => {
    if (open) void refreshDevices();
  }, [open, refreshDevices]);

  // Re-enumerate when devices are plugged/unplugged.
  useEffect(() => {
    if (!navigator.mediaDevices?.addEventListener) return;
    const handler = () => void refreshDevices();
    navigator.mediaDevices.addEventListener("devicechange", handler);
    return () => navigator.mediaDevices.removeEventListener("devicechange", handler);
  }, [refreshDevices]);

  const handleCameraChange = async (deviceId: string) => {
    setLoading(true);
    const ok = await onSwitchCamera(deviceId);
    setLoading(false);
    if (ok) {
      setSelectedCameraId(deviceId);
      toast({ title: "Camera switched", description: "Now using the selected camera." });
    } else {
      toast({
        title: "Couldn't switch camera",
        description: "The selected camera may be in use by another app.",
        variant: "destructive",
      });
    }
  };

  const handleMicChange = async (deviceId: string) => {
    setLoading(true);
    const ok = await onSwitchMicrophone(deviceId);
    setLoading(false);
    if (ok) {
      setSelectedMicId(deviceId);
      toast({ title: "Microphone switched", description: "Now using the selected microphone." });
    } else {
      toast({
        title: "Couldn't switch microphone",
        description: "The selected microphone may be in use by another app.",
        variant: "destructive",
      });
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 ${className}`}
          title="Audio & video settings"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 space-y-4" align="end">
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-gray-900">Audio & Video</h4>
          <p className="text-xs text-gray-500">Choose which camera and microphone to use.</p>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-xs font-medium text-gray-700">
            <Camera className="h-3.5 w-3.5" /> Camera
          </Label>
          <Select
            value={selectedCameraId}
            onValueChange={handleCameraChange}
            disabled={loading || cameras.length === 0}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={cameras.length === 0 ? "No cameras detected" : "Select a camera"} />
            </SelectTrigger>
            <SelectContent>
              {cameras.map((cam) => (
                <SelectItem key={cam.deviceId} value={cam.deviceId}>
                  {cam.label || `Camera (${cam.deviceId.slice(0, 6)}…)`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-xs font-medium text-gray-700">
            <Mic className="h-3.5 w-3.5" /> Microphone
          </Label>
          <Select
            value={selectedMicId}
            onValueChange={handleMicChange}
            disabled={loading || mics.length === 0}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={mics.length === 0 ? "No microphones detected" : "Select a microphone"} />
            </SelectTrigger>
            <SelectContent>
              {mics.map((mic) => (
                <SelectItem key={mic.deviceId} value={mic.deviceId}>
                  {mic.label || `Microphone (${mic.deviceId.slice(0, 6)}…)`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <p className="text-[11px] text-gray-400 leading-relaxed">
          Tip: if a device doesn't appear, make sure your browser has permission to use it.
        </p>
      </PopoverContent>
    </Popover>
  );
};
