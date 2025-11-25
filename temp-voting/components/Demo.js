/*
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
    },*/

const Demo = ({ translationsForLanguage, demo, handleNote, notes, handleContactMe, numDemo, juryEvent, notDisplayRating, notDisplayMeetingButton,
    displayDemoDescriptif, props }) => {

    const toggleColorContactMe = () => {

        const currentNote = notes.find(item => item.id_presta == demo.id_presta);

        if (currentNote && currentNote.hasOwnProperty('contactMe')) {

            if (currentNote.id_presta === demo.id_presta && currentNote.contactMe == true) {

                return { color: 'bg-red-400', text: 'Cancel the connection' };

            } else {

                return { color: 'bg-blue-500', text: translationsForLanguage.connectMe };
            }
        } else {

            return { color: 'bg-blue-500', text: translationsForLanguage.connectMe };

        }
    }

    return (
        <div className="pb-24 ">

            <div className="rounded-lg border-0  overflow-hidden bg-white ">
                <div className=" flex   p-6 items-center justify-between space-x-3  ">
                    <div> {
                        // si demo.logo  ne contient pas no_picture

                        !demo.logo.includes('no_picture')

                            ? <div className="  w-20 h-20 flex items-center bg-white p-1"><img src={demo.logo} /></div>

                            : <div className="text-left text-white">
                                <b>{demo.societe} </b>
                            </div>}


                    </div>


                    {/* <div className="flex space-x-3 items-center text-xs px-2"> <span className="hidden">{demo.pays} </span><img src={demo.flag} className="w-6 h-6" /></div> */}
                    <span>  {demo.numero_stand != "" && ['63', '66'].includes(juryEvent.id_conf_event_type) ? ` Stand ${demo.numero_stand}` : ''}   </span>
                    <span className="px-4  rounded-full p-2"><b>{/*Candidat / Candidate*/} {numDemo}</b></span>
                </div>
                <div
                    className="hidden"
                    style_={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>

                    <div className="border  " style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "80px" }}>
                        <div className="demo_visuel" style={{ maxHeight: "80px", background: `url('${demo.logo}')` }}></div>
                        <div className="demo_visuel" style={{ maxHeight: "80px", background: `url('${demo.presta_visuel_thumbs.small}')` }}></div>
                    </div>

                    <div className="items-center hidden" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                        <div className="  w-20 h-20"><img src={demo.logo} class /></div>
                        <div className=" w-20 h-20"><img src={demo.presta_visuel_thumbs.small} /></div>
                    </div>

                </div>



                {

                    //displayDemoDescriptif.includes(juryEvent.id_event) || ['63', '66', '67'].includes(juryEvent.id_conf_event_type) && 


                    <div className=" px-4  pb-4 mb-2   text-left text-sm leading-relaxed "  >
                        <div className="text-lg font-bold"> {demo.presta_nom}</div>
                        <div className="flex text-left text-gray-500 py-3 italic">
                            Par {demo.societe} -
                            <div className="flex items-center space-x-2 ml-2">
                                <img src={demo.flag} className="w-6 h-6 " />
                                <span className="capitalize">{demo.pays.toLowerCase()}</span>
                            </div>
                        </div>
                        {demo.presta_texte != '' && <div className="" dangerouslySetInnerHTML={{ __html: demo.presta_texte.substr(0, 600) }}></div>}
                        {demo.presta_texte3 != '' && <div className="" dangerouslySetInnerHTML={{ __html: demo.presta_texte3.substr(0, 600) }}></div>}
                        {demo.presta_accroche != '' && <div className="" dangerouslySetInnerHTML={{ __html: demo.presta_accroche.substr(0, 600) }}></div>}

                    </div>}

            </div>

            {juryEvent.id_jury.close_registration != 'y'
                && ['67', '74', '', '88', '66', '63', '96', '97', '116'].includes(juryEvent.id_conf_event_type)
                && !notDisplayRating.includes(juryEvent.id_event) &&
                props.match.params.voteType != "matchmaking" &&
                <div className="p-6 bg-white rounded-lg   mt-6  ">

                    <div className="mb-2 py-3 text-lg font-semibold text-gray-900 ">
                        {translationsForLanguage.rankUpSolution}
                    </div>

                    <Note critere="presentation" title={translationsForLanguage.rankPresentation} handleNote={handleNote} id_presta={demo.id_presta} notes={notes} />

                    <Note critere="comprehension" title={translationsForLanguage.rankImpact} handleNote={handleNote} id_presta={demo.id_presta} notes={notes} />
                    <Note critere="timing" title={translationsForLanguage.rankInnovation} handleNote={handleNote} id_presta={demo.id_presta} notes={notes} />
                    <Note critere="support" title={translationsForLanguage.rankInterest} handleNote={handleNote} id_presta={demo.id_presta} notes={notes} />


                </div>
            }

            {juryEvent.id_jury.close_registration == 'y' && <div className="alert alert-info mt-5"> The voting is now closed; however, we offer you the opportunity to get in touch with this candidate by clicking the button below.</div>}

            {!notDisplayMeetingButton.includes(juryEvent.id_event) &&
                <div className="flex   items-center justify-center">
                    <button className={`w-full text-xl text-white px-4 py-2 rounded-lg mt-4 ${toggleColorContactMe().color}`} onClick={handleContactMe} id_presta={demo.id_presta} >{toggleColorContactMe().text}</button>
                </div>}
        </div>
    )
}
