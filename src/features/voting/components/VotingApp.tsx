'use client';

import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import Header2 from './Header2';
import Section from './Section';
import ContactInfos from './ContactInfos';
import Demo from './Demo';
import SendVote from './SendVote';
import Thanks from './Thanks';
import Nav from './Nav';
import VisuelSection from './VisuelSection';
import { JuryEvent, ContactDatas, Note } from '../types';

// Translation constants
const TRANSLATIONS = {
    "en": {
        "titre": "Please fill in your matchmaking form",
        "soustitre": "Please fill out this mini form carefully. Your contact details will only be shared if you press the connect me button",
        "email": "E-mail",
        "mobile": "Mobile phone",
        "prenom": "First name",
        "nom": "Last name",
        "societe": "Company name",
        "web": "Website",
        "pays": "Country",
        "status": "Define your status",
        "endMessage": "After the event your profile will be checked and you will receive additional info about showcase solutions.",
        "connectMe": "Connect me",
        "cancelConnection": "Cancel the connection",
        "rankUpSolution": "Rank up solution",
        "rankPresentation": "Quality of presentation",
        "rankImpact": "Impact of the solution",
        "rankInnovation": "Innovation of the solution",
        "rankInterest": "Interest for my business sector",
        "voteEndTitle": "Voting is now over",
        "voteEndMessage": "If you wish, you can review some of your notes by pressing 'previous' or 'finalize my vote'",
        "finaliserVote": "Finalize my vote",
        "votingAndMatchmakingApp": "Voting / matchmaking app",
    },
    "fr": {
        "titre": "Veuillez remplir votre formulaire de matchmaking",
        "soustitre": "Veuillez remplir ce mini formulaire avec soin. Vos coordonnées ne seront partagées que si vous appuyez sur le bouton de connexion.",
        "email": "E-mail",
        "mobile": "Téléphone portable",
        "prenom": "Prénom",
        "nom": "Nom",
        "societe": "Nom de l'entreprise",
        "web": "Site web",
        "pays": "Pays",
        "status": "Définissez votre statut",
        "endMessage": "Après l'événement, votre profil sera vérifié et vous recevrez des informations supplémentaires sur les solutions présentées.",
        "connectMe": "Connectez-moi",
        "cancelConnection": "Annuler la connexion",
        "rankUpSolution": "Evaluer la solution",
        "rankPresentation": "Qualité de la présentation",
        "rankImpact": "Impact de la solution",
        "rankInnovation": "Innovation de la solution",
        "rankInterest": "Intérêt pour mon secteur d'activité",
        "voteEndTitle": "Le vote est maintenant terminé",
        "voteEndMessage": "Si vous le souhaitez, vous pouvez revoir certaines de vos notes en appuyant sur 'précédent' ou 'finaliser mon vote'",
        "finaliserVote": "Finaliser mon vote",
        "votingAndMatchmakingApp": "Application de vote et de matchmaking",
    }
};

// Configuration constants
const displayDemoDescriptif = ['1618'];
const displayVideoIntro = ['1618'];
const displayOutro = ['1618'];
const notDisplayContactForm = ['1618'];
//const notDisplayRating = ['16180']
const notDisplayMeetingButton = ['16180'];

interface VotingAppProps {
    params: { slug: string[] };
}

