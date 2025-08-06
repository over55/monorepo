import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBuilding, faHome, faQuestion } from '@fortawesome/free-solid-svg-icons'

const selectOptions = {
    0: 'Archived',
    1: 'New',
    2: 'Declined',
    3: 'Pending',
    4: 'Cancelled',
    5: 'Ongoing',
    6: 'In-progress',
    7: 'Completed and Unpaid',
    8: 'Completed and Paid',
};

function AssociateOrderStatusFormatter({ value }) {
    try {
        return selectOptions[value];        
    } catch(e) {
        return (
            <>-</>
        )
    }
}


export default AssociateOrderStatusFormatter;
