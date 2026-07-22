
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Mail, Calendar, FileText, ArrowLeft } from "lucide-react";

interface ApplicationSuccessProps {
  applicationId: string | null;
}

export const ApplicationSuccess: React.FC<ApplicationSuccessProps> = ({ applicationId }) => {
  const navigate = useNavigate();

  const nextSteps = [
    {
      icon: Mail,
      title: "Email Confirmation",
      description: "You'll receive a confirmation email within 30 minutes with your application details."
    },
    {
      icon: FileText,
      title: "Application Review",
      description: "Our hiring team will review your application within 3-5 business days."
    },
    {
      icon: Calendar,
      title: "Interview Invitation",
      description: "Qualified candidates will be contacted to schedule a virtual interview and demo lesson."
    }
  ];

  return (
    <main className="flex-1 py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Application Submitted Successfully!
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Thank you for your interest in joining the EnglEuphoria teaching team.
          </p>
          {applicationId && (
            <p className="text-gray-500">
              Application ID: <span className="font-mono font-semibold">{applicationId}</span>
            </p>
          )}
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>What Happens Next?</CardTitle>
            <CardDescription>
              Here's what you can expect in the coming days:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {nextSteps.map((step, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <step.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {step.title}
                    </h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Important Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Application Review Process</h4>
              <p className="text-blue-800">
                Our hiring team carefully reviews each application to ensure the best fit for our students. 
                We'll evaluate your qualifications, experience, and teaching philosophy.
              </p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Interview Process</h4>
              <p className="text-green-800">
                If selected, you'll participate in a virtual interview where you'll meet our team and 
                conduct a short demo lesson to showcase your teaching skills.
              </p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">Questions?</h4>
              <p className="text-purple-800">
                If you have any questions about your application or the process, feel free to reach out 
                to our support team at{' '}
                <a href="mailto:support@engleuphoria.com" className="underline font-semibold">
                  support@engleuphoria.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-4">
          <Button 
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Home
          </Button>
          
          <p className="text-gray-600">
            We'll be in touch soon. Thank you for choosing EnglEuphoria!
          </p>
        </div>
      </div>
    </main>
  );
};
