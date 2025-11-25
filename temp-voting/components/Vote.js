
const { useState, useEffect } = React;

const displayDemoDescriptif = ['1618']
const displayVideoIntro = ['1618']
const displayOutro = ['1618']
const notDisplayContactForm = ['1618']
//const notDisplayRating = ['16180']
const notDisplayMeetingButton = ['16180']




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



const VisuelSection = ({ juryEvent }) => {


    const [confEventCycleLangList, setConfEventCycleLangList] = useState(null);

    const getConfEventCycleLang = async ({ id_conf_event }) => {


        const params = ` WHERE id_conf_event =${id_conf_event} `
        await fetch(`//www.mlg-consulting.com/smart_territory/form/api.php?action=getConfEventCycleLang&params=${params}`)
            .then(res => res.json())
            .then(res => setConfEventCycleLangList(res))

    }

    useEffect(() => {
        if (juryEvent) {
            getConfEventCycleLang({ id_conf_event: juryEvent.id_conf_event.id_conf_event });
        }
    }, [juryEvent]);


    return (<div>
        <div className=" ">
            {
                confEventCycleLangList && confEventCycleLangList.some(item =>
                    item.id_cycle_lang.attachedFilesCollection.find(attachedFile => attachedFile.id_attached_file_type == 113)
                )
                    ? confEventCycleLangList.map(item => {
                        const attachedFilesCollection = item.id_cycle_lang.attachedFilesCollection;
                        const globalshowVisuel = attachedFilesCollection.find(attachedFile => attachedFile.id_attached_file_type == 113);
                        return globalshowVisuel
                            ? <img className="mx-auto  mb-5" src={globalshowVisuel.medium} alt="" style={{ maxWidth: '90%' }} />
                            : null;
                    })
                    : <img
                        src={juryEvent.event.logos.medium}
                        alt=""
                        className="mx-auto"
                        style={{ maxWidth: '90%' }}
                    />
            }
        </div>
    </div>
    )
}

