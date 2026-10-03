import { Helmet } from 'react-helmet-async';
import { Users } from 'lucide-react';
import { FamilyProfilePicker } from '@/components/family/FamilyProfilePicker';

const WhoIsLearning = () => (
  <>
    <Helmet>
      <title>Who’s learning today? | EnglEuphoria</title>
      <meta name="robots" content="noindex" />
    </Helmet>
    <main className="min-h-dvh bg-background px-4 py-10" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 40px)' }}>
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Users className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-bold">Who’s learning today?</h1>
          <p className="mt-1 text-muted-foreground">Tap your name to start.</p>
        </div>
        <FamilyProfilePicker />
      </div>
    </main>
  </>
);

export default WhoIsLearning;
