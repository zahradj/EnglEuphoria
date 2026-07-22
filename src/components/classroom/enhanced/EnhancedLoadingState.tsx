
import React from "react";
import { Card } from "@/components/ui/card";
import { Sparkles, BookOpen } from "lucide-react";

export function EnhancedLoadingState() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-6rem)] animate-fade-in">
      {/* Left Panel Skeleton */}
      <div className="lg:col-span-3">
        <div className="h-full space-y-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 glass-enhanced backdrop-blur-xl border-0 shadow-xl rounded-3xl animate-pulse">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded-lg w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Center Panel Skeleton */}
      <div className="lg:col-span-6">
        <Card className="h-full glass-enhanced backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-white/30">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center animate-pulse">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div className="space-y-2">
                <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-48 animate-pulse"></div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4 bg-gray-100 rounded-2xl animate-pulse">
                  <div className="space-y-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-lg mx-auto"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-2 bg-gray-200 rounded w-3/4 mx-auto"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 p-6 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div className="h-4 bg-gray-200 rounded w-48 mx-auto mb-2 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-32 mx-auto animate-pulse"></div>
            </div>
          </div>
        </Card>
      </div>

      {/* Right Panel Skeleton */}
      <div className="lg:col-span-3">
        <Card className="h-full glass-enhanced backdrop-blur-xl border-0 shadow-xl rounded-3xl overflow-hidden animate-pulse">
          <div className="p-4 space-y-4">
            <div className="aspect-video bg-gray-200 rounded-2xl"></div>
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex-1 h-8 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
          <div className="flex-1 p-4 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
