import { INITIAL_PORTFOLIO_DATA } from '../data/portfolioData';

const STORAGE_KEY = 'yashraj_portfolio_db_v3';

export function getPortfolioData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Check if previous version exists and migrate
      const prevRaw = localStorage.getItem('yashraj_portfolio_db_v2');
      if (prevRaw) {
        try {
          const parsed = JSON.parse(prevRaw);
          if (parsed.profile) {
            parsed.profile.name = 'Yashraj';
          }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
          return parsed;
        } catch {
          // fallback to initial
        }
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PORTFOLIO_DATA));
      return INITIAL_PORTFOLIO_DATA;
    }
    const data = JSON.parse(raw);
    if (data?.profile?.name && data.profile.name !== 'Yashraj') {
      data.profile.name = 'Yashraj';
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
    return data;
  } catch (e) {
    console.error('Failed to load portfolio data from storage:', e);
    return INITIAL_PORTFOLIO_DATA;
  }
}

export function savePortfolioData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    // Dispatch custom event so all active components update reactively
    window.dispatchEvent(new Event('portfolio_data_updated'));
    return true;
  } catch (e) {
    console.error('Failed to save portfolio data:', e);
    return false;
  }
}

export function resetToDefaults() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PORTFOLIO_DATA));
    window.dispatchEvent(new Event('portfolio_data_updated'));
    return INITIAL_PORTFOLIO_DATA;
  } catch (e) {
    console.error('Failed to reset portfolio data:', e);
    return INITIAL_PORTFOLIO_DATA;
  }
}
