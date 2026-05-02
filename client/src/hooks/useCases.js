import { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export function useCases() {
  const [allCases, setAllCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCases = useCallback(async (forceRefresh = false) => {
    try {
      setError(null);
      const url = `${API_URL}/api/cases${forceRefresh ? '?refresh=true' : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setAllCases(data.cases || []);
      setRefreshing(data.refreshInProgress || false);
    } catch (err) {
      setError(err.message || 'Failed to load cases');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  return { allCases, loading, error, refreshing, refetch: fetchCases };
}

export function filterCases(cases, filters) {
  const { state, ageMin, ageMax, gender, dateFrom, dateTo } = filters;

  return cases.filter(c => {
    if (state && c.state !== state) return false;

    if (gender && gender !== 'all') {
      const g = (c.gender || '').toLowerCase();
      if (gender === 'male' && g !== 'male') return false;
      if (gender === 'female' && g !== 'female') return false;
    }

    // Age filter
    if (ageMin !== undefined || ageMax !== undefined) {
      const ageStr = c.age || '';
      let lo, hi;
      try {
        if (ageStr.includes('–') || ageStr.includes('-')) {
          const parts = ageStr.replace('–', '-').split('-');
          lo = parseInt(parts[0]);
          hi = parseInt(parts[1]);
        } else {
          lo = hi = parseInt(ageStr);
        }
        if (isNaN(lo)) return true; // unknown age passes through
        if (ageMin !== undefined && hi < ageMin) return false;
        if (ageMax !== undefined && lo > ageMax) return false;
      } catch {
        return true;
      }
    }

    // Date filter
    if (dateFrom || dateTo) {
      const raw = c.dateMissing;
      if (!raw) return true;
      try {
        const d = new Date(raw);
        if (dateFrom && d < new Date(dateFrom)) return false;
        if (dateTo && d > new Date(dateTo)) return false;
      } catch {
        return true;
      }
    }

    return true;
  });
}
