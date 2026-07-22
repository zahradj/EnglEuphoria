import { AdventureMap } from "../components/AdventureMap";

/**
 * /playground/map — the themed roadmap landing surface for the Playground hub.
 * Phase 1 of the Playground premium upgrade. Wires up nothing destructive yet;
 * the existing Playground dashboard remains the default surface.
 */
export default function AdventureMapPage() {
  // TODO Phase 2: derive currentIndex from student_curriculum_progress.
  return (
    <main className="min-h-screen bg-background">
      <AdventureMap currentIndex={1} />
    </main>
  );
}
