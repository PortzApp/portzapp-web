import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Eye, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmailTemplate {
    name: string;
    title: string;
    description: string;
    type: 'notification' | 'mailable';
}

interface Props {
    templates: EmailTemplate[];
}

export default function EmailTemplateIndex({ templates }: Props) {
    const getTypeColor = (type: string) => {
        return type === 'notification' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
    };

    const openInNewTab = (template: string) => {
        window.open(route('emails.show', template), '_blank');
    };

    return (
        <AppLayout>
            <Head title="Email Templates" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            {/* Header */}
                            <div className="flex items-center gap-3 mb-8">
                                <Mail className="h-8 w-8 text-blue-600" />
                                <div>
                                    <h1 className="text-3xl font-bold">Email Templates</h1>
                                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                                        Preview and test all email templates with mock data
                                    </p>
                                </div>
                            </div>

                            {/* Development Notice */}
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                            Development Only
                                        </h3>
                                        <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                                            <p>This email preview system is only available in development environments for security.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Email Templates Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {templates.map((template) => (
                                    <Card key={template.name} className="hover:shadow-lg transition-shadow">
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <CardTitle className="flex items-center gap-2">
                                                        <Mail className="h-5 w-5 text-gray-600" />
                                                        {template.title}
                                                    </CardTitle>
                                                    <CardDescription className="mt-2">
                                                        {template.description}
                                                    </CardDescription>
                                                </div>
                                                <Badge 
                                                    variant="secondary"
                                                    className={getTypeColor(template.type)}
                                                >
                                                    {template.type}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex gap-2">
                                                {/* Preview in same tab */}
                                                <Link
                                                    href={route('emails.show', template.name)}
                                                    className="flex-1"
                                                >
                                                    <Button variant="outline" className="w-full">
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        Preview
                                                    </Button>
                                                </Link>
                                                
                                                {/* Preview in new tab */}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openInNewTab(template.name)}
                                                    className="px-3"
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {/* Usage Instructions */}
                            <div className="mt-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
                                <h3 className="text-lg font-semibold mb-4">How to Use</h3>
                                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                    <li className="flex items-start gap-2">
                                        <span className="font-medium text-blue-600">•</span>
                                        Click "Preview" to view the email template with realistic mock data
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="font-medium text-blue-600">•</span>
                                        Use the external link icon to open templates in a new tab
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="font-medium text-blue-600">•</span>
                                        Templates show exactly how emails will appear to recipients
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="font-medium text-blue-600">•</span>
                                        All data shown is mock data for testing purposes only
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}