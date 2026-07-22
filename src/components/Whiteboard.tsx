
import { SimpleWhiteboardToolbar } from "./whiteboard/SimpleWhiteboardToolbar";
import { SimpleWhiteboardCanvas } from "./whiteboard/SimpleWhiteboardCanvas";
import { useSimpleWhiteboard } from "./whiteboard/useSimpleWhiteboard";

interface WhiteboardProps {
  className?: string;
}

export function Whiteboard({ className = "" }: WhiteboardProps) {
  const {
    isDrawing,
    setIsDrawing,
    tool,
    setTool,
    color,
    setColor,
    canvasRef,
    clearCanvas,
    downloadCanvas,
    handleCanvasClick,
    isAddingText,
    setIsAddingText,
    textContent,
    setTextContent,
    textPosition,
    textInputRef,
    addTextToCanvas,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp
  } = useSimpleWhiteboard();
  
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <SimpleWhiteboardToolbar
        tool={tool}
        setTool={setTool}
        color={color}
        setColor={setColor}
        clearCanvas={clearCanvas}
        downloadCanvas={downloadCanvas}
      />
      
      <SimpleWhiteboardCanvas
        canvasRef={canvasRef}
        isDrawing={isDrawing}
        setIsDrawing={setIsDrawing}
        tool={tool}
        color={color}
        handleCanvasClick={handleCanvasClick}
        isAddingText={isAddingText}
        textPosition={textPosition}
        textContent={textContent}
        setTextContent={setTextContent}
        textInputRef={textInputRef}
        addTextToCanvas={addTextToCanvas}
        handleMouseDown={handleMouseDown}
        handleMouseMove={handleMouseMove}
        handleMouseUp={handleMouseUp}
      />
    </div>
  );
}
