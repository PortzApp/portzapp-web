import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import type { Port, Service, ServiceCategory, Vessel } from '@/types/models';
import type { OrderWizardSession, ServiceSelection, WizardStep } from '@/types/wizard';

interface InertiaResponse {
    props: {
        session?: OrderWizardSession;
        order?: { id: string };
        [key: string]: unknown;
    };
}

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
    selectServices: (services: Service[]) => Promise<void>;
    addService: (service: Service, organization: { id: string; name: string }) => Promise<void>;
    removeService: (serviceId: string) => Promise<void>;
    setNotes: (notes: string) => void;
    setCurrentStep: (step: WizardStep) => void;
    saveProgress: () => Promise<void>;
    completeOrder: () => Promise<{ success: boolean; order?: { id: string }; error?: string }>;
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
                    return new Promise<void>((resolve, reject) => {
                        set({ isLoading: true });

                        router.post(
                            route('order-wizard-sessions.store'),
                            { session_name: sessionName },
                            {
                                onSuccess: (page: InertiaResponse) => {
                                    const data = page.props;
                                    set({
                                        sessionId: data.session!.id,
                                        sessionName: data.session!.session_name,
                                        currentStep: 'vessel_port',
                                        isLoading: false,
                                    });
                                    resolve();
                                },
                                onError: (errors) => {
                                    console.error('Error creating session:', errors);
                                    set({ isLoading: false });
                                    reject(new Error('Failed to create session'));
                                },
                                onFinish: () => {
                                    set({ isLoading: false });
                                },
                            },
                        );
                    });
                },

                setVesselAndPort: async (vessel, port) => {
                    return new Promise<void>((resolve, reject) => {
                        const { sessionId } = get();
                        if (!sessionId) {
                            reject(new Error('No session ID'));
                            return;
                        }

                        set({ isSaving: true });

                        router.patch(
                            route('order-wizard-sessions.update', sessionId),
                            {
                                vessel_id: vessel.id,
                                port_id: port.id,
                                current_step: 'categories',
                            },
                            {
                                onSuccess: () => {
                                    set({
                                        vessel,
                                        port,
                                        currentStep: 'categories',
                                        isSaving: false,
                                    });
                                    resolve();
                                },
                                onError: (errors) => {
                                    console.error('Error saving vessel and port:', errors);
                                    set({ isSaving: false });
                                    reject(new Error('Failed to save vessel and port'));
                                },
                                onFinish: () => {
                                    set({ isSaving: false });
                                },
                            },
                        );
                    });
                },

                selectCategories: async (categories) => {
                    return new Promise<void>((resolve, reject) => {
                        const { sessionId } = get();
                        if (!sessionId) {
                            reject(new Error('No session ID'));
                            return;
                        }

                        set({ isSaving: true });

                        const categoryIds = categories.map((cat) => cat.id);
                        router.patch(
                            route('order-wizard-sessions.update', sessionId),
                            {
                                selected_categories: categoryIds,
                                current_step: 'services',
                            },
                            {
                                onSuccess: () => {
                                    set({
                                        selectedCategories: categories,
                                        currentStep: 'services',
                                        isSaving: false,
                                    });
                                    resolve();
                                },
                                onError: (errors) => {
                                    console.error('Error saving categories:', errors);
                                    set({ isSaving: false });
                                    reject(new Error('Failed to save categories'));
                                },
                                onFinish: () => {
                                    set({ isSaving: false });
                                },
                            },
                        );
                    });
                },

                selectServices: async (services) => {
                    return new Promise<void>((resolve, reject) => {
                        const { sessionId, selectedCategories } = get();
                        if (!sessionId) {
                            reject(new Error('No session ID'));
                            return;
                        }

                        set({ isSaving: true });

                        // Convert services to ServiceSelection format
                        const serviceSelections: ServiceSelection[] = services.map((service) => {
                            const category = selectedCategories.find((cat) => cat.id === service.service_category_id.toString());
                            return {
                                id: service.id,
                                name: service.name,
                                price: service.price,
                                description: service.description,
                                organization_id: service.organization?.id || '',
                                organization_name: service.organization?.name || '',
                                category_id: service.service_category_id.toString(),
                                category_name: category?.name || '',
                            };
                        });

                        router.patch(
                            route('order-wizard-sessions.update', sessionId),
                            {
                                selected_services: JSON.parse(JSON.stringify(serviceSelections)),
                                current_step: 'review',
                            },
                            {
                                onSuccess: () => {
                                    set({
                                        selectedServices: serviceSelections,
                                        currentStep: 'review',
                                        isSaving: false,
                                    });
                                    resolve();
                                },
                                onError: (errors) => {
                                    console.error('Error saving services:', errors);
                                    set({ isSaving: false });
                                    reject(new Error('Failed to save services'));
                                },
                                onFinish: () => {
                                    set({ isSaving: false });
                                },
                            },
                        );
                    });
                },

                addService: async (service, organization) => {
                    return new Promise<void>((resolve, reject) => {
                        const { selectedServices, sessionId } = get();

                        if (!sessionId) {
                            reject(new Error('No session ID'));
                            return;
                        }

                        const serviceSelection: ServiceSelection = {
                            id: service.id,
                            name: service.name,
                            price: service.price,
                            description: service.description,
                            organization_id: organization.id,
                            organization_name: organization.name,
                            category_id: service.service_category_id.toString(),
                            category_name: '', // Will be populated from context
                        };

                        const newSelectedServices = [...selectedServices, serviceSelection];

                        set({ isSaving: true });

                        router.patch(
                            route('order-wizard-sessions.update', sessionId),
                            { selected_services: JSON.parse(JSON.stringify(newSelectedServices)) },
                            {
                                onSuccess: () => {
                                    set({
                                        selectedServices: newSelectedServices,
                                        isSaving: false,
                                    });
                                    resolve();
                                },
                                onError: (errors) => {
                                    console.error('Error adding service:', errors);
                                    set({ isSaving: false });
                                    reject(new Error('Failed to add service'));
                                },
                                onFinish: () => {
                                    set({ isSaving: false });
                                },
                            },
                        );
                    });
                },

                removeService: async (serviceId) => {
                    return new Promise<void>((resolve, reject) => {
                        const { selectedServices, sessionId } = get();

                        if (!sessionId) {
                            reject(new Error('No session ID'));
                            return;
                        }

                        const newSelectedServices = selectedServices.filter((s) => s.id !== serviceId);

                        set({ isSaving: true });

                        router.patch(
                            route('order-wizard-sessions.update', sessionId),
                            { selected_services: JSON.parse(JSON.stringify(newSelectedServices)) },
                            {
                                onSuccess: () => {
                                    set({
                                        selectedServices: newSelectedServices,
                                        isSaving: false,
                                    });
                                    resolve();
                                },
                                onError: (errors) => {
                                    console.error('Error removing service:', errors);
                                    set({ isSaving: false });
                                    reject(new Error('Failed to remove service'));
                                },
                                onFinish: () => {
                                    set({ isSaving: false });
                                },
                            },
                        );
                    });
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

                    router.patch(
                        route('order-wizard-sessions.update', sessionId),
                        { current_step: currentStep },
                        {
                            onError: (errors) => {
                                console.error('Error saving progress:', errors);
                            },
                            onFinish: () => {
                                set({ isSaving: false });
                            },
                        },
                    );
                },

                completeOrder: async () => {
                    return new Promise<{ success: boolean; order?: { id: string }; error?: string }>((resolve) => {
                        const { sessionId, notes } = get();
                        if (!sessionId) {
                            resolve({ success: false, error: 'No session ID' });
                            return;
                        }

                        set({ isSaving: true });

                        router.post(
                            route('order-wizard.complete', sessionId),
                            { notes },
                            {
                                onSuccess: (page: InertiaResponse) => {
                                    const data = page.props;
                                    set({ isSaving: false });
                                    get().reset();
                                    resolve({ success: true, order: data.order });
                                },
                                onError: (errors) => {
                                    console.error('Error completing order:', errors);
                                    set({ isSaving: false });
                                    const errorMessage =
                                        typeof errors === 'object' && errors !== null && 'message' in errors
                                            ? (errors as { message: string }).message
                                            : 'Failed to complete order';
                                    resolve({ success: false, error: errorMessage });
                                },
                                onFinish: () => {
                                    set({ isSaving: false });
                                },
                            },
                        );
                    });
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
                        case 'services': {
                            // Check that we have selected at least one service for each category
                            const selectedCategoryIds = selectedCategories.map((c) => c.id);
                            const servicesCategoryIds = selectedServices.map((s) => s.category_id);
                            return selectedCategoryIds.every((catId) => servicesCategoryIds.includes(catId));
                        }
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
            },
        ),
        {
            name: 'order-wizard-store',
        },
    ),
);
