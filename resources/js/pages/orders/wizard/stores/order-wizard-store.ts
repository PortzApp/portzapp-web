import { router } from '@inertiajs/react';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import type { Port, Service, ServiceCategory, Vessel } from '@/types/models';
import type { OrderWizardSession, ServiceSelection, WizardStep } from '@/types/wizard';

interface OrderWizardStore {
    // Session data
    sessionId: string | null;
    currentStep: WizardStep;
    sessionName: string;

    // Selected data
    vessel: Vessel | null;
    port: Port | null;
    selectedCategories: ServiceCategory[];
    selectedServices: ServiceSelection[];
    notes: string;

    // Loading states
    isLoading: boolean;
    isSaving: boolean;

    // Actions
    initSession: (session?: OrderWizardSession) => void;
    createNewSession: (sessionName?: string) => Promise<void>;
    setVesselAndPort: (vessel: Vessel, port: Port) => Promise<void>;
    selectCategories: (categories: ServiceCategory[]) => Promise<void>;
    addService: (service: Service, organization: { id: string; name: string }) => Promise<void>;
    removeService: (serviceId: string) => Promise<void>;
    setNotes: (notes: string) => void;
    setCurrentStep: (step: WizardStep) => void;
    saveProgress: () => Promise<void>;
    completeOrder: () => Promise<{ success: boolean; order?: any; error?: string }>;
    reset: () => void;
    
    // Navigation helpers
    goToNextStep: () => Promise<void>;
    goToPreviousStep: () => Promise<void>;
    canGoToNextStep: () => boolean;
}

const initialState = {
    sessionId: null,
    currentStep: 'vessel_port' as WizardStep,
    sessionName: '',
    vessel: null,
    port: null,
    selectedCategories: [],
    selectedServices: [],
    notes: '',
    isLoading: false,
    isSaving: false,
};

