const Note = ({ title, handleNote, critere, id_presta, notes }) => {

    const toggleColor = (note, notes_) => {

        const currentNote = notes_.find(item => item.id_presta == id_presta);

        if (currentNote && currentNote.hasOwnProperty(critere)) {

            if (currentNote.id_presta === id_presta && parseInt(currentNote[critere]) >= parseInt(note)) {

                return "orange";

            } else if (currentNote.id_presta === id_presta && parseInt(currentNote[critere]) < parseInt(note)) {

                return "#bdbdbd"
            }
        } else {
            return "#bdbdbd"

        }
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
                        return (noteValue >= 1 && noteValue <= 5)
                            ? <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Note: {noteValue}/5</span>
                            : <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Non évalué</span>;
                    })()
                }
            </div>
        </div>

        <div className="flex space-x-3 py-4">
            <i className="far fa-star fa-2x data_note" style={{ color: toggleColor(1, notes) }} critere={critere} note="1" id_presta={id_presta} onClick={() => handleNote({ note: 1, critere: critere, id_presta: id_presta })}></i>
            <i className="far fa-star fa-2x data_note" style={{ color: toggleColor(2, notes) }} critere={critere} note="2" id_presta={id_presta} onClick={() => handleNote({ note: 2, critere: critere, id_presta: id_presta })}></i>
            <i className="far fa-star fa-2x data_note" style={{ color: toggleColor(3, notes) }} critere={critere} note="3" id_presta={id_presta} onClick={() => handleNote({ note: 3, critere: critere, id_presta: id_presta })}></i>
            <i className="far fa-star fa-2x data_note" style={{ color: toggleColor(4, notes) }} critere={critere} note="4" id_presta={id_presta} onClick={() => handleNote({ note: 4, critere: critere, id_presta: id_presta })}></i>
            <i className="far fa-star fa-2x data_note" style={{ color: toggleColor(5, notes) }} critere={critere} note="5" id_presta={id_presta} onClick={() => handleNote({ note: 5, critere: critere, id_presta: id_presta })}></i>
        </div>

    </div>
}