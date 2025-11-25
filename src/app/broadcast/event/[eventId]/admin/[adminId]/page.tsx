'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';

import AdminLayout from '@/components/AdminLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import EventSessionSelector from '@/components/EventSessionSelector';
import { UserConnectionToast } from '@/features/broadcast/components/UserConnectionToast';
import { Play, Eraser, EyeOff, UserPlus, GripVertical, Search, Monitor, X } from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { fetchInitialData, API_URL } from '@/utils/api';
import {
    Presta,
    EventContactType,
    Contact,
    Partner,
    Event,
    ConfEvent,
    ConfEventItem,
    ConfEventContribution,
    ContactStatut
} from '@/features/broadcast/types';

interface SortableContactRowProps {
    partenaire: Partner;
    presta: Presta | undefined;
    index: number;
    idEvent: number;
    onPublish: (contactId: string, idEvent: number, prestaId: string | undefined, id_event_contact_type: string | undefined) => void;
    onClear: (id: string) => void;
    onHide: (id: string) => void;
    onEdit: (presta: Presta) => void;
}

// Compact Sortable Row Component
function SortableContactRow({ partenaire, presta, index, idEvent, onPublish, onClear, onHide, onEdit }: SortableContactRowProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: partenaire.id_conferencier });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    if (!partenaire.contact) {
        return (
            <div ref={setNodeRef} style={style} className="group flex items-center gap-2 bg-neutral-900/30 border border-neutral-800/50 rounded-lg px-2 py-1.5">
                <div {...attributes} {...listeners} className="cursor-move text-neutral-600">
                    <GripVertical className="w-3 h-3" />
                </div>
                <span className="text-neutral-500 font-mono w-4 text-center text-[10px]">{index + 1}</span>
                <span className="text-red-500">Contact data is missing for this partner.</span>
            </div>
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="group flex items-center gap-2 bg-white dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800/50 rounded-lg px-2 py-1.5 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all text-xs"
        >
            <div {...attributes} {...listeners} className="cursor-move text-neutral-600 hover:text-neutral-400">
                <GripVertical className="w-3 h-3" />
            </div>
            <span className="text-neutral-500 font-mono w-4 text-center text-[10px]">{index + 1}</span>
            <Avatar className="w-6 h-6 border border-neutral-700">
                <Image src={partenaire.contact.photos?.tiny} alt="Contact photo" width={24} height={24} className="object-cover" />
            </Avatar>
            <div className="flex-1 min-w-0 flex items-center gap-2">
                <a
                    href={`https://manager.event2one.com/filesmanager/employe.php?id_personne=${partenaire.contact.id_contact}&personne_type=contact`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-900 dark:text-white font-medium hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors truncate text-xs"
                >
                    {partenaire.contact.prenom} <span className="uppercase">{partenaire.contact.nom}</span>
                </a>


                {partenaire.conferencier_statut && (
                    <Badge
                        style={{ backgroundColor: partenaire.conferencier_statut.event_contact_type_color }}
                        className="text-[10px] px-1 py-0 h-4"
                    >
                        {partenaire.conferencier_statut.libelle}
                    </Badge>
                )}
                {partenaire.contact.flag && (
                    <Image src={partenaire.contact.flag} alt="Flag" width={16} height={12} className="w-4 h-3 rounded-sm object-cover" />
                )}
            </div>
            <div className="hidden md:flex flex-col min-w-0 max-w-[150px]">
                <div className="flex items-center gap-1">
                    <span className="text-neutral-500 dark:text-neutral-400 truncate text-[11px]">{partenaire.contact.societe}</span>
                    {presta && (
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onEdit(presta)}
                            className="h-4 w-4 p-0 text-neutral-500 hover:text-emerald-400"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                        </Button>
                    )}
                </div>
                {presta?.punchline && (
                    <span className="text-neutral-500 italic truncate text-[10px]">&quot;{presta.punchline}&quot;</span>
                )}
            </div>
            {partenaire.contact.logos?.tiny && (
                <Image src={partenaire.contact.logos.tiny} alt="Logo" width={20} height={20} className="hidden lg:block w-5 h-5 object-contain rounded" />
            )}
            <div className="flex items-center gap-1">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="sm"
                                onClick={() => {
                                    if (partenaire.contact?.id_contact) {
                                        onPublish(
                                            partenaire.contact.id_contact,
                                            idEvent,
                                            presta?.id_presta,
                                            partenaire.conferencier_statut?.id_event_contact_type
                                        );
                                    }
                                }}
                                className="h-6 w-6 p-0 bg-emerald-600 hover:bg-emerald-700"
                                disabled={!partenaire.contact?.id_contact}
                            >
                                <Play className="w-3 h-3" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Publier</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onClear('bJVjZw==')}
                                className="h-6 w-6 p-0 border-neutral-700 hover:bg-neutral-800"
                            >
                                <Eraser className="w-3 h-3" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Effacer</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => onHide(partenaire.id_conferencier)}
                                className="h-6 w-6 p-0 bg-red-900 hover:bg-red-800"
                            >
                                <EyeOff className="w-3 h-3" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Masquer</p></TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    );
}

