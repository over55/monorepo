import React from "react";
import { Link } from "react-router-dom";
import PhoneTextFormatter from "./EveryPage/PhoneTextFormatter";
import DateTextFormatter from "./EveryPage/DateTextFormatter";
import DateTimeTextFormatter from "./EveryPage/DateTimeTextFormatter";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle } from '@fortawesome/free-solid-svg-icons';


function DataDisplayRowText(props) {
    const { label, value, helpText, type="text"} = props;
    return (
        <div className="field pb-4">
            <label className="label">{label}</label>
            <div className="control">
                <p>
                    {value
                        ?
                        <>
                        {type === "text" &&
                            value
                        }
                        {type === "email" &&
                            <Link to={`mailto:${value}`}>{value}</Link>
                        }
                        {type === "phone" &&
                            <PhoneTextFormatter value={value} />
                        }
                        {type === "datetime" &&
                            <DateTimeTextFormatter value={value} />
                        }
                        {type === "date" &&
                            <DateTextFormatter value={value} />
                        }
                        {type === "currency" &&
                            <>${value}</>
                        }
                        {type === "textlist" &&
                            <>
                            {value && value.map(function(datum, i){
                                return <div className="pb-3" key={i}><FontAwesomeIcon className="fas" icon={faCircle} />&nbsp;{datum}</div>
                            })}
                            </>
                        }
                        </>
                        :
                        "-"
                    }
                </p>
                {helpText !== undefined && helpText !== null && helpText !== "" && <p className="help">{helpText}</p>}
            </div>
        </div>
    );
}

export default DataDisplayRowText;
