import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Profile() {
    return (
        <div className="container mx-auto p-4">
            <Card>
                <CardHeader>
                    <CardTitle>Profil Utilisateur - 224Solutions</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Gestion du profil utilisateur.</p>
                </CardContent>
            </Card>
        </div>
    );
}
