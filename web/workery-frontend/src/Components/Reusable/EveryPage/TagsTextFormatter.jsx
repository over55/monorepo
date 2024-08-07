import React from "react";

function TagsTextFormatter(props) {
  ////
  //// Props.
  ////

  const { tags = [] } = props;

  ////
  //// Component rendering.
  ////

  return (
    <>
      {tags &&
        tags.map(function (datum, i) {
          return (
            <span className="tag is-medium is-success is-medium mr-2 mb-2">
              {datum.text}
            </span>
          );
        })}
    </>
  );
}

export default TagsTextFormatter;
