import { getManagerUsers } from '../actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default async function UsersPage() {
    const users = await getManagerUsers();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Users</h1>
                <p className="text-muted-foreground">
                    Manage user accounts and permissions.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Avatar</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Company</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Joined</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No users found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user: any) => (
                                    <TableRow key={user.id_contact}>
                                        <TableCell>
                                            <Avatar>
                                                <AvatarImage src={user.photo} alt={user.prenom} />
                                                <AvatarFallback>
                                                    {user.prenom?.[0]}{user.nom?.[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {user.prenom} {user.nom}
                                        </TableCell>
                                        <TableCell>{user.mail}</TableCell>
                                        <TableCell>{user.societe || '-'}</TableCell>
                                        <TableCell>
                                            {user.rcc?.[0]?.statut === 1 ? (
                                                <Badge>Admin</Badge>
                                            ) : (
                                                <Badge variant="secondary">User</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(user.date_creat).toLocaleDateString()}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
