import React from "react";

function PageLoadingContent(props) {
    const { displayMessage } = props;
    return (
        <div className="columns is-centered" style={{paddingTop: "20px"}}>
            <div className="column has-text-centered is-1">
                <div className="loader-wrapper is-centered">
                    <br />
                    <br />
                    <div className="loader is-loading is-centered" style={{height: "80px", width: "80px"}}></div>
                </div>
                <br />
                <div className="">{displayMessage}</div>
                <br />
                <br />
            </div>
        </div>
    );
}

export default PageLoadingContent;
