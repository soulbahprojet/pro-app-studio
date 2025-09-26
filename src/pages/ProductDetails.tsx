import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProductDetails() {
    const { id } = useParams();

    return (
        <div className="container mx-auto p-4">
            <Card>
                <CardHeader>
                    <CardTitle>Détails du Produit #{id}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Informations détaillées du produit.</p>
                </CardContent>
            </Card>
        </div>
    );
}
