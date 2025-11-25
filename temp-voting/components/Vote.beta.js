const { useState, useEffect } = React;

const displayVideoIntro = ['1618']
const displayOutro = ['1618']
const notDisplayContactForm = ['1618']
const notDisplayRating = ['1618']
const notDisplayMeetingButton = ['1618']


const Vote = (props) => {

    const [demos, setDemos] = useState([]);

    const [juryEvent, setJuryEvent] = useState({});

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

    const [contactDatas, setContactDatas] = useLocalStorage('contactDatas', { email: '', mobile: '', prenom: '', nom: '', societe: '', code_postal: '', ville: '', pays: '' });

    const handleContactDatas = (e) => {

        e.preventDefault();

        setContactDatas({ ...contactDatas, [e.target.name]: e.target.value })
    }


    const handleValidVote = (e) => {

        e.preventDefault;

        const data = {
            notes: notes,
            contactDatas: contactDatas,
            id_jury_event: juryEvent.id_jury_event,
            id_event: juryEvent.id_event
        }

        fetch('https://www.event2one.com/parcours/vote/do.php?do=save_vote', {
            method: 'POST',
            body: JSON.stringify(data)
        })
            .then(res => res.json())
            .then((result) => {

            }
            );

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

        } else {

            setNotes([{ contactMe: true, id_presta: id_presta }])
        }

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

            setNotes(newNotes)


        } else {

            opt[opt.critere] = opt.note,

                setNotes([...notes, opt])
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

        console.log(sections, activeSection, juryEvent.id_event, displayOutro.includes(juryEvent.id_event));
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

    const fetchJuryEvent = async () => {

        await fetch(`//www.mlg-consulting.com/smart_territory/form/api.php?action=getJuryEvent&ije=${props.match.params.ije}`)
            .then(res => res.json())
            .then(res => { setJuryEvent(res); console.log(res) })
    }

    useEffect(() => {
        fetchDemos();
        fetchJuryEvent();

        console.log('notesue', notes)

        window.scrollTo(0, 0);

    }, [notes])

    return (

        <div className="container text-center" id="vote" >



            {juryEvent && <Header juryEvent={juryEvent} langId={props.match.params.langId} />}

            {0 == activeSection && !['1618'].includes(juryEvent.id_event) && <Section key={0}>
                <div className="alert alert-info">

                    <img src="//www.mlg-consulting.com/manager_cc/docs/archives/210217180444_action-formatv2-63.png" style={{ maxWidth: '390px' }} />

                </div>
            </Section>}


            {1 == activeSection && !['1618'].includes(juryEvent.id_event) && <Section key={1}>
                <div className="alert alert-info">
                    <h5>Comment ça marche ?</h5>
                    <p>Cette application mobile vous permet de voter en temps réel pour les solutions qui ont retenues votre attention mais également de recevoir par mail les coordonnées des candidats qui vous ont séduit.</p>
                    <p>C’est pourquoi nous vous   invitons à remplir le formulaire ci-après car en appuyant sur le bouton  « être mis en relation » lors de la compétition vos coordonnées seront automatiquement transmises aux candidats de votre choix et vous recevrez les siennes par mail.</p>
                    <p>Bonne session de pitch</p>

                    <hr />
                    <h5 className="text-muted">How does it works ?</h5>

                    <p className="text-muted">This mobile application allows you to vote in real time for the solutions that have caught your attention but also to receive by email the contact details of the candidates who have attracted you.</p>
                    <p className="text-muted">This is why we invite you to complete the form below because by pressing the "connect" button during the competition, your contact details will be automatically sent to the candidates of your choice and you will receive theirs by email.</p>
                    <p className="text-muted">Good pitch session</p>

                </div>
            </Section>}


            {activeSection == 2 && !notDisplayContactForm.includes(juryEvent.id_event) && <Section key={2}>
                <ContactInfos
                    contactDatas={contactDatas}
                    handleContactDatas={handleContactDatas} />
            </Section>

            }

            {activeSection == 2 && displayVideoIntro.includes(juryEvent.id_event) && <Section key={2}>
                <iframe width="100%" height="315" src="https://www.youtube.com/embed/eVEEd11arG8" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </Section>

            }



            {demos.map((demo, index) => {

                const new_index = index + 3;

                return new_index == activeSection && <Section key={new_index}>
                    <Demo
                        notDisplayRating={notDisplayRating}
                        notDisplayMeetingButton={notDisplayMeetingButton}
                        juryEvent={juryEvent}
                        handleContactMe={handleContactMe}
                        handleNote={handleNote}
                        key={demo.id_presta}
                        demo={demo}
                        numDemo={`${index + 1}/${demos.length}`}
                        notes={notes} /></Section>
            })}

            {activeSection == (demos.length + 3) && displayOutro.includes(juryEvent.id_event) && <Section key={(demos.length + 3)}>
                <iframe width="100%" height="315" src="https://www.youtube.com/embed/MpzRYdUEV-c" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </Section>

            }

            {activeSection == (demos.length + 3) && !displayOutro.includes(juryEvent.id_event) && <Section key={(demos.length + 3)}>
                {!voteIsValid ? <SendVote handleValidVote={handleValidVote} /> : <Thanks />}


            </Section>
            }



            {!voteIsValid &&
                <Nav
                    handleNextButton={handleNextButton}
                    handlePreviousButton={handlePreviousButton}
                    setActiveSection={setActiveSection}
                    activeSection={activeSection}
                    nbDemos={demos.length}
                />}

        </div>
    )
}