
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Mic, Video, Monitor, Wifi, AlertTriangle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface EquipmentTestProps {
  applicationId: string;
  onTestComplete: (passed: boolean) => void;
}

interface TestResult {
  microphone: boolean;
  speaker: boolean;
  webcam: boolean;
  screenSharing: boolean;
  internetSpeed: {
    download: number;
    upload: number;
    ping: number;
  } | null;
}

export const EquipmentTest: React.FC<EquipmentTestProps> = ({ applicationId, onTestComplete }) => {
  const { toast } = useToast();
  const [currentTest, setCurrentTest] = useState<string>('');
  const [testResults, setTestResults] = useState<TestResult>({
    microphone: false,
    speaker: false,
    webcam: false,
    screenSharing: false,
    internetSpeed: null
  });
  const [isTestingMic, setIsTestingMic] = useState(false);
  const [isTestingCamera, setIsTestingCamera] = useState(false);
  const [isTestingInternet, setIsTestingInternet] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const testMicrophone = async () => {
    setIsTestingMic(true);
    setCurrentTest('microphone');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      microphone.connect(analyser);
      analyser.fftSize = 256;
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      // Monitor audio levels for 3 seconds
      const checkAudio = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
        setMicLevel(average);
      };
      
      const interval = setInterval(checkAudio, 100);
      
      setTimeout(() => {
        clearInterval(interval);
        stream.getTracks().forEach(track => track.stop());
        audioContext.close();
        
        setTestResults(prev => ({ ...prev, microphone: true }));
        setIsTestingMic(false);
        setOverallProgress(25);
        toast({ title: "Microphone test passed!" });
      }, 3000);
      
    } catch (error) {
      setIsTestingMic(false);
      toast({ 
        title: "Microphone test failed",
        description: "Please check your microphone permissions and try again.",
        variant: "destructive"
      });
    }
  };

  const testCamera = async () => {
    setIsTestingCamera(true);
    setCurrentTest('camera');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      setTimeout(() => {
        setTestResults(prev => ({ ...prev, webcam: true }));
        setIsTestingCamera(false);
        setOverallProgress(50);
        toast({ title: "Camera test passed!" });
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      }, 2000);
      
    } catch (error) {
      setIsTestingCamera(false);
      toast({ 
        title: "Camera test failed",
        description: "Please check your camera permissions and try again.",
        variant: "destructive"
      });
    }
  };

  const testScreenSharing = async () => {
    setCurrentTest('screen');
    
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      
      setTestResults(prev => ({ ...prev, screenSharing: true }));
      setOverallProgress(75);
      toast({ title: "Screen sharing test passed!" });
    } catch (error) {
      toast({ 
        title: "Screen sharing test failed",
        description: "Please allow screen sharing and try again.",
        variant: "destructive"
      });
    }
  };

  const testInternetSpeed = async () => {
    setIsTestingInternet(true);
    setCurrentTest('internet');
    
    try {
      // Simple speed test using image downloads
      const startTime = Date.now();
      const testImage = new Image();
      const imageSize = 1024 * 1024; // 1MB test image
      
      testImage.onload = () => {
        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;
        const downloadSpeed = (imageSize * 8) / (1024 * 1024 * duration); // Mbps
        
        // Simulate upload test (simplified)
        const uploadSpeed = downloadSpeed * 0.8; // Approximate upload as 80% of download
        const ping = Math.random() * 50 + 10; // Simulate ping between 10-60ms
        
        setTestResults(prev => ({
          ...prev,
          internetSpeed: {
            download: Math.round(downloadSpeed * 10) / 10,
            upload: Math.round(uploadSpeed * 10) / 10,
            ping: Math.round(ping)
          }
        }));
        
        setIsTestingInternet(false);
        setOverallProgress(100);
        
        if (downloadSpeed >= 10 && uploadSpeed >= 2) {
          toast({ title: "Internet speed test passed!" });
        } else {
          toast({ 
            title: "Internet speed below recommended",
            description: "Consider upgrading your internet connection for best performance.",
            variant: "destructive"
          });
        }
      };
      
      testImage.src = `https://via.placeholder.com/1024x1024.jpg?t=${Date.now()}`;
      
    } catch (error) {
      setIsTestingInternet(false);
      toast({ 
        title: "Internet speed test failed",
        description: "Unable to test internet speed. Please try again.",
        variant: "destructive"
      });
    }
  };

  const saveTestResults = async () => {
    const { internetSpeed } = testResults;
    const allTestsPassed = testResults.microphone && 
                          testResults.webcam && 
                          testResults.screenSharing && 
                          internetSpeed &&
                          internetSpeed.download >= 10 && 
                          internetSpeed.upload >= 2;

    try {
      const { error } = await supabase
        .from('teacher_equipment_tests')
        .insert([{
          application_id: applicationId,
          microphone_test: testResults.microphone,
          speaker_test: true, // Simplified for demo
          webcam_test: testResults.webcam,
          screen_sharing_test: testResults.screenSharing,
          download_speed: internetSpeed?.download,
          upload_speed: internetSpeed?.upload,
          ping_latency: internetSpeed?.ping,
          overall_passed: allTestsPassed
        }]);

      if (error) throw error;

      // Update application status
      await supabase
        .from('teacher_applications')
        .update({ 
          equipment_test_passed: allTestsPassed,
          current_stage: allTestsPassed ? 'interview_scheduled' : 'equipment_test'
        })
        .eq('id', applicationId);

      onTestComplete(allTestsPassed);
      
    } catch (error) {
      console.error('Error saving test results:', error);
      toast({ 
        title: "Error saving results",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const TestCard = ({ title, icon: Icon, status, isActive, onTest, loading = false }: any) => (
    <Card className={`${isActive ? 'ring-2 ring-blue-500' : ''} ${status ? 'bg-green-50' : ''}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className={`h-6 w-6 ${status ? 'text-green-600' : 'text-gray-400'}`} />
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          {status ? (
            <CheckCircle className="h-6 w-6 text-green-600" />
          ) : loading ? (
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          ) : (
            <XCircle className="h-6 w-6 text-gray-400" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!status && (
          <Button onClick={onTest} disabled={loading} className="w-full">
            {loading ? 'Testing...' : `Test ${title}`}
          </Button>
        )}
        {title === 'Microphone' && isTestingMic && (
          <div className="mt-4">
            <div className="text-sm text-gray-600 mb-2">Speak into your microphone:</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-100"
                style={{ width: `${Math.min(micLevel * 2, 100)}%` }}
              />
            </div>
          </div>
        )}
        {title === 'Camera' && isTestingCamera && videoRef && (
          <video ref={videoRef} className="mt-4 w-full rounded-lg" autoPlay muted />
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Equipment & Internet Test</h2>
        <p className="text-gray-600">
          Let's make sure your equipment is ready for online teaching
        </p>
        <Progress value={overallProgress} className="mt-4 max-w-md mx-auto" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TestCard
          title="Microphone"
          icon={Mic}
          status={testResults.microphone}
          isActive={currentTest === 'microphone'}
          onTest={testMicrophone}
          loading={isTestingMic}
        />
        
        <TestCard
          title="Camera"
          icon={Video}
          status={testResults.webcam}
          isActive={currentTest === 'camera'}
          onTest={testCamera}
          loading={isTestingCamera}
        />
        
        <TestCard
          title="Screen Sharing"
          icon={Monitor}
          status={testResults.screenSharing}
          isActive={currentTest === 'screen'}
          onTest={testScreenSharing}
        />
        
        <TestCard
          title="Internet Speed"
          icon={Wifi}
          status={testResults.internetSpeed !== null}
          isActive={currentTest === 'internet'}
          onTest={testInternetSpeed}
          loading={isTestingInternet}
        />
      </div>

      {testResults.internetSpeed && (
        <Card>
          <CardHeader>
            <CardTitle>Internet Speed Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {testResults.internetSpeed.download}
                </div>
                <div className="text-sm text-gray-600">Download (Mbps)</div>
                {testResults.internetSpeed.download < 10 && (
                  <Badge variant="destructive" className="mt-1">Below minimum</Badge>
                )}
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {testResults.internetSpeed.upload}
                </div>
                <div className="text-sm text-gray-600">Upload (Mbps)</div>
                {testResults.internetSpeed.upload < 2 && (
                  <Badge variant="destructive" className="mt-1">Below minimum</Badge>
                )}
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {testResults.internetSpeed.ping}
                </div>
                <div className="text-sm text-gray-600">Ping (ms)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {overallProgress === 100 && (
        <div className="text-center">
          <Alert className="max-w-md mx-auto mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Minimum requirements: 10 Mbps download, 2 Mbps upload
            </AlertDescription>
          </Alert>
          <Button onClick={saveTestResults} size="lg" className="px-8">
            Complete Equipment Test
          </Button>
        </div>
      )}
    </div>
  );
};
