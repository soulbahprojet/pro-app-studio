import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Payment() {
    return (
        <div className="container mx-auto p-4">
            <Card>
                <CardHeader>
                    <CardTitle>Paiement - 224Solutions</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Interface de paiement sécurisé.</p>
                </CardContent>
            </Card>
        </div>
    );
}