export default function AdminPage() {
    const params = useParams();
    const eventId = Number(params?.eventId);
    const adminId = Number(params?.adminId);

    const [isLoading, setIsLoading] = useState(true);

    // State
    const [partenaireList2, setPartenaireList2] = useState<Partner[]>([]);
    const [searchContactList, setSearchContactList] = useState<Contact[]>([]);
    const [eventContactTypeList, setEventContactTypeList] = useState<EventContactType[]>([]);
    const [futureEvents, setFutureEvents] = useState<Event[]>([]);
    const [confEventListLight, setConfEventListLight] = useState<ConfEvent[]>([]);

    const [selectedContactType, setSelectedContactType] = useState<string>('');
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isPositioning, setIsPositioning] = useState(false);

    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [conferencierToHide, setConferencierToHide] = useState<string | null>(null);
    const [isHiding, setIsHiding] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Edit Presta Dialog States
    const [isEditPrestaDialogOpen, setIsEditPrestaDialogOpen] = useState(false);
    const [editingPresta, setEditingPresta] = useState<Presta | null>(null);
    const [isUpdatingPresta, setIsUpdatingPresta] = useState(false);

    // Screen Preview Panel State
    const [showScreenPanel, setShowScreenPanel] = useState(false);
    const [previewScreenId, setPreviewScreenId] = useState<number>(1);

    // User connection notifications
    const [newConnections, setNewConnections] = useState<Array<{
        id: string;
        name: string;
        company: string;
        email: string;
        timestamp: number;
        ije: string;
    }>>([]);

    const socketRef = useRef<Socket | null>(null);
    const sensors = useSensors(useSensor(PointerSensor));

    // Fetch Initial Data
    useEffect(() => {
        if (!eventId || isNaN(eventId)) return;

        const loadData = async () => {
            setIsLoading(true);
            try {
                const data = await fetchInitialData({ idEvent: eventId, idConfEvent: adminId || 0 });

                // Merge logic
                const mergedPartenaires = data.partenaireList.map((partenaire) => {
                    const contactId = partenaire.contact?.id_contact || partenaire.id_contact;
                    const contact = partenaire.contact || { id_contact: contactId } as Contact;
                    return {
                        ...partenaire,
                        contact: {
                            ...contact,
                            prestas_list: data.prestaList ? data.prestaList.filter((p: Presta) => p.id_contact == contactId) : []
                        }
                    };
                });

                setPartenaireList2(mergedPartenaires);
                setEventContactTypeList(data.eventContactTypeList);
                setFutureEvents(data.futureEvents);
                setConfEventListLight(data.confEventListLight);
            } catch (error) {
                console.error("Failed to load initial data", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [eventId, adminId]);

    // Socket.IO Connection
    useEffect(() => {
        // Detect protocol (http in dev, https in production)
        const socketUrl = typeof window !== 'undefined' ? window.location.origin : '';
        socketRef.current = io(socketUrl, {
            path: '/saas/socket.io'
        });
        const socket = socketRef.current;
        socket.emit('dire_bonjour', { my: 'Bonjour server, je suis admin' });

        socket.on('connect', () => {
            console.log('Admin: Socket connected, socket.id =', socket.id);
            socket.emit('check_connexion', { name: 'admin' });
            // Join admin room for this session - use adminId (id_conf_event) for session isolation
            console.log('Admin: Emitting admin:join-event with ije:', adminId);
            socket.emit('admin:join-event', { ije: adminId });
            console.log('Admin joined session room:', adminId);
        });

        socket.on('admin:joined', (data: { room: string }) => {
            console.log('Admin: Server confirmed join to room:', data.room);
        });

        socket.on('updateMediaContainer', (data: { screenId: string, name: string, iframeSrc: string }) => console.log('updateMediaContainer', data));

        // Listen for new user connections
        socket.on('admin:user-connected', (notification: {
            id: string;
            name: string;
            company: string;
            email: string;
            timestamp: number;
            ije: string;
        }) => {
            console.log('Admin received notification:', notification);
            setNewConnections(prev => [...prev, notification]);
        });
        console.log('Admin: Listener for admin:user-connected registered');

        return () => {
            socket.disconnect();
        };
    }, [adminId]);

    const display = (id_jury_event_enc: string, src: string, screenIdOverride?: number) => {
        const currentScreenId = screenIdOverride ? screenIdOverride.toString() : previewScreenId.toString();
        if (socketRef.current) {
            console.log(`Emitting updateMediaContainer to screen ${currentScreenId} with src: ${src}`);
            socketRef.current.emit('updateMediaContainer', { screenId: currentScreenId, name: "ddddddddddddddddd", iframeSrc: src });
        } else {
            console.error("Socket not connected");
        }
    };

    const clearJuryScreens = (id: string) => console.log("clearJuryScreens", id);

    const publishAllContent = (contactId: string, idEvent: number, prestaId: string | undefined, id_event_contact_type: string | undefined) => {

        const baseURL = 'https://www.event2one.com/screen_manager/content/';
        const demoBaseURL = `${baseURL}demo_video_presentation/?ie=${idEvent}&id_contact=${contactId}&id_presta=${prestaId}&`;
        const urls = [
            { screen: 13, url: `${baseURL}contact_video_presentation/?id_contact=${contactId}` },
            { screen: 14, url: `${baseURL}organisme_video_presentation/?id_contact=${contactId}` },
            { screen: 15, url: `${baseURL}contact_website/?id_contact=${contactId}` },
            { screen: 16, url: `${baseURL}contact/?id_contact=${contactId}&content=logo` },
            { screen: 18, url: `${baseURL}contact/?id_contact=${contactId}&content=photo` },
            { screen: 20, url: `${baseURL}contact/?id_contact=${contactId}&content=cycle_lang_presentation` },
            { screen: 23, url: `${baseURL}contact/?id_contact=${contactId}&content=leviers` },
            { screen: 22, url: `${baseURL}contact/?id_contact=${contactId}&content=raison_sociale` },
            { screen: 8, url: `${baseURL}contact_qrcode/?id_contact=${contactId}` },
            { screen: 9, url: `${baseURL}titrage_participant/?id_contact=${contactId}&ie=${idEvent}` },
            { screen: 4, url: `${baseURL}demo_video_presentation/?ie=${idEvent}&id_contact=${contactId}&id_event_contact_type=${id_event_contact_type}&id_presta=${prestaId}` },
            { screen: 26, url: `${demoBaseURL}content=visuel` },
            { screen: 30, url: `${demoBaseURL}content=fond-generique` },
            { screen: 31, url: `${demoBaseURL}content=titrage-intervenant&target=obs` },
            { screen: 32, url: `${demoBaseURL}content=incrustation-video&target=obs` },
            { screen: 33, url: `${demoBaseURL}content=incrustation-titre&target=obs` },
            { screen: 34, url: `${demoBaseURL}content=incrustation-visuel&target=obs` },
            { screen: 35, url: `${demoBaseURL}content=presta-visuel-full&target=obs` },
        ];
        urls.forEach(item => display('', item.url, item.screen));
    };

    const getPrestaList = async ({ idEvent, idConfEvent }: { idEvent: number, idConfEvent: number }) => {
        const params = `WHERE (id_contact IN(SELECT id_contact FROM conferenciers WHERE id_event=${idEvent} AND id_contact NOT IN("",0) AND id_conf_event IN(${idConfEvent}))) OR (id_contact IN (SELECT id_contact FROM conf_event_contribution WHERE id_conf_event IN (SELECT id_conf_event FROM conf_event WHERE id_event=${idEvent} AND id_conf_event IN(${idConfEvent})) AND id_contact NOT IN("",0)))`;
        try {
            const response = await fetch(`${API_URL}?action=getPrestaList&params=${params}`);
            return await response.json();
        } catch (error) {
            console.error(error);
            return [];
        }
    };

    const getContactList = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;

        if (!query) {
            setSearchContactList([]);
            return;
        }

        try {
            const queryTerms = query.split(' ').filter(term => term.length > 0);
            const searchConditions = queryTerms.map(term => {
                const cleanTerm = term.replace(/'/g, "''");
                return `(
                prenom LIKE '%${cleanTerm}%' 
                OR nom LIKE '%${cleanTerm}%' 
                OR societe LIKE '%${cleanTerm}%'
                OR id_contact LIKE '%${cleanTerm}%'
                OR CONCAT(prenom, ' ', nom) LIKE '%${cleanTerm}%'
            )`;
            });

            const params = `WHERE ${searchConditions.join(' AND ')} AND id_contact NOT IN(0, '') LIMIT 20`;
            const encodedParams = encodeURIComponent(params);
            const apiUrl = `${API_URL}?action=getContactList&params=${encodedParams}&get_presta_list=1`;

            const response = await fetch(apiUrl);
            const data = await response.json();

            setSearchContactList(data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const handleUpdateConferencier = (id_conferencier: string) => {
        setConferencierToHide(id_conferencier);
        setIsConfirmDialogOpen(true);
    }

    const confirmHideConferencier = async () => {
        if (!conferencierToHide) return;

        setIsHiding(true);
        const params = new URLSearchParams();
        params.append('id_conferencier', conferencierToHide);
        params.append('afficher', '0');

        try {
            await fetch(`${API_URL}?action=updateConferencier`, {
                method: 'POST',
                body: params
            });

            await getPartenaires({ idEvent: eventId, idConfEvent: adminId });
        } catch (error) {
            console.error("Error hiding conferencier:", error);
        } finally {
            setIsHiding(false);
            setIsConfirmDialogOpen(false);
            setConferencierToHide(null);
        }
    }


    const getPartenaires = async ({ idEvent, idConfEvent }: { idEvent: number, idConfEvent: number }) => {
        try {
            const req = idConfEvent === 0
                ? `${API_URL}?action=getPartenairesLight&params= AND id_event=${idEvent} and afficher !='0'&exclude_fields=event,conf_event&order_by=ordre_affichage ASC`
                : `${API_URL}?action=getPartenairesLight&params= AND id_event=${idEvent} AND id_conf_event IN(${idConfEvent}) and afficher !='0'&exclude_fields=event,conf_event&order_by=ordre_affichage ASC`;



            const [partenaires, prestas] = await Promise.all([
                fetch(req).then(res => res.json()),
                getPrestaList({ idEvent, idConfEvent })
            ]);

            const mergedPartenaires = partenaires.map((partenaire: Partner) => {
                const contactId = partenaire.contact?.id_contact || partenaire.id_contact;
                const contact = partenaire.contact || { id_contact: contactId } as Contact;
                return {
                    ...partenaire,
                    contact: {
                        ...contact,
                        prestas_list: prestas.filter((p: Presta) => p.id_contact == contactId)
                    }
                };
            });

            setPartenaireList2(mergedPartenaires);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const handleCreateConferencier = async (contact: Contact, contactTypeId: string, idConfEvent: string) => {
        const params = new URLSearchParams();
        params.append('id_event', eventId.toString());
        params.append('id_contact', contact.id_contact);
        params.append('id_event_contact_type', contactTypeId);
        params.append('id_conf_event', idConfEvent);
        try {

            const response = await fetch(`${API_URL}?action=createConferencier`, {
                method: 'POST',
                body: params
            });
            const data = await response.json();

            await getPartenaires({ idEvent: eventId, idConfEvent: Number(idConfEvent) });

            console.log('Conferencier created:', data);
        } catch (error) {
            console.error('Error creating conferencier:', error);
        }
    };

    const handleEditPresta = (presta: Presta) => {
        setEditingPresta({ ...presta });
        setIsEditPrestaDialogOpen(true);
    };

    const handleUpdatePresta = async () => {
        if (!editingPresta) return;

        setIsUpdatingPresta(true);
        const params = new URLSearchParams();
        params.append('id_presta', editingPresta.id_presta);
        params.append('presta_nom', editingPresta.presta_nom);
        params.append('punchline', editingPresta.punchline || '');
        params.append('video_url', editingPresta.video_url || '');

        try {
            await fetch(`${API_URL}?action=updatePresta`, {
                method: 'POST',
                body: params
            });

            await getPartenaires({ idEvent: eventId, idConfEvent: adminId });
            setIsEditPrestaDialogOpen(false);
            setEditingPresta(null);
        } catch (error) {
            console.error("Error updating presta:", error);
        } finally {
            setIsUpdatingPresta(false);
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setPartenaireList2((items) => {
                const oldIndex = items.findIndex(item => item.id_conferencier === active.id);
                const newIndex = items.findIndex(item => item.id_conferencier === over.id);
                const newItems = arrayMove(items, oldIndex, newIndex);

                const orderUpdates = newItems.map((item, index) => ({
                    id: item.id_conferencier,
                    order: index + 1
                }));

                console.log(orderUpdates);
                const params = new URLSearchParams();
                params.append('order', JSON.stringify(orderUpdates));

                fetch(`${API_URL}?action=updateConferencierOrder`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: params
                })
                    .then(response => response.json())
                    .then(data => console.log('Order updated:', data))
                    .catch(error => console.error('Error updating order:', error));

                return newItems;
            });
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
                    <p>Chargement de l'interface admin...</p>
                </div>
            </div>
        );
    }

    return (
        <AdminLayout>
            <div className="min-h-screen bg-neutral-50 dark:bg-linear-to-br dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
                <div className="sticky top-0 z-10 backdrop-blur-xl bg-neutral-900/90 border-b border-neutral-800">
                    <div className="container mx-auto px-4 py-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div>
                                    <h1 className="text-lg font-bold text-white">Gestion des Intervenants</h1>
                                    <p className="text-[10px] text-neutral-400">Event {eventId} • Session {adminId}</p>
                                </div>
                                <div className="hidden md:flex items-center gap-2">
                                    <EventSessionSelector
                                        futureEvents={futureEvents}
                                        confEventListLight={confEventListLight}
                                        idEvent={eventId}
                                        idConfEvent={adminId}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 items-center">
                                <div className="relative">
                                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-neutral-400" />
                                    <Input
                                        type="text"
                                        placeholder="Filtrer..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="h-7 w-40 pl-8 text-xs bg-neutral-800 border-neutral-700 focus:ring-emerald-600 text-white placeholder:text-neutral-500"
                                    />
                                </div>
                                <Button variant="outline" size="sm" onClick={() => display('177820', 'https://www.event2one.com/screen_manager/content/blank.php', 9)}

                                    className="h-7 text-xs border-neutral-700 hover:bg-neutral-800 bg-neutral-800 hover:text-white hover:border-neutral-600  ">
                                    <EyeOff className="w-3 h-3 mr-1" />Masquer titrage
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowScreenPanel(true)}
                                    className="h-7 text-xs border-neutral-700 bg-neutral-800 hover:bg-neutral-800 hover:text-white hover:border-neutral-600 hover:shadow-lg hover:shadow-neutral-600"
                                >
                                    <Monitor className="w-3 h-3 mr-1" />
                                    Voir les écrans
                                </Button>
                                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700">
                                            <UserPlus className="w-3 h-3 mr-1" />Ajouter
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[600px] bg-neutral-900 border-neutral-800">
                                        <DialogHeader>
                                            <DialogTitle className="text-white">Ajouter un intervenant</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            {/* Contact Type Selector */}
                                            <div>
                                                <label className="text-sm font-medium text-neutral-300 mb-2 block">
                                                    Type de contact
                                                </label>
                                                <select
                                                    value={selectedContactType}
                                                    onChange={(e) => setSelectedContactType(e.target.value)}
                                                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                                >
                                                    <option value="">Sélectionner un type...</option>
                                                    {eventContactTypeList.map((type) => (
                                                        <option key={type.id_event_contact_type} value={type.id_event_contact_type}>
                                                            {type.libelle}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Search Input */}
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                                <Input
                                                    type="text"
                                                    placeholder="Rechercher par nom, prénom, société..."
                                                    onChange={getContactList}
                                                    className="pl-10 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
                                                />
                                            </div>
                                            <div className="max-h-[300px] overflow-y-auto space-y-2">
                                                {searchContactList.length > 0 ? (
                                                    searchContactList.map((contact) => (
                                                        <div
                                                            key={contact.id_contact}
                                                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors border ${selectedContact?.id_contact === contact.id_contact
                                                                ? 'bg-emerald-900/30 border-emerald-600'
                                                                : 'bg-neutral-800/50 hover:bg-neutral-800 border-neutral-700/50'
                                                                }`}
                                                            onClick={() => setSelectedContact(contact)}
                                                        >
                                                            <Avatar className="w-10 h-10 border border-neutral-700">
                                                                <Image src={contact.photos?.tiny} alt="Contact search result photo" width={40} height={40} className="object-cover" />
                                                            </Avatar>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-white font-medium text-sm">
                                                                    {contact.prenom} <span className="uppercase">{contact.nom}</span>
                                                                </p>
                                                                <p className="text-neutral-400 text-xs truncate">{contact.societe}</p>
                                                            </div>
                                                            {contact.flag && (
                                                                <Image src={contact.flag} alt="Flag" width={20} height={16} className="w-5 h-4 rounded-sm object-cover" />
                                                            )}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-center py-8 text-neutral-500 text-sm">
                                                        <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                                        <p>Commencez à taper pour rechercher un contact</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Position Button */}
                                            <div className="pt-4 border-t border-neutral-800">
                                                <Button
                                                    onClick={async () => {
                                                        if (selectedContact && selectedContactType) {
                                                            setIsPositioning(true);
                                                            await handleCreateConferencier(selectedContact, selectedContactType, adminId.toString());
                                                            setIsPositioning(false);
                                                            setIsDialogOpen(false);
                                                            setSelectedContact(null);
                                                            setSelectedContactType('');
                                                            setSearchContactList([]);
                                                        }
                                                    }}
                                                    disabled={!selectedContact || !selectedContactType || isPositioning}
                                                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-700 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                >
                                                    {isPositioning ? (
                                                        <>
                                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            <span>Positionnement...</span>
                                                        </>
                                                    ) : (
                                                        'Positionner le contact'
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                                <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
                                    <DialogContent className="sm:max-w-[425px] bg-neutral-900 border-neutral-800">
                                        <DialogHeader>
                                            <DialogTitle className="text-white">Confirmer la suppression</DialogTitle>
                                        </DialogHeader>
                                        <div className="py-4">
                                            <p className="text-neutral-300 text-sm">
                                                Êtes-vous sûr de vouloir masquer cet intervenant ?
                                            </p>
                                        </div>
                                        <div className="flex justify-end gap-3">
                                            <Button
                                                variant="outline"
                                                onClick={() => setIsConfirmDialogOpen(false)}
                                                className="border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white"
                                                disabled={isHiding}
                                            >
                                                Annuler
                                            </Button>
                                            <Button
                                                onClick={confirmHideConferencier}
                                                className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                                                disabled={isHiding}
                                            >
                                                {isHiding ? (
                                                    <>
                                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        <span>Traitement...</span>
                                                    </>
                                                ) : (
                                                    'Confirmer'
                                                )}
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>

                                <Dialog open={isEditPrestaDialogOpen} onOpenChange={setIsEditPrestaDialogOpen}>
                                    <DialogContent className="sm:max-w-[500px] bg-neutral-900 border-neutral-800">
                                        <DialogHeader>
                                            <DialogTitle className="text-white">Modifier la prestation</DialogTitle>
                                        </DialogHeader>
                                        {editingPresta && (
                                            <div className="space-y-4 py-4">
                                                <div>
                                                    <label className="text-sm font-medium text-neutral-300 mb-1 block">Nom de la prestation</label>
                                                    <Input
                                                        value={editingPresta.presta_nom}
                                                        onChange={(e) => setEditingPresta({ ...editingPresta, presta_nom: e.target.value })}
                                                        className="bg-neutral-800 border-neutral-700 text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-neutral-300 mb-1 block">Punchline</label>
                                                    <Input
                                                        value={editingPresta.punchline || ''}
                                                        onChange={(e) => setEditingPresta({ ...editingPresta, punchline: e.target.value })}
                                                        className="bg-neutral-800 border-neutral-700 text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-neutral-300 mb-1 block">URL Vidéo</label>
                                                    <Input
                                                        value={editingPresta.video_url || ''}
                                                        onChange={(e) => setEditingPresta({ ...editingPresta, video_url: e.target.value })}
                                                        className="bg-neutral-800 border-neutral-700 text-white"
                                                    />
                                                </div>
                                                <div className="flex justify-end gap-3 pt-4">
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => setIsEditPrestaDialogOpen(false)}
                                                        className="border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white"
                                                        disabled={isUpdatingPresta}
                                                    >
                                                        Annuler
                                                    </Button>
                                                    <Button
                                                        onClick={handleUpdatePresta}
                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                                        disabled={isUpdatingPresta}
                                                    >
                                                        {isUpdatingPresta ? 'Enregistrement...' : 'Enregistrer'}
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex relative">
                    <div className="flex-1 container mx-auto px-4 py-2 transition-all duration-300">
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={partenaireList2.filter(p => {
                                const term = searchTerm.toLowerCase();
                                const contact = p.contact;
                                return (
                                    contact?.nom?.toLowerCase().includes(term) ||
                                    contact?.prenom?.toLowerCase().includes(term) ||
                                    contact?.societe?.toLowerCase().includes(term)
                                );
                            }).map(p => p.id_conferencier)} strategy={verticalListSortingStrategy}>
                                <div className="space-y-0.5">
                                    {partenaireList2 && partenaireList2.filter(p => {
                                        const term = searchTerm.toLowerCase();
                                        const contact = p.contact;
                                        return (
                                            contact?.nom?.toLowerCase().includes(term) ||
                                            contact?.prenom?.toLowerCase().includes(term) ||
                                            contact?.societe?.toLowerCase().includes(term)
                                        );
                                    }).map((partenaire, index) => {
                                        // Get the first prestation from the list
                                        const presta = partenaire.contact?.prestas_list?.[0];
                                        if (!partenaire.contact) return null;
                                        return (
                                            <SortableContactRow
                                                key={partenaire.id_conferencier}
                                                partenaire={partenaire}
                                                presta={presta}
                                                index={index}
                                                idEvent={eventId}
                                                onPublish={publishAllContent}
                                                onClear={clearJuryScreens}
                                                onHide={handleUpdateConferencier}
                                                onEdit={handleEditPresta}
                                            />
                                        );
                                    })}


                                    {(!partenaireList2 || partenaireList2.length === 0) && (
                                        <div className="flex items-center justify-center py-12">
                                            <motion.svg width="60" height="60" viewBox="0 0 100 100" className="text-white">
                                                <motion.path
                                                    d="M 50 10 L 90 35 L 75 80 L 25 80 L 10 35 Z"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="3"
                                                    initial={{ pathLength: 0 }}
                                                    animate={{ pathLength: [0, 1, 1, 0], rotate: [0, 0, 360, 360] }}
                                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                                />
                                            </motion.svg>
                                        </div>
                                    )}
                                </div>
                            </SortableContext>
                        </DndContext>
                    </div>

                    {/* Screen Preview Side Panel */}
                    <AnimatePresence>
                        {showScreenPanel && (
                            <motion.div
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: 400, opacity: 1 }}
                                exit={{ width: 0, opacity: 0 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="sticky top-[57px] h-[calc(100vh-57px)] bg-neutral-900 border-l border-neutral-800 shadow-2xl z-40 flex flex-col overflow-hidden"
                            >
                                <div className="flex items-center justify-between p-4 border-b border-neutral-800 min-w-[400px]">
                                    <h2 className="text-white font-semibold flex items-center gap-2">
                                        <Monitor className="w-4 h-4" />
                                        Aperçu Écran
                                    </h2>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowScreenPanel(false)}
                                        className="h-8 w-8 p-0 text-neutral-400 hover:text-white hover:bg-neutral-800"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="p-4 space-y-4 flex-1 flex flex-col min-w-[400px]">
                                    <div className="space-y-2">
                                        <label className="text-sm text-neutral-400">Sélectionner un écran</label>
                                        <select
                                            value={previewScreenId}
                                            onChange={(e) => setPreviewScreenId(Number(e.target.value))}
                                            className="w-full bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                        >
                                            {Array.from({ length: 50 }, (_, i) => i + 1).map((num) => (
                                                <option key={num} value={num}>
                                                    Écran {num}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex-1 bg-black rounded-lg overflow-hidden border border-neutral-800 relative">
                                        <iframe
                                            src={`/saas/broadcast/screen/${previewScreenId}`}
                                            className="absolute inset-0 w-full h-full border-0"
                                            title={`Screen ${previewScreenId}`}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* User Connection Notifications */}
                <div className="fixed top-20 right-4 z-50 flex flex-col items-end">
                    <AnimatePresence>
                        {newConnections.map((connection) => (
                            <UserConnectionToast
                                key={connection.id}
                                id={connection.id}
                                name={connection.name}
                                company={connection.company}
                                timestamp={connection.timestamp}
                                onDismiss={(id) => setNewConnections(prev => prev.filter(c => c.id !== id))}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </AdminLayout >
    );
};
