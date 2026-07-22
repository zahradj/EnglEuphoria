import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { X, Keyboard } from "lucide-react";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = [
  {
    category: "Whiteboard",
    items: [
      { keys: ["Ctrl", "Z"], description: "Undo last action" },
      { keys: ["Ctrl", "Y"], description: "Redo action" },
      { keys: ["P"], description: "Select Pencil tool" },
      { keys: ["H"], description: "Select Highlighter" },
      { keys: ["E"], description: "Select Eraser" },
      { keys: ["T"], description: "Select Text tool" },
      { keys: ["L"], description: "Select Line tool" },
      { keys: ["A"], description: "Select Arrow tool" },
      { keys: ["R"], description: "Select Rectangle" },
      { keys: ["C"], description: "Select Circle" },
    ]
  },
  {
    category: "Lesson Slides",
    items: [
      { keys: ["←"], description: "Previous slide" },
      { keys: ["→"], description: "Next slide" },
      { keys: ["Home"], description: "First slide" },
      { keys: ["End"], description: "Last slide" },
      { keys: ["F11"], description: "Toggle fullscreen" },
      { keys: ["Esc"], description: "Exit fullscreen" },
      { keys: ["1-9"], description: "Jump to slide" },
    ]
  },
  {
    category: "General",
    items: [
      { keys: ["Tab"], description: "Navigate between tools" },
      { keys: ["Space"], description: "Pan canvas (when zoomed)" },
      { keys: ["Ctrl", "+"], description: "Zoom in" },
      { keys: ["Ctrl", "-"], description: "Zoom out" },
    ]
  }
];

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <GlassCard
        className="max-w-3xl w-full max-h-[80vh] overflow-auto p-6 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-classroom-primary/20 flex items-center justify-center">
              <Keyboard className="w-5 h-5 text-classroom-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Keyboard Shortcuts</h2>
              <p className="text-sm text-muted-foreground">Quick reference guide</p>
            </div>
          </div>
          <GlassButton variant="default" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </GlassButton>
        </div>

        {/* Shortcuts Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {shortcuts.map((section) => (
            <div key={section.category}>
              <h3 className="text-lg font-semibold mb-3 text-classroom-accent">
                {section.category}
              </h3>
              <div className="space-y-2">
                {section.items.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg glass-light hover:glass transition-all"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <kbd
                          key={keyIndex}
                          className="px-2 py-1 text-xs font-semibold rounded neumorphic min-w-[2rem] text-center"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Tips */}
        <GlassCard variant="light" className="mt-6 p-4 bg-gradient-to-br from-classroom-success/20 to-classroom-accent/20">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <span className="text-classroom-success">💡</span>
            Pro Tips
          </h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Hold <kbd className="text-xs px-1 py-0.5 rounded neumorphic">Shift</kbd> while drawing lines for perfect horizontal/vertical</li>
            <li>• Use <kbd className="text-xs px-1 py-0.5 rounded neumorphic">Space</kbd> + drag to pan the canvas when zoomed in</li>
            <li>• Press number keys <kbd className="text-xs px-1 py-0.5 rounded neumorphic">1-9</kbd> to quickly jump to slides</li>
            <li>• Hover over tools in the toolbar to see keyboard shortcuts</li>
          </ul>
        </GlassCard>
      </GlassCard>
    </div>
  );
}
