import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import {
    TASK_ITEM_TYPE_ASSIGN_ASSOCIATE,
    TASK_ITEM_TYPE_FOLLOW_UP_DID_ASSOCIATE_AND_CUSTOMER_AGREED_TO_MEET,
    TASK_ITEM_TYPE_FOLLOW_UP_CUSTOMER_SURVEY,
    TASK_ITEM_TYPE_FOLLOW_UP_DID_ASSOCIATE_ACCEPT_JOB,
    TASK_ITEM_TYPE_UPDATE_ONGOING_JOB,
    TASK_ITEM_TYPE_FOLLOW_UP_DID_ASSOCIATE_COMPLETE_JOB,
    TASK_ITEM_TYPE_FOLLOW_UP_DID_CUSTOMER_REVIEW_ASSOCIATE_AFTER_JOB,
} from "../../../../Constants/App";


function TaskItemUpdateURLPathFormatter(id, type) {
    console.log("TaskItemUpdateURLPathFormatter: type:", type);
    switch (type) {
        case TASK_ITEM_TYPE_ASSIGN_ASSOCIATE:
            return "/admin/task/" + id + "/assign-associate/step-1";
        case TASK_ITEM_TYPE_FOLLOW_UP_DID_ASSOCIATE_COMPLETE_JOB:
        case TASK_ITEM_TYPE_FOLLOW_UP_DID_ASSOCIATE_AND_CUSTOMER_AGREED_TO_MEET:
        case TASK_ITEM_TYPE_FOLLOW_UP_DID_ASSOCIATE_ACCEPT_JOB:
        case TASK_ITEM_TYPE_UPDATE_ONGOING_JOB:
            return "/admin/task/" + id + "/order-completion/step-1";
        case TASK_ITEM_TYPE_FOLLOW_UP_DID_CUSTOMER_REVIEW_ASSOCIATE_AFTER_JOB:
        case TASK_ITEM_TYPE_FOLLOW_UP_CUSTOMER_SURVEY:
            return "/admin/task/" + id + "/survey/step-1";
        default:
            return "/404"
    }
}

export default TaskItemUpdateURLPathFormatter;
