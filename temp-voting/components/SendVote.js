const SendVote = ({ handleValidVote, juryEvent, translationsForLanguage }) => {

    let message = "";

    if (['63', '66', '', ''].includes(juryEvent.id_conf_event_type)) {

        message = <div>
            <h4 className="text-center"> <span className="text-muted"> Thank you for your participation in the tour </span></h4>
            <p className="text-center" ><img src="//www.mlg-consulting.com/manager_cc/docs/archives/201005191634_like.png" style={{ width: '200px' }} /></p>
            <button className="btn btn-success btn-block btn-lg mt-5" onClick={handleValidVote}>Send my matchmaking requests</button>
        </div>

    } else if (['67', '74', '88', '97', '116'].includes(juryEvent.id_conf_event_type)) {

        //        "voteEndTitle": "Le vote est maintenant terminé",
        //        "voteEndMessage": "Si vous le souhaitez, vous pouvez revoir certaines de vos notes en appuyant sur 'précédent' ou 'finaliser mon vote'",


        message = <div className=" text-emerald-800 bg-white p-4 rounded-lg  max-w-2xl mx-auto mt-10">


            <div className="bg-emerald-100 p-4 w-full text-muted text-xl flex justify-center">{translationsForLanguage.voteEndTitle}</div>


            <div className=" flex justify-center mx-auto max-w-2xl py-5 ">
                <svg xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24" fill="none" stroke="green" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-thumbs-up-icon lucide-thumbs-up"><path d="M7 10v12" /><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" /></svg>

            </div>

            <h6 className="text-center hidden"> Vous pouvez si vous le souhaitez revoir certaines de vos notes en appuyant sur "précédent" ou  "Finaliser mon vote" </h6>
            <h6 className="text-center text-muted"> {translationsForLanguage.voteEndMessage}</h6>

            <div className=" flex items-center justify-center">
                <button className="bg-emerald-500 text-white w-full py-2  px-4   mt-5 rounded-lg text-xl " onClick={handleValidVote}>

                    {/* Finaliser mon vote  / */}
                    {translationsForLanguage.finaliserVote}    </button>
            </div>
        </div>

    }

    return message
}