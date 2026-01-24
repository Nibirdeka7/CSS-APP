// src/pages/MatchDashboard.jsx
import { MatchCard } from '../components/MatchCard';

export const MatchDashboard = () => {
  // Pulling state from Zustand
  const activeMatches = useAdminStore((state) => state.activeMatches);

  return (
    <div className="max-w-6xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Match Control Center</h1>
          <p className="text-gray-500">Manage live scores and tournament progress</p>
        </div>
        <button className="px-6 py-3 bg-black text-white rounded-xl font-bold hover:scale-105 transition-transform">
          + Schedule New Match
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map through active matches */}
        {activeMatches.map(m => (
          <MatchCard key={m._id} match={m} />
        ))}
      </div>
    </div>
  );
};