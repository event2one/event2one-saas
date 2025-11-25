import React, { useState, useEffect } from 'react';
import { JuryEvent } from '../types';

interface VisuelSectionProps {
    juryEvent: JuryEvent;
}

const VisuelSection: React.FC<VisuelSectionProps> = ({ juryEvent }) => {

    const [confEventCycleLangList, setConfEventCycleLangList] = useState<any[] | null>(null);

    const getConfEventCycleLang = async ({ id_conf_event }: { id_conf_event: any }) => {
        const params = ` WHERE id_conf_event =${id_conf_event} `
        await fetch(`//www.mlg-consulting.com/smart_territory/form/api.php?action=getConfEventCycleLang&params=${params}`)
            .then(res => res.json())
            .then(res => setConfEventCycleLangList(res))
    }

    useEffect(() => {
        if (juryEvent && (juryEvent as any).id_conf_event?.id_conf_event) {
            getConfEventCycleLang({ id_conf_event: (juryEvent as any).id_conf_event.id_conf_event });
        }
    }, [juryEvent]);


    return (<div>
        <div className=" ">
            {
                confEventCycleLangList && confEventCycleLangList.some(item =>
                    item.id_cycle_lang.attachedFilesCollection.find((attachedFile: any) => attachedFile.id_attached_file_type == 113)
                )
                    ? confEventCycleLangList.map(item => {
                        const attachedFilesCollection = item.id_cycle_lang.attachedFilesCollection;
                        const globalshowVisuel = attachedFilesCollection.find((attachedFile: any) => attachedFile.id_attached_file_type == 113);
                        return globalshowVisuel
                            ? <img key={item.id_cycle_lang.id_cycle_lang} className="mx-auto  mb-5" src={globalshowVisuel.medium} alt="" style={{ maxWidth: '90%' }} />
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

export default VisuelSection;