const Vote = (props) => {

    const [demos, setDemos] = useState([]);

    const [demosByEventCycleLang, setDemosByEventCycleLang] = useState([]);

    const [notDisplayRating, setNotDisplayRating] = useState(['16180']);

    const [juryEvent, setJuryEvent] = useState();

    const [logoIntro, setLogoIntro] = useState();

    const [translationsForLanguage, setTranslationsForLanguage] = useState(null);

    const [voteIsValid, setVoteIsValid] = useState(false);

    const useLocalStorage = (key, defaultValue) => {
        const stored = localStorage.getItem(key);
        const initial = stored ? JSON.parse(stored) : defaultValue;
        const [value, setValue] = useState(initial);

        useEffect(() => {
            localStorage.setItem(key, JSON.stringify(value));
        }, [key, value]);

        return [value, setValue];
    };

    const [activeSection, setActiveSection] = useLocalStorage('activeSection', 0);

    const [notes, setNotes] = useLocalStorage('notes', []);

    const [contactDatas, setContactDatas] = useLocalStorage('contactDatas', { id_contact: '', mail: '', mobile: '', prenom: '', nom: '', societe: '', code_postal: '', ville: '', pays: '' });

    const [contactStatutList, setContactStatutList] = useState([]);

    const handleContactDatas = (e) => {

        e.preventDefault();

        setContactDatas({ ...contactDatas, [e.target.name]: e.target.value })
    }


    const getParcoursEval = async ({ id_jury_event, id_contact }) => {

        const filter = `WHERE id_jury_event=${id_jury_event} AND id_contact=${id_contact}`

        await fetch(`https://www.myglobalvillage.com/api/?action=getParcoursEval&filter=${filter}`)
            .then(res => res.json())
            .then(res => {
                if (res.length > 0) {
                    // setNotes(res[0].notes);

                    let stordedNotes = res.map(note => {

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


                    // setContactDatas({
                    //     id_contact: res[0].id_contact,
                    //     mail: res[0].mail,
                    //     port: res[0].port,
                    //     prenom: res[0].prenom,
                    //     nom: res[0].nom,
                    //     societe: res[0].societe,
                    //     code_postal: res[0].code_postal,
                    //     ville: res[0].ville,
                    //     pays: res[0].pays,
                    //     photos: res[0].photos,
                    //     logos: res[0].logos,
                    //     web: res[0].web
                    // });
                }
            })
            .catch(error => console.error('Error fetching parcours eval:', error));


    }

    const getContactStatutList = async (id_contact) => {

        const filter = `WHERE id_contact=${id_contact}`

        await fetch(`https://www.myglobalvillage.com/api/?action=getContactStatutList&filter=${filter}`)
            .then(res => res.json())
            .then(res => setContactStatutList(res))

    }

    const getContact = async () => {

        await fetch(`https://www.myglobalvillage.com/api/?action=getContact&id_contact=${props.match.params.idContact}`)
            .then(res => res.json())
            .then(contact => {
                setContactDatas({
                    id_contact: contact.id_contact,
                    mail: contact.mail,
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

        let intro = "";
        let intro_en = "";

        if (['630', '660'].includes(juryEvent.id_conf_event_type)) {
            intro = <p>Pour suivre le parcours de visite, profitez des recommandations de Jacques et suivez le guide en appuyant sur " 〉 〉  〉     "</p>
        }
        else if (['67', '74', '88', '96'].includes(juryEvent.id_conf_event_type)) {

            //SESSION DE PITCH
            intro =
                <div className="bg-gray-50 border-l-4 border-blue-500 text-blue-800 p-4 rounded-md mb-8">
                    {/* <h5 className="uppercase">Comment ça marche ?</h5>
                    <p>Cette application mobile vous permet de voter en temps réel pour les solutions qui ont retenues votre attention mais également de recevoir par mail les coordonnées des candidats qui vous ont séduit.</p>
                    <p>C'est pourquoi nous vous   invitons à remplir le formulaire ci-après car en appuyant sur le bouton  « être mis en relation » lors de la compétition vos coordonnées seront automatiquement transmises aux candidats de votre choix et vous recevrez les siennes par mail.</p>
                    <p>Bonne session de pitch</p>

                    <hr /> */}
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
                    <div class="p-4 rounded-lg bg-white ">
                        <h1 class="text-2xl font-bold mb-4 uppercase">Disclaimer</h1>
                        <p class="text-gray-700 mb-2">
                            The myGlobalVillage  application facilitates connections between innovative companies and decision-makers through its events and pitching sessions. However, myGlobalVillage and its Partner are in no way a party to the commercial or professional relationships that may arise from these connections.
                        </p>
                        <p class="text-gray-700 mb-2">
                            Therefore,  myGlobalVillage disclaims any responsibility for the nature, quality, or execution of any agreement or commercial relationship established between the parties, as well as for any dispute, loss, or damage resulting from these relationships.
                        </p>
                        <p class="text-gray-700">
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

                <div className="d-none">
                    <hr />

                    <h5 className="text-muted uppercase">How does it works ?</h5>
                    <p className="text-muted">This mobile application allows you to get in touch with the exhibitors that have caught your attention</p>
                    <p className="text-muted">This is why we invite you to fill in the form below, because by pressing the "contact us" button, your details will automatically be sent to the candidates of your choice and you will receive theirs by email.</p>
                    <p className="text-muted">Good pitch session</p>
                </div>

            </div>
        }

        return <div>
            <VisuelSection juryEvent={juryEvent} />
            {juryEvent.id_jury_event == 5998 ? intro_en : intro}
        </div>
    }

    const updateParcoursEval = async (data) => {

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


    const handleValidVote = (e) => {

        e.preventDefault;

        const data = {
            notes: notes,
            contactDatas: contactDatas,
            id_jury_event: juryEvent.id_jury_event,
            id_event: juryEvent.id_event

        }

        fetch('https://www.event2one.com/parcours/vote/do.php?do=save_vote2&debug=y', {
            method: 'POST',
            body: JSON.stringify(data)
        })
            .then(res => res.json())
            .then((result) => {

            });

        setVoteIsValid(true);

    }

    const handleContactMe = (e) => {

        const id_presta = e.target.attributes.id_presta.textContent;

        const exist = notes.some(note => {

            return note.id_presta == parseInt(id_presta);
        })

        //console.log(e.target);

        const elementsIndex = notes.findIndex(item => item.id_presta == id_presta);

        if (exist) {

            const newNotes = [...notes];
            newNotes[elementsIndex] = { ...newNotes[elementsIndex], 'contactMe': !newNotes[elementsIndex].contactMe }

            if (newNotes[elementsIndex].contactMe == true) {

                e.target.classList.remove("btn-primary");
                e.target.classList.add("btn-success");
            } else {
                e.target.classList.add("btn-success");
                e.target.classList.remove("btn-primary");
            }

            console.log(e.target);
            setNotes(newNotes)
            updateParcoursEval(newNotes[elementsIndex]);

        } else {

            setNotes([...notes, { contactMe: true, id_presta: id_presta }])

            createParcoursEval({ contactMe: true, id_presta: id_presta });
        }

        //store notes in localStorage
        localStorage.setItem('notes', JSON.stringify(notes));

    }

    const createParcoursEval = async (data) => {

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

    const handleNote = (opt) => {

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

            opt[opt.critere] = opt.note,

                setNotes([...notes, opt])

            createParcoursEval(opt);
        }



    }


    const scrollToTop = () => {
        var rootElement = document.documentElement
        var TOGGLE_RATIO = 0.80

        //scroll to top logic
        rootElement.scrollTo({
            top: -100,
            behavior: "smooth"
        })
    }

    const displaySection = () => {

        const sections = document.querySelectorAll("section");

        console.log(sections, activeSection, juryEvent.id_event, displayOutro.includes(juryEvent.id_event), juryEvent);
    }

    const handleNextButton = () => {

        scrollToTop()
        //window.scrollTo(0, 0);
        setActiveSection(activeSection + 1);

        displaySection();
    }

    const handlePreviousButton = () => {
        scrollToTop()
        //window.scrollTo(0, 0);
        setActiveSection(activeSection - 1);

        displaySection();

    }

    const fetchDemos = async () => {

        await fetch(`//www.mlg-consulting.com/smart_territory/form/api.php?action=getVoteDemos&ije=${props.match.params.ije}`)
            .then(res => res.json())
            .then(res => setDemos(res))
    }

    const fetchDemosByEventCycleLang = async () => {

        await fetch(`//www.mlg-consulting.com/smart_territory/form/api.php?action=getVoteDemosByEventCycleLang&ije=${props.match.params.ije}`)
            .then(res => res.json())
            .then(res => setDemos(res))
    }




    const fetchJuryEvent = async () => {

        await fetch(`//www.mlg-consulting.com/smart_territory/form/api.php?action=getJuryEvent&ije=${props.match.params.ije}`)
            .then(res => res.json())
            .then(juryEvent => {
                setJuryEvent(juryEvent);

                getParcoursEval({
                    id_jury_event: juryEvent.id_jury_event,
                    id_contact: props.match.params.idContact ? props.match.params.idContact : contactDatas.id_contact
                });

                return juryEvent;
            })
            .then(juryEvent => {

                ['16188'].includes(juryEvent.id_event) ? fetchDemosByEventCycleLang() : fetchDemos();

                if (props.match.params.isActive == "0" && juryEvent) {

                    const newNotDisplayRating = [...notDisplayRating, juryEvent.id_event];
                    setNotDisplayRating(newNotDisplayRating)

                    console.log(newNotDisplayRating);
                }

                const selectedLanguage = juryEvent.id_jury_event == 5998 ? "fr" : "en"; // Example condition to select language, adjust as needed
                setTranslationsForLanguage(TRANSLATIONS[selectedLanguage] || TRANSLATIONS["en"]); // Fallback to



            })
    }


    const displayDemos = () => {

        return demos.map((demo, index) => {

            const new_index = index + 3;

            return new_index == activeSection && <Section key={new_index}>
                <Demo
                    props={props}
                    translationsForLanguage={translationsForLanguage}
                    displayDemoDescriptif={displayDemoDescriptif}
                    notDisplayRating={notDisplayRating}
                    notDisplayMeetingButton={notDisplayMeetingButton}
                    juryEvent={juryEvent}
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

            return new_index == activeSection && <div>

                <Section key={new_index}>
                    <p>{demo.event_cycle_lang.event_cycle_lang_nom}</p>
                    <Demo
                        displayDemoDescriptif={displayDemoDescriptif}
                        notDisplayRating={notDisplayRating}
                        notDisplayMeetingButton={notDisplayMeetingButton}
                        juryEvent={juryEvent}
                        handleContactMe={handleContactMe}
                        handleNote={handleNote}
                        key={demo.id_presta}
                        demo={demo}
                        numDemo={`${index + 1}/${demos.length}`}
                        notes={notes} /></Section></div>
        })
    }

    useEffect(() => {
        fetchJuryEvent();

        props.match.params.idContact && getContact();

        !props.match.params.idContact && getContactStatutList(contactDatas.id_contact);

        console.log('notesue', notes, notDisplayRating, props.match.params.isActive)

        window.scrollTo(0, 0);

    }, [props.match.params.ije, props.match.params.idContact, props.match.params.isActive]);

    if (!juryEvent || !translationsForLanguage) return <div className="text-center">Loading...</div>;

    return (

        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" id="vote" >

            {juryEvent && <Header2
                contactDatas={contactDatas}
                juryEvent={juryEvent}
                langId={props.match.params.langId} />}
            <div className="px-4 py-6 space-y-6 pb-24">


                {juryEvent && 0 == activeSection && translationsForLanguage && <Section key={0}>
                    <div className=" bg-neutral-50 text-center h-full py-5">

                        <div className="mb-3 text-3xl font-bold uppercase">{translationsForLanguage.votingAndMatchmakingApp}</div>
                        <p className="text-center">
                            <VisuelSection juryEvent={juryEvent} />



                            {/* <div>
                            {
                                juryEvent && ['67', '88', '74'].includes(juryEvent.id_conf_event_type) ? "pitch" : ""
                            }
                        </div> */}

                            {
                                /*	juryEvent && ['67','88','74'].includes(juryEvent.id_conf_event_type) ? <img src="//www.mlg-consulting.com/manager_cc/docs/archives/211013151658_briques-11.png" alt="" style={{ maxWidth: '100%' }}  /> :
                                
            
                                        <img src="//www.mlg-consulting.com/manager_cc/docs/archives/211013145238_briques-12.png" style={{ maxWidth: '100%' }} className="mb-2" />
                                  */
                            }
                        </p>
                        <h1 className="hidden">  {juryEvent.id_conf_event.conf_event_lang.cel_titre}</h1>
                    </div>
                </Section>}

                {1 == activeSection && <Section key={1}>

                    {textIntro()}

                </Section>}

                {activeSection == 2 && !notDisplayContactForm.includes(juryEvent.id_event) && <Section key={2}>
                    <ContactInfos
                        translationsForLanguage={translationsForLanguage}
                        props={props}
                        juryEvent={juryEvent}
                        contactStatutList={contactStatutList}
                        setContactDatas={setContactDatas}
                        contactDatas={contactDatas}
                        handleContactDatas={handleContactDatas} />
                </Section>

                }

                {activeSection == 2 && displayVideoIntro.includes(juryEvent.id_event) && <Section key={2}>
                    <h2 className="my-5">L'expert de l’entrepôt du futur vous décrypte les tendances</h2>
                    <iframe width="100%" height="315" src="https://www.youtube.com/embed/eVEEd11arG8" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                </Section>

                }


                {juryEvent && ['16188'].includes(juryEvent.id_event) ? displayDemosByEventCycleLang() : displayDemos()}


                {activeSection == (demos.length + 3) && displayOutro.includes(juryEvent.id_event) && <Section key={(demos.length + 3)}>
                    <iframe width="100%" height="315" src="https://www.youtube.com/embed/MpzRYdUEV-c" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                </Section>

                }

                {/*activeSection == (demos.length + 4) && !displayOutro.includes(juryEvent.id_event) && <Section key={(demos.length + 4)}>
                {!voteIsValid ? <SendVote handleValidVote={handleValidVote} /> : <Thanks />}
            </Section>
            */}


                {activeSection == (demos.length + 3) && <Section key={(demos.length + 3)}>
                    {!voteIsValid ? <SendVote
                        translationsForLanguage={translationsForLanguage}
                        handleValidVote={handleValidVote}
                        juryEvent={juryEvent} /> : <Thanks />}
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