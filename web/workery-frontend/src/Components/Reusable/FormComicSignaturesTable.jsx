import React, { useState } from "react";
import { startCase } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';

import FormInputField from "./FormInputField";
import FormSelectField from "./FormSelectField";


export const SIGNATURE_ROLES_OPTIONS = [
    { value: "Cover Artist", label: 'Cover Artist' },
    { value: "Writer", label: 'Writer' },
    { value: "Artist", label: 'Artist' },
    { value: "Penciller", label: 'Penciller' },
    { value: "Inker", label: 'Inker' },
    { value: "Creator", label: 'Creator' },
    { value: "Model", label: 'Model' },
];

export const SIGNATURE_ROLES_WITH_EMPTY_OPTIONS = [
    { value: "", label: "Please select" }, // EMPTY OPTION
    ...SIGNATURE_ROLES_OPTIONS
];


/*
    DATA-STRUCTURE
    ---------------
    data - needs to be an array of dictionary objects. For example:
        [
            {
                "role": "Creator",
                "name": "Frank Herbert"
            }
        ].

    FUNCTIONS
    ---------------
    onDataChange - needs to look something like this in your JSX:
        onDataChange={(data)=>onDataChange(data)}

*/
function FormComicSignaturesTable({ data=[], onDataChange=null, disabled=false }) {

    ////
    //// Component states.
    ////

    const [showAddModal, setShowAddModal] = useState(false);
    const [errors, setErrors] = useState({});
    const [role, setRole] = useState("");
    const [name, setName] = useState("");

    ////
    //// Event handling.
    ////

    const onSubmitClick = () => {
        console.log("onSubmitClick...");
        let newErrors = {};
        if (name === undefined || name === null || name === "") {
            newErrors["name"] = "missing value";
        }
        if (role === undefined || role === null || role === "") {
            newErrors["role"] = "missing value";
        }
        if (Object.keys(newErrors).length === 0) {
            // Make a copy of the "array of strings" into a mutable array.
            let copyOfArr = [...data];

            // Update record.
            copyOfArr.push({"name": name, role: role});

            // Run callback.
            onDataChange(copyOfArr);

            // Reset errors.
            setErrors({});

            // Reset fields and close the modal.
            setName("");
            setRole("");
            setShowAddModal(false);
            return;
        }
        setErrors(newErrors);
    }

    const onRemoveRowClick = (i) => {
        // For debugging purposes.
        console.log(i);

        // Make a copy of the "array of strings" into a mutable array.
        const copyOfArr = [...data];

        // Delete record.
        const x = copyOfArr.splice(i, 1);

        // For debugging purposes.
        console.log(x);

        // Save
        onDataChange(copyOfArr);
    }

    ////
    //// Component rendering.
    ////

    // Render the JSX component with the data.
    return (
        <>
            <div className={`modal ${showAddModal && 'is-active'}`}>
                <div className="modal-background"></div>
                <div className="modal-card">
                    <header className="modal-card-head">
                        <p className="modal-card-title">Add Signature</p>
                        <button className="delete" aria-label="close" onClick={(e)=>setShowAddModal(!showAddModal)}></button>
                    </header>
                    <section className="modal-card-body">

                    <FormInputField
                        label="Name of Signature"
                        name="name"
                        placeholder="Text input"
                        value={name}
                        errorText={errors && errors.name}
                        helpText=""
                        onChange={(e)=>setName(e.target.value)}
                        isRequired={true}
                        maxWidth="380px"
                    />

                    <FormSelectField
                        label="Role of Signer"
                        name="role"
                        placeholder="Pick role"
                        selectedValue={role}
                        errorText={errors && errors.role}
                        helpText=""
                        onChange={(e)=>setRole(e.target.value)}
                        options={SIGNATURE_ROLES_WITH_EMPTY_OPTIONS}
                        isRequired={true}
                        maxWidth="110px"
                    />

                    </section>
                    <footer className="modal-card-foot">
                        <button className="button is-success" onClick={onSubmitClick}>Save changes</button>
                        <button className="button" onClick={(e)=>setShowAddModal(!showAddModal)}>Cancel</button>
                    </footer>
                </div>
            </div>

            <div className="pb-4">
                <label className="label">Comic Signatures (Optional)
                    {/*<button className="button is-success is-small" onClick={onAddListInputFieldClick} disabled={disabled}><FontAwesomeIcon className="fas" icon={faPlus} /></button>*/}
                </label>

                {data !== undefined && data !== null && data !== "" && data.length > 0
                    ?
                    <>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th><abbr title="Signature Role">Role</abbr></th>
                                    <th>Signed By</th>
                                    {disabled === false && <th>
                                        <button className="button is-success is-small" onClick={(m)=>setShowAddModal(!showAddModal)}><FontAwesomeIcon className="fas" icon={faPlus} />&nbsp;Add</button>
                                    </th>}
                                </tr>
                            </thead>
                            <tbody>
                            {data && data.map(function(datum, i){
                                return <tr>
                                    <th>{datum.role}</th>
                                    <td>{datum.name}</td>
                                    {disabled === false &&<td>
                                        <button className="button is-danger is-small" onClick={(n)=>onRemoveRowClick(i)}><FontAwesomeIcon className="fas" icon={faMinus} />&nbsp;Delete</button>
                                    </td>}
                                </tr>
                            })}
                         </tbody>
                      </table>
                    </>
                    :
                    <>
                        <button className="button is-primary is-small" onClick={(e)=>setShowAddModal(true)} disabled={disabled}><FontAwesomeIcon className="fas" icon={faPlus} />&nbsp;Add Signature</button>
                    </>
                }
                <p className="help">Include any signatures on the comic submission</p>
            </div>

        </>
    );
}

export default FormComicSignaturesTable;
