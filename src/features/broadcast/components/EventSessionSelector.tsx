import React from 'react';
import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarTrigger,
} from "./ui/menubar";
import { ChevronDown } from 'lucide-react';

import { Event, ConfEvent } from '../types';

interface EventSessionSelectorProps {
    futureEvents: Event[];
    confEventListLight: ConfEvent[];
    idEvent: number;
    idConfEvent: number;
}

const EventSessionSelector: React.FC<EventSessionSelectorProps> = ({ futureEvents, confEventListLight, idEvent, idConfEvent }) => {
    return (
        <div className="flex items-center gap-2">
            <Menubar className="bg-neutral-800 border-neutral-700 h-auto p-0">
                <MenubarMenu>
                    <MenubarTrigger className="text-white text-xs hover:bg-neutral-700 data-[state=open]:bg-neutral-700 cursor-pointer px-3 py-1.5 h-auto">
                        {futureEvents?.find(e => e.id_event === idEvent.toString())?.nom || "Événement inconnu"}
                        <ChevronDown className="ml-2 h-3 w-3 opacity-50" />
                    </MenubarTrigger>
                    <MenubarContent className="bg-neutral-800 border-neutral-700 max-h-[300px] overflow-y-auto">
                        {futureEvents && futureEvents.map((evt) => (
                            <MenubarItem
                                key={evt.id_event}
                                className="text-xs text-white focus:bg-neutral-700 focus:text-white cursor-pointer flex flex-col items-start gap-1 py-2"
                                onClick={() => window.location.href = `/broadcast/event/${evt.id_event}/admin/0`}
                            >
                                <span className="font-medium">{evt.nom}</span>
                                <span className="text-[10px] text-neutral-400">{evt.event_start} - {evt.event_end}</span>
                            </MenubarItem>
                        ))}
                    </MenubarContent>
                </MenubarMenu>
            </Menubar>
            <Menubar className="bg-neutral-800 border-neutral-700 h-auto p-0">
                <MenubarMenu>
                    <MenubarTrigger className="text-white text-xs hover:bg-neutral-700 data-[state=open]:bg-neutral-700 cursor-pointer px-3 py-1.5 h-auto">
                        {idConfEvent === 0 ? "Toutes les sessions" : (confEventListLight?.find(c => c.id_conf_event === idConfEvent.toString())?.cel_titre || "Session inconnue")}
                        <ChevronDown className="ml-2 h-3 w-3 opacity-50" />
                    </MenubarTrigger>
                    <MenubarContent className="bg-neutral-800 border-neutral-700 max-h-[300px] overflow-y-auto">
                        <MenubarItem
                            className="text-xs text-white focus:bg-neutral-700 focus:text-white cursor-pointer"
                            onClick={() => window.location.href = `/broadcast/event/${idEvent}/admin/0`}
                        >
                            Toutes les sessions
                        </MenubarItem>
                        {confEventListLight && confEventListLight.map((conf) => (
                            <MenubarItem
                                key={conf.id_conf_event}
                                className="text-xs text-white focus:bg-neutral-700 focus:text-white cursor-pointer flex flex-col items-start gap-1 py-2"
                                onClick={() => window.location.href = `/broadcast/event/${idEvent}/admin/${conf.id_conf_event}`}
                            >
                                <div className="flex items-center gap-2 w-full">
                                    <span className="font-medium">{conf.heure_debut} - {conf.heure_fin}</span>
                                    <span className="truncate flex-1">{conf.cel_titre}</span>
                                </div>
                                {conf.type && (
                                    <span
                                        style={{ backgroundColor: conf.type.color }}
                                        className="text-[10px] px-1 rounded-sm"
                                    >
                                        {conf.type.conf_event_type_nom}
                                    </span>
                                )}
                            </MenubarItem>
                        ))}
                    </MenubarContent>
                </MenubarMenu>
            </Menubar>
        </div>
    );
};

export default EventSessionSelector;
