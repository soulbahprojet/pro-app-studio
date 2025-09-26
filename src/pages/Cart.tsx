import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Cart() {
    return (
        <div className="container mx-auto p-4">
            <Card>
                <CardHeader>
                    <CardTitle>Panier - 224Solutions</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Votre panier est vide pour le moment.</p>
                </CardContent>
            </Card>
        </div>
    );
}
