import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase, supabaseUrl, supabaseAnonKey } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle, MailX } from 'lucide-react';

type UnsubStatus = 'loading' | 'valid' | 'already_unsubscribed' | 'invalid' | 'success' | 'error';

const SUPABASE_URL = supabaseUrl;
const SUPABASE_ANON_KEY = supabaseAnonKey;

const UnsubscribePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<UnsubStatus>('loading');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      return;
    }

    const validateToken = async () => {
      try {
        const response = await fetch(
          `${SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${token}`,
          { headers: { apikey: SUPABASE_ANON_KEY } }
        );
        const data = await response.json();

        if (!response.ok) {
          setStatus('invalid');
        } else if (data.valid === false && data.reason === 'already_unsubscribed') {
          setStatus('already_unsubscribed');
        } else if (data.valid) {
          setStatus('valid');
        } else {
          setStatus('invalid');
        }
      } catch {
        setStatus('error');
      }
    };

    validateToken();
  }, [token]);

  const handleUnsubscribe = async () => {
    if (!token) return;
    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('handle-email-unsubscribe', {
        body: { token },
      });

      if (error) {
        setStatus('error');
      } else if (data?.success) {
        setStatus('success');
      } else if (data?.reason === 'already_unsubscribed') {
        setStatus('already_unsubscribed');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Validating your request...</p>
            </>
          )}

          {status === 'valid' && (
            <>
              <MailX className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h2 className="text-xl font-semibold text-foreground mb-2">Unsubscribe from Emails</h2>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to unsubscribe from EnglEuphoria app emails?
              </p>
              <Button
                onClick={handleUnsubscribe}
                disabled={processing}
                className="w-full"
              >
                {processing ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Processing...</>
                ) : (
                  'Confirm Unsubscribe'
                )}
              </Button>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <h2 className="text-xl font-semibold text-foreground mb-2">Unsubscribed</h2>
              <p className="text-muted-foreground">
                You've been successfully unsubscribed from EnglEuphoria app emails.
              </p>
            </>
          )}

          {status === 'already_unsubscribed' && (
            <>
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold text-foreground mb-2">Already Unsubscribed</h2>
              <p className="text-muted-foreground">
                You've already been unsubscribed from these emails.
              </p>
            </>
          )}

          {status === 'invalid' && (
            <>
              <XCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
              <h2 className="text-xl font-semibold text-foreground mb-2">Invalid Link</h2>
              <p className="text-muted-foreground">
                This unsubscribe link is invalid or has expired.
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
              <h2 className="text-xl font-semibold text-foreground mb-2">Something Went Wrong</h2>
              <p className="text-muted-foreground">
                We couldn't process your request. Please try again later.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UnsubscribePage;
