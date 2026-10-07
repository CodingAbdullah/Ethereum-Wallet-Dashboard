import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

// Card used by the /me and wallet sections: title, optional description and action, scrollable body
export default function DashboardPanel({ title, description, action, children }: { title: string; description?: React.ReactNode; action?: React.ReactNode; children: React.ReactNode }) {
    return (
        <Card className="bg-gray-900 border-gray-800 shadow-xl w-full">
            <CardHeader className="border-b border-gray-800 pb-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                    <CardTitle className="text-2xl font-bold text-gray-100">{title}</CardTitle>
                    {description && <CardDescription className="text-gray-400 mt-1">{description}</CardDescription>}
                </div>
                {action}
            </CardHeader>
            <CardContent className="pt-4 overflow-x-auto">{children}</CardContent>
        </Card>
    );
}
