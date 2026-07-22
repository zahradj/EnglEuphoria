import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RotateCcw, Camera, Mic } from "lucide-react";

interface Props {
  cameras: MediaDeviceInfo[];
  microphones: MediaDeviceInfo[];
  selectedCameraId: string | null;
  selectedMicId: string | null;
  onChangeCamera: (id: string) => void;
  onChangeMic: (id: string) => void;
  onRefresh: () => void;
}

export function DeviceSelector({
  cameras,
  microphones,
  selectedCameraId,
  selectedMicId,
  onChangeCamera,
  onChangeMic,
  onRefresh,
}: Props) {
  const camItems = cameras.length ? cameras : [];
  const micItems = microphones.length ? microphones : [];

  return (
    <section className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-medium">Device selection</h2>
        <Button variant="outline" size="sm" onClick={onRefresh} aria-label="Refresh devices">
          <RotateCcw size={16} className="mr-2" /> Refresh
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm mb-1 block">Camera</label>
          <Select value={selectedCameraId ?? undefined} onValueChange={onChangeCamera}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select camera" />
            </SelectTrigger>
            <SelectContent className="z-50 bg-popover text-popover-foreground">
              {camItems.map((d, idx) => (
                <SelectItem key={d.deviceId || idx} value={d.deviceId}>
                  <span className="inline-flex items-center gap-2"><Camera size={14} />{d.label || `Camera ${idx + 1}`}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm mb-1 block">Microphone</label>
          <Select value={selectedMicId ?? undefined} onValueChange={onChangeMic}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select microphone" />
            </SelectTrigger>
            <SelectContent className="z-50 bg-popover text-popover-foreground">
              {micItems.map((d, idx) => (
                <SelectItem key={d.deviceId || idx} value={d.deviceId}>
                  <span className="inline-flex items-center gap-2"><Mic size={14} />{d.label || `Microphone ${idx + 1}`}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-3">Tip: if names are empty, allow camera/mic permission first, then refresh.</p>
    </section>
  );
}
