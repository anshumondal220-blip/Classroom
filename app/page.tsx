import AppMain from '@/components/AppMain';
import { AccessibilityProvider } from '@/context/AccessibilityContext';

export default function HomePage() {
  return (
    <AccessibilityProvider>
      <AppMain />
    </AccessibilityProvider>
  );
}
