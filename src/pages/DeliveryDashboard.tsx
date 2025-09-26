import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DeliveryDashboard() {
    return (
        <div className="container mx-auto p-4">
            <Card>
                <CardHeader>
                    <CardTitle>Dashboard Livraison - 224Solutions</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Interface de gestion des livraisons.</p>
                </CardContent>
            </Card>
        </div>
    );
}
