import { useState, useEffect, useRef, useCallback } from 'react';
import { CheckCircle2, AlertCircle, LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SlugInputProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    onValidation?: (isValid: boolean, isAvailable: boolean) => void;
    organizationName?: string;
    className?: string;
    disabled?: boolean;
    placeholder?: string;
    required?: boolean;
    isOnboarding?: boolean;
}

type ValidationState = 'idle' | 'checking' | 'valid' | 'invalid' | 'unavailable';

export default function SlugInput({
    label = 'Organization URL',
    value,
    onChange,
    onValidation,
    organizationName,
    className,
    disabled = false,
    placeholder = 'your-organization-url',
    required = false,
    isOnboarding = false,
}: SlugInputProps) {
    const [validationState, setValidationState] = useState<ValidationState>('idle');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastCheckedSlugRef = useRef<string>('');

    // Format slug input (lowercase, replace spaces/special chars with hyphens)
    const formatSlug = useCallback((input: string): string => {
        return input
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }, []);

    // Validate slug format
    const isValidSlugFormat = (slug: string): boolean => {
        return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
    };

    // Check slug availability
    const checkSlugAvailability = async (slug: string) => {
        if (!slug || !isValidSlugFormat(slug)) {
            return;
        }

        // Skip if we already checked this slug
        if (lastCheckedSlugRef.current === slug) {
            return;
        }

        setValidationState('checking');
        lastCheckedSlugRef.current = slug;

        try {
            // Use different route based on context
            const routeName = isOnboarding ? 'organizations.slug.check.onboarding' : 'organizations.slug.check';
            const response = await fetch(route(routeName), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify({ slug }),
            });

            // Check if response is successful
            if (!response.ok) {
                console.error(`Slug availability check failed with status: ${response.status}`);
                setValidationState('invalid');
                if (response.status === 401) {
                    setErrorMessage('Authentication required');
                } else if (response.status === 403) {
                    setErrorMessage('Permission denied');
                } else if (response.status >= 500) {
                    setErrorMessage('Server error - please try again');
                } else {
                    setErrorMessage('Unable to check availability');
                }
                onValidation?.(false, false);
                return;
            }

            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                console.error('Slug availability check returned non-JSON response');
                setValidationState('invalid');
                setErrorMessage('Server error - please try again');
                onValidation?.(false, false);
                return;
            }

            const data = await response.json();

            if (data.available) {
                setValidationState('valid');
                setErrorMessage('');
                onValidation?.(true, true);
            } else {
                setValidationState('unavailable');
                setErrorMessage('This URL is already taken');
                onValidation?.(false, false);
            }
        } catch (error) {
            console.error('Slug availability check failed:', error);
            setValidationState('invalid');
            setErrorMessage('Unable to check availability');
            onValidation?.(false, false);
        }
    };

    // Generate slug from organization name
    const generateSlugFromName = useCallback(async (name: string) => {
        if (!name.trim()) return;

        try {
            // Use different route based on context
            const routeName = isOnboarding ? 'organizations.slug.generate.onboarding' : 'organizations.slug.generate';
            const response = await fetch(route(routeName), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify({ name }),
            });

            // Check if response is successful and JSON
            if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
                const data = await response.json();
                onChange(data.slug);
            } else {
                console.error(`Slug generation failed with status: ${response.status}`);
                // Fallback to manual formatting
                const fallbackSlug = formatSlug(name);
                onChange(fallbackSlug);
            }
        } catch (error) {
            console.error('Slug generation failed:', error);
            // Fallback to manual formatting
            const fallbackSlug = formatSlug(name);
            onChange(fallbackSlug);
        }
    }, [onChange, formatSlug, isOnboarding]);

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        const formattedValue = formatSlug(rawValue);
        
        onChange(formattedValue);

        // Clear previous debounce
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        // Reset validation state
        setValidationState('idle');
        setErrorMessage('');

        if (!formattedValue) {
            onValidation?.(false, false);
            return;
        }

        // Check format validity immediately
        if (!isValidSlugFormat(formattedValue)) {
            setValidationState('invalid');
            setErrorMessage('URL must contain only letters, numbers, and hyphens');
            onValidation?.(false, false);
            return;
        }

        // Debounce availability check
        debounceTimeoutRef.current = setTimeout(() => {
            checkSlugAvailability(formattedValue);
        }, 500);
    };

    // Auto-generate slug when organization name changes
    useEffect(() => {
        if (organizationName && !value) {
            const timeoutId = setTimeout(() => {
                generateSlugFromName(organizationName);
            }, 300);

            return () => clearTimeout(timeoutId);
        }
    }, [organizationName, value, generateSlugFromName]);

    // Cleanup debounce on unmount
    useEffect(() => {
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, []);

    const getValidationIcon = () => {
        switch (validationState) {
            case 'checking':
                return <LoaderCircle className="h-4 w-4 animate-spin text-muted-foreground" />;
            case 'valid':
                return <CheckCircle2 className="h-4 w-4 text-green-600" />;
            case 'invalid':
            case 'unavailable':
                return <AlertCircle className="h-4 w-4 text-destructive" />;
            default:
                return null;
        }
    };

    const getInputClassName = () => {
        switch (validationState) {
            case 'valid':
                return 'border-green-600 focus-visible:ring-green-600';
            case 'invalid':
            case 'unavailable':
                return 'border-destructive focus-visible:ring-destructive';
            default:
                return '';
        }
    };

    return (
        <div className={cn('grid gap-2', className)}>
            <Label htmlFor="slug">
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-muted-foreground text-sm">portzapp.com/</span>
                </div>
                <Input
                    id="slug"
                    type="text"
                    value={value}
                    onChange={handleInputChange}
                    disabled={disabled}
                    placeholder={placeholder}
                    className={cn(
                        'pl-[120px] pr-10',
                        getInputClassName()
                    )}
                    required={required}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    {getValidationIcon()}
                </div>
            </div>
            {errorMessage && (
                <p className="text-sm text-destructive">{errorMessage}</p>
            )}
            <p className="text-xs text-muted-foreground">
                This will be your organization's unique URL. It can only contain lowercase letters, numbers, and hyphens.
            </p>
        </div>
    );
}