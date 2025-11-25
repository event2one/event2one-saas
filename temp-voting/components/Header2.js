const Header2 = ({ juryEvent, langId, contactDatas }) => {


    // const nom = juryEvent.nom;
    const nom = juryEvent.id_conf_event.conf_event_lang.cel_titre;

    let logo;

    //const logo = juryEvent.id_event == 1618 ? 'https://www.sitl.eu/content/dam/sitebuilder/ref/sitl/images/LogoSiTL-couleurs_v2.png/_jcr_content/renditions/original.image_file.270.167.file/826330722/LogoSiTL-couleurs_v2.png' : 'https://www.mlg-consulting.com/manager_cc/docs/archives//thumbs/210107114747_logo-village-francophon-violete-02_300x0.png';


    switch (juryEvent.id_event) {

        case 1618: logo = 'https://www.sitl.eu/content/dam/sitebuilder/ref/sitl/images/LogoSiTL-couleurs_v2.png/_jcr_content/renditions/original.image_file.270.167.file/826330722/LogoSiTL-couleurs_v2.png';
            break;

        case '1731': logo = 'https://www.equipmag.com/theme/equipmag_git_desktop/images/logo.svg';
            break;

        default: logo = 'https://www.mlg-consulting.com/manager_cc/docs/archives/250520145022_logo-vecto-black-white-2023-01.png';
            break;

    }

    //const  name_s = nom.replace(/<\/?[^>]+(>|$)/g, "");

    return (
        <div>


            <div className="bg-white w-full flex justify-between p-4 shadow-sm   mb-2 space-x-3 items-center"
            >
                <div><img style={{ height: "30px" }} src={`${logo}`} /></div>
                <div style={{ display: "none" }} className="flags">
                    <a href={`https://www.event2one.com/parcours/vote/demos.php?ije=${juryEvent.id_jury_event}&order=asc&lang_id=fr`}>
                        <img src="https://www.iplocate.com/assets/img/flag/128/fr.png" className="rounded rounded-circle" />
                    </a>
                    <a href={`https://www.event2one.com/parcours/vote/demos.php?ije=${juryEvent.id_jury_event}&order=asc&lang_id=uk`}>
                        <img src="https://www.iplocate.com/assets/img/flag/128/us.png" className="rounded rounded-circle" />
                    </a>
                </div>
                <div><div className="p-1 text-right text-xs" style={{ display: "block", textTransform: 'uppercase' }}>{nom}

                    <br /> <span className="text-muted">{juryEvent.nom_us}</span></div>
                </div>

                {/* <img src={contactDatas.photos.tiny} alt="" className="rounded-full w-10 h-10" /> */}

            </div>




        </div>
    )
}