export const useOrderWizardStore = create<OrderWizardStore>()(
    devtools(
        persist(
            (set, get) => ({
                ...initialState,

                initSession: (session) => {
                    if (session) {
                        set({
                            sessionId: session.id,
                            currentStep: session.current_step,
                            sessionName: session.session_name,
                            vessel: session.vessel || null,
                            port: session.port || null,
                            selectedCategories: [], // Will be populated from backend
                            selectedServices: session.selected_services || [],
                            notes: '',
                        });
                    } else {
                        set(initialState);
                    }
                },

                createNewSession: async (sessionName) => {
                    set({ isLoading: true });
                    
                    try {
                        const response = await fetch('/order-wizard-sessions', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                            },
                            body: JSON.stringify({
                                session_name: sessionName,
                            }),
                        });

                        if (!response.ok) {
                            throw new Error('Failed to create session');
                        }

                        const data = await response.json();
                        set({
                            sessionId: data.session.id,
                            sessionName: data.session.session_name,
                            currentStep: 'vessel_port',
                            isLoading: false,
                        });
                    } catch (error) {
                        console.error('Error creating session:', error);
                        set({ isLoading: false });
                        throw error;
                    }
                },

                setVesselAndPort: async (vessel, port) => {
                    set({ isSaving: true });
                    
                    try {
                        const { sessionId } = get();
                        if (!sessionId) {
                            throw new Error('No session ID');
                        }

                        const response = await fetch(`/order-wizard-sessions/${sessionId}`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                            },
                            body: JSON.stringify({
                                vessel_id: vessel.id,
                                port_id: port.id,
                                current_step: 'categories',
                            }),
                        });

                        if (!response.ok) {
                            throw new Error('Failed to save vessel and port');
                        }

                        set({
                            vessel,
                            port,
                            currentStep: 'categories',
                            isSaving: false,
                        });
                    } catch (error) {
                        console.error('Error saving vessel and port:', error);
                        set({ isSaving: false });
                        throw error;
                    }
                },

                selectCategories: async (categories) => {
                    set({ isSaving: true });
                    
                    try {
                        const { sessionId } = get();
                        if (!sessionId) {
                            throw new Error('No session ID');
                        }

                        const categoryIds = categories.map(cat => cat.id);
                        const response = await fetch(`/order-wizard-sessions/${sessionId}`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                            },
                            body: JSON.stringify({
                                selected_categories: categoryIds,
                                current_step: 'services',
                            }),
                        });

                        if (!response.ok) {
                            throw new Error('Failed to save categories');
                        }

                        set({
                            selectedCategories: categories,
                            currentStep: 'services',
                            isSaving: false,
                        });
                    } catch (error) {
                        console.error('Error saving categories:', error);
                        set({ isSaving: false });
                        throw error;
                    }
                },

                addService: async (service, organization) => {
                    const { selectedServices, sessionId } = get();
                    
                    const serviceSelection: ServiceSelection = {
                        id: service.id,
                        name: service.name,
                        price: service.price,
                        description: service.description,
                        organization_id: organization.id,
                        organization_name: organization.name,
                        category_id: service.service_category_id,
                        category_name: '', // Will be populated from context
                    };

                    const newSelectedServices = [...selectedServices, serviceSelection];
                    
                    set({ isSaving: true });
                    
                    try {
                        if (!sessionId) {
                            throw new Error('No session ID');
                        }

                        const response = await fetch(`/order-wizard-sessions/${sessionId}`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                            },
                            body: JSON.stringify({
                                selected_services: newSelectedServices,
                            }),
                        });

                        if (!response.ok) {
                            throw new Error('Failed to add service');
                        }

                        set({
                            selectedServices: newSelectedServices,
                            isSaving: false,
                        });
                    } catch (error) {
                        console.error('Error adding service:', error);
                        set({ isSaving: false });
                        throw error;
                    }
                },

                removeService: async (serviceId) => {
                    const { selectedServices, sessionId } = get();
                    const newSelectedServices = selectedServices.filter(s => s.id !== serviceId);
                    
                    set({ isSaving: true });
                    
                    try {
                        if (!sessionId) {
                            throw new Error('No session ID');
                        }

                        const response = await fetch(`/order-wizard-sessions/${sessionId}`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                            },
                            body: JSON.stringify({
                                selected_services: newSelectedServices,
                            }),
                        });

                        if (!response.ok) {
                            throw new Error('Failed to remove service');
                        }

                        set({
                            selectedServices: newSelectedServices,
                            isSaving: false,
                        });
                    } catch (error) {
                        console.error('Error removing service:', error);
                        set({ isSaving: false });
                        throw error;
                    }
                },

                setNotes: (notes) => {
                    set({ notes });
                },

                setCurrentStep: (step) => {
                    set({ currentStep: step });
                },

                saveProgress: async () => {
                    const { sessionId, currentStep } = get();
                    if (!sessionId) return;

                    set({ isSaving: true });
                    
                    try {
                        const response = await fetch(`/order-wizard-sessions/${sessionId}`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                            },
                            body: JSON.stringify({
                                current_step: currentStep,
                            }),
                        });

                        if (!response.ok) {
                            throw new Error('Failed to save progress');
                        }

                        set({ isSaving: false });
                    } catch (error) {
                        console.error('Error saving progress:', error);
                        set({ isSaving: false });
                        throw error;
                    }
                },

                completeOrder: async () => {
                    const { sessionId, notes } = get();
                    if (!sessionId) {
                        return { success: false, error: 'No session ID' };
                    }

                    set({ isSaving: true });
                    
                    try {
                        const response = await fetch(`/order-wizard/sessions/${sessionId}/complete`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                            },
                            body: JSON.stringify({
                                notes,
                            }),
                        });

                        const data = await response.json();

                        if (!response.ok) {
                            return { success: false, error: data.error || 'Failed to complete order' };
                        }

                        set({ isSaving: false });
                        get().reset();
                        
                        return { success: true, order: data.order };
                    } catch (error) {
                        console.error('Error completing order:', error);
                        set({ isSaving: false });
                        return { success: false, error: 'Network error' };
                    }
                },

                reset: () => {
                    set(initialState);
                },

                goToNextStep: async () => {
                    const { currentStep } = get();
                    const steps: WizardStep[] = ['vessel_port', 'categories', 'services', 'review'];
                    const currentIndex = steps.indexOf(currentStep);
                    
                    if (currentIndex < steps.length - 1) {
                        const nextStep = steps[currentIndex + 1];
                        set({ currentStep: nextStep });
                        await get().saveProgress();
                    }
                },

                goToPreviousStep: async () => {
                    const { currentStep } = get();
                    const steps: WizardStep[] = ['vessel_port', 'categories', 'services', 'review'];
                    const currentIndex = steps.indexOf(currentStep);
                    
                    if (currentIndex > 0) {
                        const previousStep = steps[currentIndex - 1];
                        set({ currentStep: previousStep });
                        await get().saveProgress();
                    }
                },

                canGoToNextStep: () => {
                    const { currentStep, vessel, port, selectedCategories, selectedServices } = get();
                    
                    switch (currentStep) {
                        case 'vessel_port':
                            return vessel !== null && port !== null;
                        case 'categories':
                            return selectedCategories.length > 0;
                        case 'services':
                            // Check that we have selected at least one service for each category
                            const selectedCategoryIds = selectedCategories.map(c => c.id);
                            const servicesCategoryIds = selectedServices.map(s => s.category_id);
                            return selectedCategoryIds.every(catId => servicesCategoryIds.includes(catId));
                        case 'review':
                            return selectedServices.length > 0;
                        default:
                            return false;
                    }
                },
            }),
            {
                name: 'order-wizard-store',
                partialize: (state) => ({
                    sessionId: state.sessionId,
                    currentStep: state.currentStep,
                    sessionName: state.sessionName,
                }),
            }
        ),
        {
            name: 'order-wizard-store',
        }
    )
);