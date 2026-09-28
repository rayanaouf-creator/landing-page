import { ProofOfWork } from '../components/ProofOfWork';
import { SaaSSection } from '../components/SaaSSection';

export function Work() {
  return (
    <div className="pt-24 min-h-screen bg-white">
      <ProofOfWork />
      <SaaSSection />
    </div>
  );
}
