import React, { createContext, ReactNode, useContext, useEffect, useReducer } from 'react';

import { User } from '@/types';

// Types

interface BusinessType {
    value: string;
    label: string;
}

interface OrganizationFormData {
    id?: string;
    name: string;
    slug: string;
    business_type: string;
    registration_code: string;
    description?: string;
}

interface MemberInvite {
    email: string;
    role: string;
}

type OnboardingStep = 'choose-action' | 'create-organization' | 'join-organization' | 'invite-members' | 'complete';

interface OnboardingState {
    currentStep: OnboardingStep;
    user: User | null;
    businessTypes: BusinessType[];
    organizationData: OrganizationFormData | null;
    invitations: MemberInvite[];
    isLoading: boolean;
    error: string | null;
}

// Actions
type OnboardingAction =
    | { type: 'SET_STEP'; payload: OnboardingStep }
    | { type: 'SET_USER'; payload: User }
    | { type: 'SET_BUSINESS_TYPES'; payload: BusinessType[] }
    | { type: 'SET_ORGANIZATION_DATA'; payload: OrganizationFormData }
    | { type: 'SET_INVITATIONS'; payload: MemberInvite[] }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'RESET_STATE' }
    | { type: 'LOAD_FROM_STORAGE'; payload: Partial<OnboardingState> };

// Initial state
const initialState: OnboardingState = {
    currentStep: 'create-organization',
    user: null,
    businessTypes: [],
    organizationData: null,
    invitations: [],
    isLoading: false,
    error: null,
};

// Reducer
function onboardingReducer(state: OnboardingState, action: OnboardingAction): OnboardingState {
    switch (action.type) {
        case 'SET_STEP':
            return { ...state, currentStep: action.payload };
        case 'SET_USER':
            return { ...state, user: action.payload };
        case 'SET_BUSINESS_TYPES':
            return { ...state, businessTypes: action.payload };
        case 'SET_ORGANIZATION_DATA':
            return { ...state, organizationData: action.payload };
        case 'SET_INVITATIONS':
            return { ...state, invitations: action.payload };
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload };
        case 'RESET_STATE':
            return initialState;
        case 'LOAD_FROM_STORAGE':
            return { ...state, ...action.payload };
        default:
            return state;
    }
}

