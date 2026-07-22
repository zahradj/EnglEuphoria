import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeacherAvailability } from "./TeacherAvailability";
import { SimplifiedTeacherCalendar } from "./calendar/SimplifiedTeacherCalendar";

interface AvailabilityManagerProps {
  teacherId: string;
}

export const AvailabilityManager = ({ teacherId }: AvailabilityManagerProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Availability Management</h2>
        <p className="text-gray-600">Create and manage your teaching schedule with ease.</p>
      </div>
      
      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">Create Availability</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>
        <TabsContent value="create">
          <TeacherAvailability teacherId={teacherId} />
        </TabsContent>
        <TabsContent value="calendar">
          <SimplifiedTeacherCalendar teacherId={teacherId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};