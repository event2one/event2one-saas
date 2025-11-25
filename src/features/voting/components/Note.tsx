import React from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa';
import { Note as NoteType } from '../types';

interface NoteProps {
    title: string;
    handleNote: (opt: { note: number; critere: string; id_presta: string | number }) => void;
    critere: string;
    id_presta: string | number;
    notes: NoteType[];
}

const Note: React.FC<NoteProps> = ({ title, handleNote, critere, id_presta, notes }) => {

    const toggleColor = (note: number, notes_: NoteType[]) => {

        const currentNote = notes_.find(item => item.id_presta == id_presta);

        if (currentNote && currentNote.hasOwnProperty(critere)) {

            if (currentNote.id_presta == id_presta && parseInt(currentNote[critere]) >= note) {
                return "orange";
            } else if (currentNote.id_presta == id_presta && parseInt(currentNote[critere]) < note) {
                return "#bdbdbd"
            }
        } else {
            return "#bdbdbd"
        }
        return "#bdbdbd";
    }

    return <div className="col-auto my-1">

        <div className="flex items-center justify-between space-x-3">
            <div className="text-sm font-medium text-gray-700 leading-tight"  >{title}</div>

            <div>
                {
                    // Affiche la note si elle existe et est comprise entre 1 et 5, sinon "Non évalué"
                    (() => {
                        const noteObj = notes.find(item => item.id_presta == id_presta);
                        const noteValue = noteObj && noteObj.hasOwnProperty(critere) ? parseInt(noteObj[critere]) : null;
                        return (noteValue && noteValue >= 1 && noteValue <= 5)
                            ? <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Note: {noteValue}/5</span>
                            : <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Non évalué</span>;
                    })()
                }
            </div>
        </div>

        <div className="flex space-x-3 py-4">
            {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                    key={star}
                    size={24}
                    style={{ color: toggleColor(star, notes), cursor: 'pointer' }}
                    onClick={() => handleNote({ note: star, critere: critere, id_presta: id_presta })}
                />
            ))}
        </div>

    </div>
}

export default Note;
