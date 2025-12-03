import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function BroadcastPage() {
    return (
        <div className="container mx-auto py-10">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Broadcast</h1>
                <p className="text-muted-foreground">
                    Gérez vos événements en direct et vos écrans de diffusion
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Événements en direct</CardTitle>
                        <CardDescription>
                            Gérez vos événements et sessions en temps réel
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full">
                            <Link href="/manager/events">
                                Voir les événements
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Écrans de diffusion</CardTitle>
                        <CardDescription>
                            Configurez et gérez vos écrans de présentation
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full" variant="outline">
                            <Link href="/manager">
                                Gérer les écrans
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Administration</CardTitle>
                        <CardDescription>
                            Accédez au panneau d'administration
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full" variant="secondary">
                            <Link href="/manager">
                                Tableau de bord
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
