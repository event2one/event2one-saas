import React from 'react';
import { JuryEvent } from '../types';
import { FaThumbsUp } from 'react-icons/fa';

interface SendVoteProps {
    handleValidVote: (e: React.MouseEvent) => void;
    juryEvent: JuryEvent;
    translationsForLanguage: any;
}

const SendVote: React.FC<SendVoteProps> = ({ handleValidVote, juryEvent, translationsForLanguage }) => {

    let message: React.ReactNode = "";

    if (['63', '66', '', ''].includes(juryEvent.id_conf_event_type)) {

        message = <div>
            <h4 className="text-center"> <span className="text-muted"> Thank you for your participation in the tour </span></h4>
            <p className="text-center" ><img src="//www.mlg-consulting.com/manager_cc/docs/archives/201005191634_like.png" style={{ width: '200px' }} alt="Like" /></p>
            <button className="bg-green-500 text-white w-full py-3 mt-5 rounded text-lg" onClick={handleValidVote}>Send my matchmaking requests</button>
        </div>

    } else if (['67', '74', '88', '97', '116'].includes(juryEvent.id_conf_event_type)) {

        message = <div className=" text-emerald-800 bg-white p-4 rounded-lg  max-w-2xl mx-auto mt-10">


            <div className="bg-emerald-100 p-4 w-full text-muted text-xl flex justify-center">{translationsForLanguage.voteEndTitle}</div>


            <div className=" flex justify-center mx-auto max-w-2xl py-5 ">
                <FaThumbsUp size={48} color="green" />
            </div>

            <h6 className="text-center hidden"> Vous pouvez si vous le souhaitez revoir certaines de vos notes en appuyant sur "précédent" ou  "Finaliser mon vote" </h6>
            <h6 className="text-center text-muted"> {translationsForLanguage.voteEndMessage}</h6>

            <div className=" flex items-center justify-center">
                <button className="bg-emerald-500 text-white w-full py-2  px-4   mt-5 rounded-lg text-xl " onClick={handleValidVote}>
                    {translationsForLanguage.finaliserVote}    </button>
            </div>
        </div>

    }

    return <>{message}</>;
}

export default SendVote;