// Context
interface OnboardingContextType {
    state: OnboardingState;
    dispatch: React.Dispatch<OnboardingAction>;
    // Helper functions
    setStep: (step: OnboardingStep) => void;
    setOrganizationData: (data: OrganizationFormData) => void;
    setInvitations: (invitations: MemberInvite[]) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    resetState: () => void;
    // Navigation helpers
    goToNextStep: () => void;
    goToPreviousStep: () => void;
    canGoNext: () => boolean;
    canGoPrevious: () => boolean;
    // Persistence
    saveToStorage: () => void;
    loadFromStorage: () => void;
    clearStorage: () => void;
    clearAllOnboardingStorage: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

// Storage key function - user-specific storage
const getStorageKey = (userId: string | number | null): string | null => {
    return userId ? `portzapp_onboarding_state_${userId}` : null;
};

// Step order for navigation
const stepOrder: OnboardingStep[] = ['choose-action', 'create-organization', 'join-organization', 'invite-members', 'complete'];

interface OnboardingProviderProps {
    children: ReactNode;
    initialUser?: User;
    initialBusinessTypes?: BusinessType[];
}

export function OnboardingProvider({ children, initialUser, initialBusinessTypes = [] }: OnboardingProviderProps) {
    const [state, dispatch] = useReducer(onboardingReducer, initialState);

    // Initialize state
    useEffect(() => {
        if (initialUser) {
            dispatch({ type: 'SET_USER', payload: initialUser });

            // Check if this is a different user and clear invalid storage
            const currentStorageKeys = Object.keys(localStorage).filter((key) => key.startsWith('portzapp_onboarding_state_'));

            const currentUserKey = getStorageKey(initialUser.id);
            currentStorageKeys.forEach((key) => {
                if (key !== currentUserKey) {
                    try {
                        const saved = localStorage.getItem(key);
                        if (saved) {
                            const parsed = JSON.parse(saved);
                            // Remove storage for other users or expired data
                            const savedTime = new Date(parsed.timestamp || 0);
                            const now = new Date();
                            const hoursDiff = (now.getTime() - savedTime.getTime()) / (1000 * 60 * 60);

                            if (hoursDiff >= 24 || parsed.userId !== initialUser.id) {
                                localStorage.removeItem(key);
                            }
                        }
                    } catch {
                        // Remove corrupted data
                        localStorage.removeItem(key);
                    }
                }
            });
        }
        if (initialBusinessTypes.length > 0) {
            dispatch({ type: 'SET_BUSINESS_TYPES', payload: initialBusinessTypes });
        }
    }, [initialUser, initialBusinessTypes]);

    // Load from storage on mount
    useEffect(() => {
        loadFromStorage();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Auto-save to storage when state changes
    useEffect(() => {
        if (state.currentStep !== 'create-organization' || state.organizationData || state.invitations.length > 0) {
            saveToStorage();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state]);

    // Helper functions
    const setStep = (step: OnboardingStep) => {
        dispatch({ type: 'SET_STEP', payload: step });
    };

    const setOrganizationData = (data: OrganizationFormData) => {
        dispatch({ type: 'SET_ORGANIZATION_DATA', payload: data });
    };

    const setInvitations = (invitations: MemberInvite[]) => {
        dispatch({ type: 'SET_INVITATIONS', payload: invitations });
    };

    const setLoading = (loading: boolean) => {
        dispatch({ type: 'SET_LOADING', payload: loading });
    };

    const setError = (error: string | null) => {
        dispatch({ type: 'SET_ERROR', payload: error });
    };

    const resetState = () => {
        dispatch({ type: 'RESET_STATE' });
        clearStorage();
    };

    // Navigation helpers
    const getCurrentStepOrder = () => {
        return stepOrder;
    };

    const goToNextStep = () => {
        const order = getCurrentStepOrder();
        const currentIndex = order.indexOf(state.currentStep);
        if (currentIndex < order.length - 1) {
            setStep(order[currentIndex + 1]);
        }
    };

    const goToPreviousStep = () => {
        const order = getCurrentStepOrder();
        const currentIndex = order.indexOf(state.currentStep);
        if (currentIndex > 0) {
            setStep(order[currentIndex - 1]);
        }
    };

    const canGoNext = (): boolean => {
        const order = getCurrentStepOrder();
        const currentIndex = order.indexOf(state.currentStep);
        return currentIndex < order.length - 1;
    };

    const canGoPrevious = (): boolean => {
        const order = getCurrentStepOrder();
        const currentIndex = order.indexOf(state.currentStep);
        return currentIndex > 0;
    };

    // Persistence helpers
    const saveToStorage = () => {
        try {
            const storageKey = getStorageKey(state.user?.id || null);
            if (!storageKey) {
                console.warn('Cannot save onboarding state: no user ID available');
                return;
            }

            const stateToSave = {
                userId: state.user?.id,
                currentStep: state.currentStep,
                organizationData: state.organizationData,
                invitations: state.invitations,
                timestamp: new Date().toISOString(),
            };
            localStorage.setItem(storageKey, JSON.stringify(stateToSave));
        } catch (error) {
            console.warn('Failed to save onboarding state to localStorage:', error);
        }
    };

    const loadFromStorage = () => {
        try {
            const currentUserId = state.user?.id || initialUser?.id;
            const storageKey = getStorageKey(currentUserId || null);

            if (!storageKey || !currentUserId) {
                console.warn('Cannot load onboarding state: no user ID available');
                return;
            }

            const saved = localStorage.getItem(storageKey);
            if (saved) {
                const parsed = JSON.parse(saved);

                // Validate that the saved data belongs to the current user
                if (parsed.userId && parsed.userId !== currentUserId) {
                    console.warn('Onboarding state userId mismatch, clearing storage');
                    clearStorage();
                    return;
                }

                // Check if data is not too old (24 hours)
                const savedTime = new Date(parsed.timestamp || 0);
                const now = new Date();
                const hoursDiff = (now.getTime() - savedTime.getTime()) / (1000 * 60 * 60);

                if (hoursDiff < 24) {
                    dispatch({ type: 'LOAD_FROM_STORAGE', payload: parsed });
                } else {
                    // Clear old data
                    clearStorage();
                }
            }
        } catch (error) {
            console.warn('Failed to load onboarding state from localStorage:', error);
            clearStorage();
        }
    };

    const clearStorage = () => {
        try {
            const currentUserId = state.user?.id || initialUser?.id;
            const storageKey = getStorageKey(currentUserId || null);

            if (storageKey) {
                localStorage.removeItem(storageKey);
            }
        } catch (error) {
            console.warn('Failed to clear onboarding state from localStorage:', error);
        }
    };

    // Clear all onboarding storage for any user (useful on logout)
    const clearAllOnboardingStorage = () => {
        try {
            Object.keys(localStorage).forEach((key) => {
                if (key.startsWith('portzapp_onboarding_state_')) {
                    localStorage.removeItem(key);
                }
            });
        } catch (error) {
            console.warn('Failed to clear all onboarding state from localStorage:', error);
        }
    };

    const contextValue: OnboardingContextType = {
        state,
        dispatch,
        setStep,
        setOrganizationData,
        setInvitations,
        setLoading,
        setError,
        resetState,
        goToNextStep,
        goToPreviousStep,
        canGoNext,
        canGoPrevious,
        saveToStorage,
        loadFromStorage,
        clearStorage,
        clearAllOnboardingStorage,
    };

    return <OnboardingContext.Provider value={contextValue}>{children}</OnboardingContext.Provider>;
}

// Hook to use the context
export function useOnboarding() {
    const context = useContext(OnboardingContext);
    if (!context) {
        throw new Error('useOnboarding must be used within an OnboardingProvider');
    }
    return context;
}

// Hook to check if user is in onboarding flow
export function useIsOnboarding() {
    const context = useContext(OnboardingContext);
    return context !== null && context.state.currentStep !== 'complete';
}
