import { useDispatch, useSelector, useStore } from 'react-redux';
import type { RootState, AppDispatch, AppStore } from './store';

// Typed useDispatch hook
export const useAppDispatch = () => useDispatch<AppDispatch>();

// Typed useSelector hook
export const useAppSelector: <T>(selector: (state: RootState) => T) => T = useSelector;

// Typed useStore hook
export const useAppStore = () => useStore<AppStore>();
