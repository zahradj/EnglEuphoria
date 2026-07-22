
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, Download, Share, Calendar } from "lucide-react";

export const CertificatesTab = () => {
  const certificates = [
    {
      id: 1,
      title: "English A1 Completion",
      level: "A1",
      completionDate: "Nov 15, 2024",
      issuer: "Engleuphoria",
      status: "completed"
    }
  ];

  const inProgress = [
    {
      id: 2,
      title: "English A2 Completion", 
      level: "A2",
      progress: 68,
      expectedCompletion: "Feb 2025",
      status: "in-progress"
    }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Certificates</h1>
      
      {/* Completed Certificates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            Completed Certificates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {certificates.map((cert) => (
              <div key={cert.id} className="flex items-center justify-between p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                    <Award className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{cert.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                        Level {cert.level}
                      </Badge>
                      <span className="text-sm text-gray-600 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {cert.completionDate}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Share className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                  <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* In Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-blue-500" />
            In Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {inProgress.map((cert) => (
              <div key={cert.id} className="flex items-center justify-between p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                    <Award className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{cert.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="bg-blue-100 text-blue-800">
                        Level {cert.level}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        Expected: {cert.expectedCompletion}
                      </span>
                    </div>
                    <div className="w-48 bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${cert.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-lg font-semibold text-blue-600">{cert.progress}%</p>
                  <p className="text-sm text-gray-500">Complete</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
