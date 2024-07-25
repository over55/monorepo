import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBuilding, faHome, faQuestion } from '@fortawesome/free-solid-svg-icons'


function TaskItemTypeOfIconFormatter({ type }) {
    switch(type) {
        case 7: // Deprecated - old database.
            return <FontAwesomeIcon className="mdi" icon={faHome} />;
            break;
        case 4:  // Deprecated - old database.
            return <FontAwesomeIcon className="mdi" icon={faHome} />;
            break;
        case 6: // Order completion.
            return <FontAwesomeIcon className="mdi" icon={faHome} />;
            break;
        case 2:
            return <FontAwesomeIcon className="mdi" icon={faBuilding} />;
            break;
        case 1:
            return <FontAwesomeIcon className="mdi" icon={faHome} />;
            break;
        default:
            return <FontAwesomeIcon className="mdi" icon={faQuestion} />;
            break;
    }
}

export default TaskItemTypeOfIconFormatter;
