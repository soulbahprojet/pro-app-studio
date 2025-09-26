import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TransportDashboard() {
    return (
        <div className="container mx-auto p-4">
            <Card>
                <CardHeader>
                    <CardTitle>Dashboard Transport - 224Solutions</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Interface de gestion du transport.</p>
                </CardContent>
            </Card>
        </div>
    );
}
