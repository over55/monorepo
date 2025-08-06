import React from "react";

function SkillSetsTextFormatter(props) {
  ////
  //// Props.
  ////

  const {
    skillSets = [],
    showMatchingsSkillSets = [],
    highlightMatchingsSkillSetIDs = [],
  } = props;

  // console.log("skillSets:", skillSets); // For debugging purposes only.
  // console.log("showMatchingsSkillSets:", showMatchingsSkillSets); // For debugging purposes only.
  let matchingSkillSets =
    showMatchingsSkillSets.length > 0
      ? skillSets.filter((skillSet) =>
          showMatchingsSkillSets.some(
            (matchingSet) => matchingSet.id === skillSet.id,
          ),
        )
      : skillSets;
  // console.log("matchingSkillSets:", matchingSkillSets); // For debugging purposes only.

  ////
  //// Component rendering.
  ////

  // CASE 1 of 2: Enabled highlighting.
  //----------------------------------

  if (highlightMatchingsSkillSetIDs.length > 0) {
    return (
      <>
        {matchingSkillSets &&
          matchingSkillSets.map(function (datum, i) {
            // Check if highlightMatchingsSkillSetIDs contains the current datum.id
            const isHighlighted = highlightMatchingsSkillSetIDs.includes(
              datum.id,
            );

            // Determine the CSS class based on the condition
            const cssClass = isHighlighted
              ? "tag is-success"
              : "tag is-success is-light";

            return (
              <span className={cssClass + " mr-2 mb-2 is-medium"}>
                {datum.subCategory}
              </span>
            );
          })}
      </>
    );
  }

  // CASE 2 of 2: Disabled highlighting.

  return (
    <>
      {matchingSkillSets &&
        matchingSkillSets.map(function (datum, i) {
          const cssClass = "tag is-success";

          return (
            <span className={cssClass + " mr-2 mb-2 is-medium"}>
              {datum.subCategory}
            </span>
          );
        })}
    </>
  );
}

export default SkillSetsTextFormatter;
