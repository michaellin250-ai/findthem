import { useState, useMemo, useCallback } from 'react';
import Map from './components/Map';
import Navbar from './components/Navbar';
import StatsStrip from './components/StatsStrip';
import Sidebar from './components/Sidebar';
import CasePanel from './components/CasePanel';
import LoadingSkeleton from './components/LoadingSkeleton';
import AboutModal from './components/AboutModal';
import BottomBar from './components/BottomBar';
import { useCases, filterCases } from './hooks/useCases';

const DEFAULT_FILTERS = {
  state: '',
  gender: 'all',
  race: '',
  ageMin: 0,
  ageMax: 100,
  dateFrom: '',
  dateTo: '',
};

class ErrorBoundary extends Error {}

export default function App() {
  const { allCases, loading, error } = useCases();

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [selectedCase, setSelectedCase] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showAbout, setShowAbout] = useState(false);

  const visibleCases = useMemo(
    () => filterCases(allCases, filters),
    [allCases, filters]
  );

  const handleCaseSelect = useCallback((caseData) => {
    setSelectedCase(caseData);
    // Close sidebar on mobile when panel opens
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedCase(null);
  }, []);

  // Dismiss panel when clicking the map background
  const handleMapClick = useCallback(() => {
    setSelectedCase(null);
  }, []);

  if (loading || error) {
    return <LoadingSkeleton error={error} />;
  }

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: '#0a0a14' }}>

      {/* Full-screen map */}
      <div className="absolute inset-0" onClick={handleMapClick}>
        <Map
          cases={visibleCases}
          onCaseSelect={handleCaseSelect}
          selectedCase={selectedCase}
        />
      </div>

      {/* Navbar — top */}
      <Navbar
        totalCases={allCases.length}
        visibleCases={visibleCases.length}
        onAboutClick={() => setShowAbout(true)}
        onSidebarToggle={() => setSidebarOpen(o => !o)}
        sidebarOpen={sidebarOpen}
      />

      {/* Stats strip — below navbar */}
      <StatsStrip
        allCases={allCases}
        visibleCases={visibleCases}
        loading={loading}
      />

      {/* Left filter sidebar */}
      <Sidebar
        open={sidebarOpen}
        filters={filters}
        onChange={setFilters}
      />

      {/* Right case detail panel */}
      {selectedCase && (
        <CasePanel
          caseData={selectedCase}
          onClose={handleClosePanel}
        />
      )}

      {/* Bottom attribution bar */}
      <BottomBar onAboutClick={() => setShowAbout(true)} />

      {/* About modal */}
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
    </div>
  );
}
