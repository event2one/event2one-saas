'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('profile');

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your account settings and preferences.
                </p>
            </div>

            <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
                <aside className="-mx-4 lg:w-1/5">
                    <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
                        <Button
                            variant={activeTab === 'profile' ? 'secondary' : 'ghost'}
                            className="justify-start"
                            onClick={() => setActiveTab('profile')}
                        >
                            Profile
                        </Button>
                        <Button
                            variant={activeTab === 'account' ? 'secondary' : 'ghost'}
                            className="justify-start"
                            onClick={() => setActiveTab('account')}
                        >
                            Account
                        </Button>
                        <Button
                            variant={activeTab === 'notifications' ? 'secondary' : 'ghost'}
                            className="justify-start"
                            onClick={() => setActiveTab('notifications')}
                        >
                            Notifications
                        </Button>
                    </nav>
                </aside>
                <div className="flex-1 lg:max-w-2xl">
                    {activeTab === 'profile' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium">Profile</h3>
                                <p className="text-sm text-muted-foreground">
                                    This is how others will see you on the site.
                                </p>
                            </div>
                            <Separator />
                            <Card>
                                <CardHeader>
                                    <CardTitle>Profile Details</CardTitle>
                                    <CardDescription>
                                        Update your personal information.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input id="name" placeholder="Your name" defaultValue="David" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" placeholder="Your email" defaultValue="david@example.com" disabled />
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button>Save changes</Button>
                                </CardFooter>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'account' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium">Account</h3>
                                <p className="text-sm text-muted-foreground">
                                    Update your account settings.
                                </p>
                            </div>
                            <Separator />
                            <Card>
                                <CardHeader>
                                    <CardTitle>Password</CardTitle>
                                    <CardDescription>
                                        Change your password here. After saving, you'll be logged out.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="current">Current password</Label>
                                        <Input id="current" type="password" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="new">New password</Label>
                                        <Input id="new" type="password" />
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button>Update password</Button>
                                </CardFooter>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium">Notifications</h3>
                                <p className="text-sm text-muted-foreground">
                                    Configure how you receive notifications.
                                </p>
                            </div>
                            <Separator />
                            <Card>
                                <CardHeader>
                                    <CardTitle>Email Notifications</CardTitle>
                                    <CardDescription>
                                        Select when you want to be notified via email.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <input type="checkbox" id="marketing" className="h-4 w-4 rounded border-gray-300" defaultChecked />
                                        <Label htmlFor="marketing">Marketing emails</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <input type="checkbox" id="security" className="h-4 w-4 rounded border-gray-300" defaultChecked />
                                        <Label htmlFor="security">Security emails</Label>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button>Save preferences</Button>
                                </CardFooter>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
