import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeadSideCough, faUserShield, faUniversity, faUmbrellaBeach, faInfo, faBuilding, faHome, faQuestion } from '@fortawesome/free-solid-svg-icons'


function AssociateAwayLogReasonIconFormatter({ reason }) {
    switch(reason) {
        case 5: // 5: "Policy check expired",
            return <FontAwesomeIcon className="mdi" icon={faUserShield} />;
            break;
        case 4: // 4: "Commercial insurance expired",
            return <FontAwesomeIcon className="mdi" icon={faUniversity} />;
            break;
        case 3: // 3: "Personal reasons",
            return <FontAwesomeIcon className="mdi" icon={faHeadSideCough} />;
            break;
        case 2: // 2: "Going on vacation",
            return <FontAwesomeIcon className="mdi" icon={faUmbrellaBeach} />;
            break;
        case 1: // 1: "Other",
            return <FontAwesomeIcon className="mdi" icon={faInfo} />;
            break;
        default:
            return <FontAwesomeIcon className="mdi" icon={faQuestion} />;
            break;
    }
}

export default AssociateAwayLogReasonIconFormatter;
