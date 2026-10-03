import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  submitLabel: string;
  /** Resolve on success; throw an Error to show its message under the boxes. */
  onSubmit: (pin: string) => Promise<void>;
}

export function PinDialog({ open, onOpenChange, title, description, submitLabel, onSubmit }: Props) {
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) { setPin(''); setError(null); }
  }, [open]);

  const submit = async (value = pin) => {
    if (value.length !== 4 || busy) return;
    setBusy(true);
    setError(null);
    try {
      await onSubmit(value);
    } catch (e: any) {
      setError(e?.message ?? 'Something went wrong.');
      setPin('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !busy && onOpenChange(o)}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-3 py-2">
          <InputOTP
            maxLength={4}
            pattern={REGEXP_ONLY_DIGITS}
            inputMode="numeric"
            value={pin}
            onChange={setPin}
            onComplete={submit}
            disabled={busy}
            autoFocus
            aria-label="4-digit PIN"
          >
            <InputOTPGroup>
              {[0, 1, 2, 3].map((i) => (
                <InputOTPSlot key={i} index={i} className="h-14 w-14 text-2xl" />
              ))}
            </InputOTPGroup>
          </InputOTP>
          {error && <p role="alert" className="text-center text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>Cancel</Button>
          <Button onClick={() => submit()} disabled={pin.length !== 4 || busy} className="min-h-[44px]">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
