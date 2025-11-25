function Nav({ handleNextButton, handlePreviousButton, activeSection, nbDemos, buttonIsDisabled = false }) {

    // Si prev est masqué, on aligne next à droite, sinon on espace entre les deux
    const containerClass = activeSection > 0
        ? "flex items-center justify-between"
        : "flex items-center justify-end";

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4" >
            <div className={containerClass}>
                {activeSection > 0 && (
                    <button
                        disabled={buttonIsDisabled}
                        className="rounded border flex items-center gap-2 py-2 px-6"
                        id="prev"
                        onClick={handlePreviousButton}
                    >
                        &#12296; &nbsp; Prev
                    </button>
                )}
                {/* Masquer uniquement le bouton Next dans la dernière section */}
                {(activeSection < (nbDemos + 3)) && (
                    <button
                        disabled={buttonIsDisabled}
                        className="rounded bg-blue-500 text-white border flex items-center gap-2 py-2 px-6"
                        id="next"
                        onClick={handleNextButton}
                    >
                        Next &#x3009; &nbsp;
                    </button>
                )}
            </div>
            <button id="valid" type="button" className="btn btn-success btn-lg btn-block mt-3 p-5" style={{ display: 'none' }}>Submit my vote</button>
        </div>
    )
}