const VotingApp: React.FC<VotingAppProps> = ({ params }) => {
    // State to hold real-time results after vote validation
    const [realTimeResults, setRealTimeResults] = React.useState<any>(null);

    // Parse slug params
    // slug[0] -> langId
    // slug[1] -> ije (id_jury_event)
    // slug[2] -> type / c / vote / idContact
    // This logic needs to be robust.
    // Based on routes:
    // /:langId/:ije/type/:voteType
    // /:langId/:ije/c/:idContact/type/:voteType
    // /:langId/:ije/c/:idContact/
    // /:langId/:ije/vote/:isActive
    // /:langId/:ije/:idContact
    // /:langId/:ije

    const slug = params.slug || [];
    const langId = slug[0] || 'fr';
    const ijeRaw = slug[1] || '';
    const ije = decodeURIComponent(ijeRaw);

    // Helper to extract other params
    // New format: /fr/ije/id_conf_event/idContact
    // Old formats still supported for backward compatibility
    let idContact = '';
    let voteType = '';
    let isActive = '';

    if (slug[2] === 'c') {
        // Old format: /fr/ije/c/idContact/type/voteType
        idContact = slug[3] || '';
        if (slug[4] === 'type') {
            voteType = slug[5] || '';
        }
    } else if (slug[2] === 'type') {
        // Old format: /fr/ije/type/voteType
        voteType = slug[3] || '';
    } else if (slug[2] === 'vote') {
        // Old format: /fr/ije/vote/isActive
        isActive = slug[3] || '';
    } else if (slug[2] && !isNaN(Number(slug[2]))) {
        // New format: /fr/ije/id_conf_event/idContact (id_conf_event is numeric)
        // slug[2] is id_conf_event, slug[3] is idContact (optional)
        idContact = slug[3] || '';
    } else if (slug[2]) {
        // Fallback: assume it's idContact if not a keyword
        idContact = slug[2];
    }

    // Mock match object to pass to children if they need it (legacy support)
    const match = {
        params: {
            langId,
            ije,
            idContact,
            voteType,
            isActive
        }
    };

    const [demos, setDemos] = useState<any[]>([]);
    const [demosByEventCycleLang, setDemosByEventCycleLang] = useState<any[]>([]); // Not used in render?
    const [notDisplayRating, setNotDisplayRating] = useState<string[]>(['16180']);
    const [juryEvent, setJuryEvent] = useState<JuryEvent | null>(null);
    const [translationsForLanguage, setTranslationsForLanguage] = useState<any>(null);
    const [voteIsValid, setVoteIsValid] = useState(false);
    const [contactStatutList, setContactStatutList] = useState<any[]>([]);
    const socketRef = useRef<Socket | null>(null);

    // Custom hook for localStorage
    const useLocalStorage = <T,>(key: string, defaultValue: T): [T, (value: T) => void] => {
        const [storedValue, setStoredValue] = useState<T>(() => {
            if (typeof window === 'undefined') return defaultValue;
            try {
                const item = window.localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.log(error);
                return defaultValue;
            }
        });

        const setValue = (value: T) => {
            try {
                const valueToStore = value instanceof Function ? value(storedValue) : value;
                setStoredValue(valueToStore);
                if (typeof window !== 'undefined') {
                    window.localStorage.setItem(key, JSON.stringify(valueToStore));
                }
            } catch (error) {
                console.log(error);
            }
        };

        return [storedValue, setValue];
    };

    const [activeSection, setActiveSection] = useLocalStorage<number>('activeSection', 0);
    const [notes, setNotes] = useLocalStorage<Note[]>('notes', []);
    const [contactDatas, setContactDatas] = useLocalStorage<ContactDatas>('contactDatas', {
        id_contact: '', mail: '', mobile: '', prenom: '', nom: '', societe: '', code_postal: '', ville: '', pays: ''
    });

    const handleContactDatas = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        // e.preventDefault(); // Not needed for change event
        setContactDatas({ ...contactDatas, [e.target.name]: e.target.value });
    }

    const getParcoursEval = async ({ id_jury_event, id_contact }: { id_jury_event: any, id_contact: any }) => {
        const filter = `WHERE id_jury_event=${id_jury_event} AND id_contact=${id_contact}`
        await fetch(`https://www.myglobalvillage.com/api/?action=getParcoursEval&filter=${filter}`)
            .then(res => res.json())
            .then(res => {
                if (res.length > 0) {
                    let stordedNotes = res.map((note: any) => {
                        return {
                            comprehension: note.comprehension,
                            meeting: note.meeting == "1" ? true : false,
                            contactMe: note.meeting == "1" ? true : false,
                            contact: note.meeting == "1" ? true : false,
                            id_presta: note.id_presta,
                            note: note.note,
                            presentation: note.presentation,
                            support: note.support,
                            timing: note.timing,
                        }
                    })
                    console.log('stordedNotes', stordedNotes);
                    setNotes(stordedNotes);
                    setRealTimeResults(stordedNotes);
                }
            })
            .catch(error => console.error('Error fetching parcours eval:', error));
    }

    const getContactStatutList = async (id_contact: any) => {
        const filter = `WHERE id_contact=${id_contact}`
        await fetch(`https://www.myglobalvillage.com/api/?action=getContactStatutList&filter=${filter}`)
            .then(res => res.json())
            .then(res => setContactStatutList(res))
    }

    const getContact = async () => {
        await fetch(`https://www.myglobalvillage.com/api/?action=getContact&id_contact=${idContact}`)
            .then(res => res.json())
            .then(contact => {
                setContactDatas({
                    id_contact: contact.id_contact,
                    mail: contact.mail,
                    mobile: contact.port, // mapped from port
                    port: contact.port,
                    prenom: contact.prenom,
                    nom: contact.nom,
                    societe: contact.societe,
                    code_postal: contact.cp,
                    ville: contact.ville,
                    pays: contact.pays,
                    photos: contact.photos,
                    logos: contact.logos,
                    web: contact.web
                })
            })
    }

    const textIntro = () => {
        if (!juryEvent) return null;

        let intro: React.ReactNode = "";
        let intro_en: React.ReactNode = "";

        if (['630', '660'].includes(juryEvent.id_conf_event_type)) {
            intro = <p>Pour suivre le parcours de visite, profitez des recommandations de Jacques et suivez le guide en appuyant sur " 〉 〉  〉     "</p>
        }
        else if (['67', '74', '88', '96'].includes(juryEvent.id_conf_event_type)) {
            //SESSION DE PITCH
            intro =
                <div className="bg-gray-50 border-l-4 border-blue-500 text-blue-800 p-4 rounded-md mb-8">
                    <h5 className=" uppercase font-semibold">How does it works ?</h5>
                    <div className="text-sm text-gray-600 mt-1">
                        <p>This mobile application allows you to vote in real time for the solutions that catch your attention, and to receive by email the contact details of the candidates who interest you.</p>
                        <p>That’s why we invite you to fill out the form below: when you press the *"Connect"* button during the competition, your contact details will automatically be sent to the candidates you select — and you’ll receive theirs by email.</p>
                        <p>Enjoy the pitch session!</p>
                    </div>
                </div>

        } else if (['97', '116'].includes(juryEvent.id_conf_event_type)) {
            //SESSION DE PITCH
            intro =
                <div className="bg-gray-50 border-l-4 border-blue-500 text-blue-800 p-4 rounded-md mb-8">
                    <div className="alert alert-info">
                        <div className="p-6 rounded-lg ">
                            <h2 className="text-2xl font-bold mb-4 uppercase">How Does It Work?</h2>
                            <p className="mb-4">
                                This mobile app lets you vote and rank in real-time while also giving you the option to receive contact details for your chosen solution directly via email.
                            </p>
                            <p>
                                To participate, simply fill out the form below. When you press the <span className="text-blue-500 font-semibold">“connect me”</span> blue button during a pitching session, your contact information will be automatically shared with the pitcher of your choice, and you’ll receive their details in return via email.
                            </p>
                        </div>

                    </div>
                    <div className="p-4 rounded-lg bg-white ">
                        <h1 className="text-2xl font-bold mb-4 uppercase">Disclaimer</h1>
                        <p className="text-gray-700 mb-2">
                            The myGlobalVillage  application facilitates connections between innovative companies and decision-makers through its events and pitching sessions. However, myGlobalVillage and its Partner are in no way a party to the commercial or professional relationships that may arise from these connections.
                        </p>
                        <p className="text-gray-700 mb-2">
                            Therefore,  myGlobalVillage disclaims any responsibility for the nature, quality, or execution of any agreement or commercial relationship established between the parties, as well as for any dispute, loss, or damage resulting from these relationships.
                        </p>
                        <p className="text-gray-700">
                            It is the responsibility of each party to conduct its own due diligence before entering into a partnership or commercial relationship.
                        </p>
                    </div>
                </div>

            intro_en = <div className="bg-gray-50 border-l-4 border-blue-500 text-blue-800 p-4 rounded-md mb-8">
                <div className="">
                    <div className="p-6 rounded-lg">
                        <h2 className="text-2xl font-bold mb-4 uppercase">Comment ça fonctionne ?</h2>

                        <div className="  text-gray-600 mt-1">
                            <p className="mb-4">
                                Cette application mobile vous permet de voter et de classer en temps réel, tout en vous offrant la possibilité de recevoir directement par e-mail les coordonnées de la solution que vous avez choisie.
                            </p>
                            <p>
                                Pour participer, il vous suffit de remplir le formulaire ci-dessous. Lorsque vous appuyez sur le bouton bleu <span className="text-blue-500 font-semibold">“connecte-moi”</span> pendant une session de pitch, vos coordonnées seront automatiquement partagées avec le porteur de projet de votre choix, et vous recevrez ses informations par e-mail en retour.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="p-4 rounded-lg bg-white">
                    <h1 className="text-lg font-bold mb-4 uppercase">Avertissement</h1>

                    <div className="text-xs text-gray-700">
                        <p className="text-gray-700 mb-2">
                            L'application myGlobalVillage facilite les connexions entre entreprises innovantes et décideurs grâce à ses événements et sessions de pitch. Cependant, myGlobalVillage et ses partenaires ne sont en aucun cas parties prenantes aux relations commerciales ou professionnelles qui pourraient découler de ces connexions.
                        </p>
                        <p className="text-gray-700 mb-2">
                            Par conséquent, myGlobalVillage décline toute responsabilité quant à la nature, la qualité ou l'exécution de tout accord ou relation commerciale établi entre les parties, ainsi que pour tout litige, perte ou dommage résultant de ces relations.
                        </p>
                        <p className="text-gray-700">
                            Il incombe à chaque partie d’effectuer sa propre vérification préalable avant d’entrer dans un partenariat ou une relation commerciale.
                        </p>
                    </div>
                </div>
            </div>


        } else if (['63', '66', ''].includes(juryEvent.id_conf_event_type)) {
            //PARCOURS
            intro = <div className="alert alert-info">
                <h5>Comment ça marche ?</h5>
                <p>Cette application mobile vous permet d'entrer en contact avec les exposants qui ont retenues votre attention</p>
                <p>C’est pourquoi nous vous   invitons à remplir le formulaire ci-après car en appuyant sur le bouton  « être mis en relation » lors de la compétition vos coordonnées seront automatiquement transmises aux candidats de votre choix et vous recevrez les siennes par mail.</p>
                <p>Bon parcours de visite</p>
            </div>
        }

        return <div>
            <VisuelSection juryEvent={juryEvent} />
            {juryEvent.id_jury_event == 5998 ? intro_en : intro}
        </div>
    }

    const createParcoursEval = async (data: any) => {
        if (!juryEvent) return;
        console.log('createParcoursEval', data);

        const createParcoursEvalData = {
            notes: [data],
            contactDatas: contactDatas,
            id_jury_event: juryEvent.id_jury_event,
            id_event: juryEvent.id_event
        }

        await fetch(`//www.mlg-consulting.com/smart_territory/form/api.php?action=createParcoursEval&debug=n`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(createParcoursEvalData)
        })
            .then(res => res.json())
            .then(res => {
                if (res.success) {
                    console.log("ParcoursEval created successfully");
                } else {
                    console.error("Error creating ParcoursEval:", res.message);
                }
            })
            .catch(error => {
                console.error("Error creating ParcoursEval:", error);
            });
    }

    const updateParcoursEval = async (data: any) => {
        if (!juryEvent) return;
        console.log('updateParcoursEval', data);
        const updateParcoursEvalData = {
            note: data,
            contactDatas: contactDatas,
            id_jury_event: juryEvent.id_jury_event,
            id_event: juryEvent.id_event
        }
        await fetch(`//www.mlg-consulting.com/smart_territory/form/api.php?action=updateParcoursEval&debug=y`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateParcoursEvalData)
        })
            .then(res => res.json())
            .then(res => {
                if (res.success) {
                    console.log("ParcoursEval updated successfully");
                } else {
                    console.error("Error updating ParcoursEval:", res.message);
                }
            })
            .catch(error => {
                console.error("Error updating ParcoursEval:", error);
            });
    }

    const handleValidVote = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!juryEvent) return;

        const payload = {
            notes,
            contactDatas,
            id_jury_event: juryEvent.id_jury_event,
            id_event: juryEvent.id_event
        };

        try {
            await fetch('https://www.event2one.com/parcours/vote/do.php?do=save_vote2&debug=y', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            setVoteIsValid(true);

            // if (contactDatas.id_contact) {
            //     await getParcoursEval({
            //         id_jury_event: juryEvent.id_jury_event,
            //         id_contact: contactDatas.id_contact
            //     });
            // }

        } catch (err) {
            console.error('Error saving vote', err);
        }
    };

    const handleContactMe = (e: any) => {
        const id_presta = e.target.getAttribute('id');

        const exist = notes.some(note => {
            return note.id_presta == parseInt(id_presta);
        })

        const elementsIndex = notes.findIndex(item => item.id_presta == id_presta);

        if (exist) {
            const newNotes = [...notes];
            newNotes[elementsIndex] = { ...newNotes[elementsIndex], 'contactMe': !newNotes[elementsIndex].contactMe }

            setNotes(newNotes)
            updateParcoursEval(newNotes[elementsIndex]);

        } else {
            setNotes([...notes, { contactMe: true, id_presta: id_presta }])
            createParcoursEval({ contactMe: true, id_presta: id_presta });
        }
    }

    const handleNote = (opt: any) => {
        const exist = notes.some(note => {
            return note.id_presta == parseInt(opt.id_presta);
        })

        if (exist) {
            const elementsIndex = notes.findIndex(item => item.id_presta == opt.id_presta)
            const newCritere = opt.critere;
            const newNotes = [...notes];
            newNotes[elementsIndex] = { ...newNotes[elementsIndex], [newCritere]: opt.note }
            setNotes(newNotes);
            updateParcoursEval(newNotes[elementsIndex]);
        } else {
            opt[opt.critere] = opt.note;
            setNotes([...notes, opt])
            createParcoursEval(opt);
        }
    }

    const scrollToTop = () => {
        if (typeof window !== 'undefined') {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            })
        }
    }

    const handleNextButton = () => {
        scrollToTop()
        setActiveSection(activeSection + 1);
    }

    const handlePreviousButton = () => {
        scrollToTop()
        setActiveSection(activeSection - 1);
    }

    const fetchDemos = async () => {
        await fetch(`//www.mlg-consulting.com/smart_territory/form/api.php?action=getVoteDemos&ije=${ije}`)
            .then(res => res.json())
            .then(res => {

                console.log(`https://www.mlg-consulting.com/smart_territory/form/api.php?action=getVoteDemos&ije=${ije}`)
                console.log('fetchDemos', res);
                setDemos(res)
            })

    }

    const fetchDemosByEventCycleLang = async () => {
        await fetch(`https://www.mlg-consulting.com/smart_territory/form/api.php?action=getVoteDemosByEventCycleLang&ije=${ije}`)
            .then(res => res.json())
            .then(res => {
                console.log('fetchDemosByEventCycleLang', res);
                setDemos(res);
            })
    }

    const fetchJuryEvent = async () => {
        if (!ije) return;

        const encodedIje = encodeURIComponent(ije);
        const url = `https://www.mlg-consulting.com/smart_territory/form/api.php?action=getJuryEvent&ije=${encodedIje}`;

        try {
            await fetch(url)
                .then(res => res.json())
                .then(juryEvent => {
                    setJuryEvent(juryEvent);

                    // getParcoursEval({
                    //     id_jury_event: juryEvent.id_jury_event,
                    //     id_contact: idContact ? idContact : contactDatas.id_contact
                    // });

                    return juryEvent;
                })
                .then(juryEvent => {
                    if (!juryEvent) return;
                    ['16188'].includes(String(juryEvent.id_event)) ? fetchDemosByEventCycleLang() : fetchDemos();

                    if (isActive == "0" && juryEvent) {
                        const newNotDisplayRating = [...notDisplayRating, String(juryEvent.id_event)];
                        setNotDisplayRating(newNotDisplayRating)
                    }

                    const selectedLanguage = juryEvent.id_jury_event == 5998 ? "fr" : "en";
                    setTranslationsForLanguage((TRANSLATIONS as any)[selectedLanguage] || TRANSLATIONS["en"]);
                })
        } catch (error) {
            console.error('fetchJuryEvent: Error', error);
        }
    }

    const displayDemos = () => {
        return demos.map((demo, index) => {
            const new_index = index + 3;
            return new_index == activeSection && <Section key={new_index}>
                <Demo
                    props={match}
                    translationsForLanguage={translationsForLanguage}
                    displayDemoDescriptif={displayDemoDescriptif}
                    notDisplayRating={notDisplayRating}
                    notDisplayMeetingButton={notDisplayMeetingButton}
                    juryEvent={juryEvent!}
                    handleContactMe={handleContactMe}
                    handleNote={handleNote}
                    key={demo.id_presta}
                    demo={demo}
                    numDemo={`${index + 1}/${demos.length}`}
                    notes={notes} /></Section>
        })
    }

    const displayDemosByEventCycleLang = () => {
        return demos.map((demo, index) => {
            const new_index = index + 3;
            return new_index == activeSection && <div key={new_index}>
                <Section key={new_index}>
                    <p>{demo.event_cycle_lang.event_cycle_lang_nom}</p>
                    <Demo
                        props={match}
                        translationsForLanguage={translationsForLanguage}
                        displayDemoDescriptif={displayDemoDescriptif}
                        notDisplayRating={notDisplayRating}
                        notDisplayMeetingButton={notDisplayMeetingButton}
                        juryEvent={juryEvent!}
                        handleContactMe={handleContactMe}
                        handleNote={handleNote}
                        key={demo.id_presta}
                        demo={demo}
                        numDemo={`${index + 1}/${demos.length}`}
                        notes={notes} />
                </Section>
            </div>
        })
    }

    // Fetch data on mount and when params change
    useEffect(() => {
        if (idContact) {
            getContact();
            getContactStatutList(idContact);
        }
        fetchJuryEvent();
        // window.scrollTo(0, 0); // Done in scrollToTop
    }, [ije, idContact, isActive]);

    // Socket.IO connection for admin notifications
    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Establish Socket.IO connection
        // Force www subdomain in production to match Apache virtualhost
        let socketUrl = window.location.origin;
        if (socketUrl.includes('event2one.com') && !socketUrl.includes('www.')) {
            socketUrl = socketUrl.replace('event2one.com', 'www.event2one.com');
        }
        socketRef.current = io(socketUrl, {
            path: '/saas/socket.io'
        });

        const socket = socketRef.current;

        socket.on('connect', () => {
            console.log('VotingApp: Socket connected');
        });

        socket.on('disconnect', () => {
            console.log('VotingApp: Socket disconnected');
        });

        // Cleanup on unmount
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    // Notify admin when contact form is complete OR when existing user connects
    const hasNotifiedRef = useRef(false);

    useEffect(() => {
        if (!socketRef.current || !juryEvent || hasNotifiedRef.current) return;

        // Get id_conf_event - either from URL (slug[2] if numeric) or from juryEvent
        let confEventId: string | number | undefined;

        // Check if slug[2] is numeric (id_conf_event) or if it's 'c' (old format)
        if (slug[2] && slug[2] !== 'c' && slug[2] !== 'type' && slug[2] !== 'vote' && !isNaN(Number(slug[2]))) {
            confEventId = slug[2]; // New format: /fr/ije/id_conf_event/idContact
            console.log('VotingApp: Using id_conf_event from URL:', confEventId);
        } else {
            confEventId = (juryEvent as any).id_conf_event?.id_conf_event; // Fallback to juryEvent data
            console.log('VotingApp: Using id_conf_event from juryEvent:', confEventId);
        }

        if (!confEventId) {
            console.warn('VotingApp: No id_conf_event found in URL or juryEvent');
            return;
        }

        // Case 1: Existing user with idContact in URL - notify immediately when data is loaded
        if (idContact && contactDatas.id_contact) {
            const isDataLoaded =
                contactDatas.prenom?.trim() &&
                contactDatas.nom?.trim() &&
                contactDatas.mail?.trim();

            if (isDataLoaded) {
                console.log('VotingApp: Existing user connected, emitting event', {
                    id_conf_event: confEventId,
                    idContact,
                    contactDatas
                });
                socketRef.current.emit('voting:user-connected', {
                    ije: confEventId, // Use id_conf_event (adminId) for session isolation
                    contactDatas
                });
                hasNotifiedRef.current = true;
            }
        }
        // Case 2: New user - notify when form is complete
        else if (!idContact) {
            const isFormComplete =
                contactDatas.prenom?.trim() &&
                contactDatas.nom?.trim() &&
                contactDatas.mail?.trim() &&
                contactDatas.societe?.trim();

            if (isFormComplete) {
                console.log('VotingApp: New user form complete, emitting event', {
                    id_conf_event: confEventId,
                    contactDatas
                });
                socketRef.current.emit('voting:user-connected', {
                    ije: confEventId, // Use id_conf_event (adminId) for session isolation
                    contactDatas
                });
                hasNotifiedRef.current = true;
            }
        }
    }, [juryEvent, idContact, contactDatas, slug]);



    if (!juryEvent || !translationsForLanguage) return <div className="text-center p-10">Loading...</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" id="vote" >

            {juryEvent && <Header2
                contactDatas={contactDatas}
                juryEvent={juryEvent}
                langId={langId} />}
            <div className="px-4 py-6 space-y-6 pb-24">


                {juryEvent && 0 == activeSection && translationsForLanguage && <Section key={0}>
                    <div className=" bg-neutral-50 text-center h-full py-5">

                        <div className="mb-3 text-3xl font-bold uppercase">{translationsForLanguage.votingAndMatchmakingApp}</div>
                        <p className="text-center">
                            <VisuelSection juryEvent={juryEvent} />
                        </p>
                        <h1 className="hidden">  {juryEvent.id_conf_event.conf_event_lang.cel_titre}</h1>
                    </div>
                </Section>}

                {1 == activeSection && <Section key={1}>
                    {textIntro()}
                </Section>}

                {activeSection == 2 && !notDisplayContactForm.includes(String(juryEvent.id_event)) && <Section key={2}>
                    <ContactInfos
                        translationsForLanguage={translationsForLanguage}
                        props={match}
                        juryEvent={juryEvent}
                        contactStatutList={contactStatutList}
                        setContactDatas={setContactDatas}
                        contactDatas={contactDatas}
                        handleContactDatas={handleContactDatas} />
                </Section>
                }

                {activeSection == 2 && displayVideoIntro.includes(String(juryEvent.id_event)) && <Section key={2}>
                    <h2 className="my-5">L'expert de l'entrepôt du futur vous décrypte les tendances</h2>
                    <iframe width="100%" height="315" src="https://www.youtube.com/embed/eVEEd11arG8" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                </Section>
                }

                {juryEvent && ['16188'].includes(String(juryEvent.id_event)) ? displayDemosByEventCycleLang() : displayDemos()}

                {activeSection == (demos.length + 3) && displayOutro.includes(String(juryEvent.id_event)) && <Section key={(demos.length + 3)}>
                    <iframe width="100%" height="315" src="https://www.youtube.com/embed/MpzRYdUEV-c" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                </Section>
                }

                {activeSection == (demos.length + 3) && <Section key={(demos.length + 3)}>
                    {!voteIsValid ? <SendVote
                        translationsForLanguage={translationsForLanguage}
                        handleValidVote={handleValidVote}
                        juryEvent={juryEvent} /> : (
                        <div>
                            <Thanks />
                            {realTimeResults && (
                                <div className="mt-6 p-4 bg-white rounded shadow">
                                    <h3 className="text-xl font-bold mb-4">Vos résultats en temps réel</h3>
                                    <div className="space-y-4">
                                        {realTimeResults.map((result: any, idx: number) => (
                                            <div key={idx} className="border-b pb-2">
                                                <p className="font-semibold">Presta ID: {result.id_presta}</p>
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <div>Compréhension: {result.comprehension}/5</div>
                                                    <div>Timing: {result.timing}/5</div>
                                                    <div>Support: {result.support}/5</div>
                                                    <div>Note globale: {result.note}/5</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </Section>
                }

            </div>
            {
                !voteIsValid &&
                    // N'affiche pas la navigation si on est sur la section 2 et que les champs obligatoires sont vides
                    !(
                        activeSection === 2 &&
                        (
                            !contactDatas.prenom.trim() ||
                            !contactDatas.nom.trim() ||
                            !contactDatas.mail.trim() ||
                            !contactDatas.societe.trim() ||
                            !contactDatas.pays.trim()
                        )
                    ) ? (
                    <Nav
                        handleNextButton={handleNextButton}
                        handlePreviousButton={handlePreviousButton}
                        setActiveSection={setActiveSection}
                        activeSection={activeSection}
                        nbDemos={demos.length}
                    />
                ) : null
            }
        </div>
    )
}

export default VotingApp;
