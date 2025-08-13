import { router } from '@inertiajs/react';
import { create } from 'zustand';

export interface WizardSession {
    id: string;
    data: {
        current_step: number;
        vessel_id?: string;
        port_id?: string;
        selected_categories?: string[];
        selected_services?: Record<string, ServiceSelection[]>;
    };
}

export interface ServiceSelection {
    service_id: string;
    quantity: number;
}

export interface WizardState {
    // Current wizard state
    currentStep: number;
    sessionId: string | null;
    
    // Step data
    vesselId: string;
    portId: string;
    selectedCategories: string[];
    selectedServices: Record<string, ServiceSelection[]>; // categoryId -> selections
    
    // Loading states
    isLoading: boolean;
    isSaving: boolean;
    
    // Actions
    setCurrentStep: (step: number) => void;
    setVesselAndPort: (vesselId: string, portId: string) => void;
    setSelectedCategories: (categories: string[]) => void;
    setSelectedServices: (categoryId: string, services: ServiceSelection[]) => void;
    clearWizard: () => void;
    initializeFromSession: (session: WizardSession | null) => void;
    
    // Backend sync
    saveStep: (stepData: any, nextRoute?: string) => Promise<void>;
    cancelWizard: () => void;
}

const initialState = {
    currentStep: 0,
    sessionId: null,
    vesselId: '',
    portId: '',
    selectedCategories: [],
    selectedServices: {},
    isLoading: false,
    isSaving: false,
};

export const useOrderWizardStore = create<WizardState>((set, get) => ({
    ...initialState,
    
    setCurrentStep: (step) => set({ currentStep: step }),
    
    setVesselAndPort: (vesselId, portId) => set({ vesselId, portId }),
    
    setSelectedCategories: (categories) => set({ selectedCategories: categories }),
    
    setSelectedServices: (categoryId, services) => {
        const currentServices = get().selectedServices;
        set({ 
            selectedServices: { 
                ...currentServices, 
                [categoryId]: services 
            } 
        });
    },
    
    clearWizard: () => set({ ...initialState }),
    
    initializeFromSession: (session) => {
        if (!session) {
            set({ ...initialState });
            return;
        }
        
        set({
            sessionId: session.id,
            currentStep: session.data.current_step || 0,
            vesselId: session.data.vessel_id || '',
            portId: session.data.port_id || '',
            selectedCategories: session.data.selected_categories || [],
            selectedServices: session.data.selected_services || {},
        });
    },
    
    saveStep: async (stepData, nextRoute) => {
        set({ isSaving: true });
        
        try {
            await new Promise((resolve, reject) => {
                router.post(route(nextRoute || 'orders.wizard.store-start'), stepData, {
                    onSuccess: () => resolve(undefined),
                    onError: (errors) => reject(errors),
                    preserveState: true,
                });
            });
        } catch (error) {
            console.error('Error saving wizard step:', error);
        } finally {
            set({ isSaving: false });
        }
    },
    
    cancelWizard: () => {
        router.get(route('orders.wizard.cancel'));
        set({ ...initialState });
    },
}));
