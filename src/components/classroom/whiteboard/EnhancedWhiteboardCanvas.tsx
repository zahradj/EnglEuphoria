import React, { useRef, useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { ZoomIn, ZoomOut, Move, RotateCcw, Download, Type, X, ExternalLink, FileText } from "lucide-react";
import { Document, Page, pdfjs } from 'react-pdf';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface EmbeddedContent {
  id: string;
  title: string;
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fileType?: string;
  originalType?: string;
}

interface EnhancedWhiteboardCanvasProps {
  activeTool: "pencil" | "eraser" | "text" | "highlighter" | "shape" | "move";
  color: string;
  strokeWidth?: number;
  children?: React.ReactNode;
  embeddedContent?: EmbeddedContent[];
  onRemoveEmbeddedContent?: (id: string) => void;
}

export function EnhancedWhiteboardCanvas({ 
  activeTool, 
  color, 
  strokeWidth = 3,
  children,
  embeddedContent = [],
  onRemoveEmbeddedContent
}: EnhancedWhiteboardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const [textInput, setTextInput] = useState({ show: false, x: 0, y: 0, value: "" });
  const [pdfPages, setPdfPages] = useState<Record<string, number>>({});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Increased canvas size for bigger whiteboard
    canvas.width = 2400;
    canvas.height = 1600;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getCanvasPosition = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - pan.x) / zoom,
      y: (e.clientY - rect.top - pan.y) / zoom
    };
  }, [pan, zoom]);

  const startDrawing = useCallback((e: React.MouseEvent) => {
    if (activeTool === 'text') {
      const pos = getCanvasPosition(e);
      setTextInput({ show: true, x: pos.x, y: pos.y, value: "" });
      return;
    }

    if (activeTool === 'move' || e.button === 1) {
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    const pos = getCanvasPosition(e);

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = strokeWidth;

    if (activeTool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = strokeWidth * 3;
    } else if (activeTool === "highlighter") {
      ctx.globalCompositeOperation = "multiply";
      ctx.strokeStyle = color + "40";
      ctx.lineWidth = strokeWidth * 2;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
    }

    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }, [activeTool, color, strokeWidth, getCanvasPosition]);

  const draw = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;
      setPan(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      return;
    }

    if (!isDrawing || activeTool === 'text' || activeTool === 'move') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pos = getCanvasPosition(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }, [isDrawing, isPanning, activeTool, lastPanPoint, getCanvasPosition]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
    setIsPanning(false);
  }, []);

  const handleZoom = (direction: 'in' | 'out') => {
    const factor = direction === 'in' ? 1.2 : 0.8;
    const newZoom = Math.min(Math.max(zoom * factor, 0.2), 3);
    setZoom(newZoom);
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataURL = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "whiteboard-export.png";
    link.href = dataURL;
    link.click();
  };

  const addText = () => {
    const canvas = canvasRef.current;
    if (!canvas || !textInput.value) {
      setTextInput({ show: false, x: 0, y: 0, value: "" });
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.font = "16px Arial";
    ctx.fillStyle = color;
    ctx.fillText(textInput.value, textInput.x, textInput.y);
    
    setTextInput({ show: false, x: 0, y: 0, value: "" });
  };

  const openInNewTab = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg border shadow-sm overflow-hidden">
      {/* Minimized Control Bar */}
      <div className="flex items-center justify-between px-2 py-1 bg-gradient-to-r from-slate-50 to-slate-100 border-b">
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1 bg-white rounded border shadow-sm p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleZoom('out')}
              className="h-5 w-5 p-0"
            >
              <ZoomOut size={10} />
            </Button>
            <Badge variant="secondary" className="px-1 py-0 text-xs font-medium min-w-[40px] text-center text-[10px]">
              {Math.round(zoom * 100)}%
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleZoom('in')}
              className="h-5 w-5 p-0"
            >
              <ZoomIn size={10} />
            </Button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="h-6 px-2 bg-white text-xs"
          >
            <RotateCcw size={10} className="mr-1" />
            Reset
          </Button>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={clearCanvas}
            className="h-6 px-2 bg-white hover:bg-red-50 hover:border-red-200 text-xs"
          >
            Clear
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadCanvas}
            className="h-6 px-2 bg-white text-xs"
          >
            <Download size={10} className="mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Maximized Canvas Container */}
      <div 
        ref={containerRef}
        className="flex-1 relative bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden"
        style={{ cursor: activeTool === 'move' ? 'grab' : 'default', minHeight: '600px' }}
      >
        {/* Grid Background */}
        <div 
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: `${25 * zoom}px ${25 * zoom}px`,
            transform: `translate(${pan.x}px, ${pan.y}px)`
          }}
        />
        
        {/* Larger Main Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute border-2 border-gray-200 bg-white shadow-lg rounded-lg"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            cursor: activeTool === 'pencil' ? 'crosshair' : 
                   activeTool === 'eraser' ? 'grab' :
                   activeTool === 'text' ? 'text' :
                   activeTool === 'move' ? 'grab' : 'default'
          }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
        
        {/* Text Input */}
        {textInput.show && (
          <div 
            className="absolute z-20 bg-white border-2 border-blue-400 rounded shadow-lg"
            style={{
              left: `${textInput.x * zoom + pan.x}px`,
              top: `${textInput.y * zoom + pan.y}px`,
            }}
          >
            <Input
              value={textInput.value}
              onChange={(e) => setTextInput(prev => ({ ...prev, value: e.target.value }))}
              onBlur={addText}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  addText();
                }
              }}
              className="text-sm border-0 focus-visible:ring-0 min-w-[200px]"
              placeholder="Type here..."
              autoFocus
            />
          </div>
        )}
        
        {/* Scaled Embedded Content Container */}
        <div 
          className="absolute"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0'
          }}
        >
          {/* Embedded Content */}
          {embeddedContent.map((content) => {
            const scaledWidth = Math.max(800, content.width);
            const scaledHeight = Math.max(600, content.height);
            
            // Determine content type from stored metadata or fallback to URL/title detection
            const isImage = content.fileType?.startsWith('image/') || content.originalType === 'image' || (content.url && content.url.includes('image/')) || (content.url && /\.(jpg|jpeg|png|gif|webp)$/i.test(content.url));
            const isPDF = content.fileType?.includes('pdf') || content.originalType === 'pdf' || (content.url && content.url.includes('.pdf')) || (content.title && content.title.toLowerCase().endsWith('.pdf'));
            const isOfficeDoc = content.fileType?.includes('officedocument') || content.originalType === 'document' || (content.title && /\.(doc|docx|ppt|pptx|xls|xlsx)$/i.test(content.title));
            
            return (
              <div
                key={content.id}
                className="absolute border-2 border-blue-500 rounded-lg bg-white shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-200"
                style={{
                  left: `${content.x}px`,
                  top: `${content.y}px`,
                  width: `${scaledWidth}px`,
                  height: `${scaledHeight}px`,
                  minWidth: '800px',
                  minHeight: '600px'
                }}
              >
                {/* Header */}
                <div className="h-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-2 h-2 bg-white rounded-full opacity-75"></div>
                    <span className="font-medium text-sm truncate">{content.title}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openInNewTab(content.url)}
                      className="h-6 w-6 p-0 text-white hover:bg-blue-600 opacity-75 hover:opacity-100"
                    >
                      <ExternalLink size={12} />
                    </Button>
                    {onRemoveEmbeddedContent && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onRemoveEmbeddedContent(content.id)}
                        className="h-6 w-6 p-0 text-white hover:bg-red-500 opacity-75 hover:opacity-100"
                      >
                        <X size={12} />
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Content Body */}
                <div className="w-full h-[calc(100%-2rem)] bg-gray-50 flex items-center justify-center">
                  {isImage ? (
                    <img
                      src={content.url}
                      alt={content.title}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : isPDF ? (
                    <div className="w-full h-full">
                      <Document
                        file={content.url}
                        onLoadSuccess={({ numPages }) => {
                          setPdfPages(prev => ({ ...prev, [content.id]: numPages }));
                        }}
                        className="flex items-center justify-center h-full"
                        loading={
                          <div className="flex items-center justify-center h-full">
                            <div className="text-gray-500">Loading PDF...</div>
                          </div>
                        }
                        error={
                          <div className="flex flex-col items-center justify-center h-full text-gray-600">
                            <FileText size={48} className="mb-2 text-blue-500" />
                            <p className="text-sm mb-2">Unable to display PDF</p>
                            <Button
                              size="sm"
                              onClick={() => openInNewTab(content.url)}
                              className="bg-blue-500 hover:bg-blue-600 text-white"
                            >
                              <ExternalLink size={16} className="mr-2" />
                              Open in New Tab
                            </Button>
                          </div>
                        }
                      >
                        <Page
                          pageNumber={1}
                          width={Math.min(scaledWidth - 40, 760)}
                          className="border-0"
                        />
                      </Document>
                    </div>
                  ) : isOfficeDoc ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-600">
                      <FileText size={64} className="mb-4 text-blue-500" />
                      <p className="text-lg font-semibold mb-2">Office Document</p>
                      <p className="text-sm mb-4">{content.title}</p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => openInNewTab(content.url)}
                          className="bg-blue-500 hover:bg-blue-600 text-white"
                        >
                          <ExternalLink size={16} className="mr-2" />
                          Open Document
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <iframe
                      src={content.url}
                      className="w-full h-full border-0"
                      title={content.title}
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                      referrerPolicy="strict-origin-when-cross-origin"
                    />
                  )}
                </div>
              </div>
            );
          })}

          {children}
        </div>
      </div>
      
      {/* Minimized Status Bar */}
      <div className="flex items-center justify-between px-2 py-1 bg-gradient-to-r from-slate-50 to-slate-100 border-t text-xs">
        <div className="flex items-center gap-2">
          <span className="text-gray-600 text-xs">
            <span className="font-medium capitalize text-gray-800">{activeTool}</span>
          </span>
          <span className="inline-block w-2 h-2 rounded-full border" style={{ backgroundColor: color }}></span>
        </div>
        <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs px-2 py-0">
          Enhanced Canvas 2400×1600 • {embeddedContent.length} embedded items
        </Badge>
      </div>
    </div>
  );
}
