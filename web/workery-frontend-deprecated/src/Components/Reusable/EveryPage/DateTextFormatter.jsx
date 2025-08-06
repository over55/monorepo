function DateTextFormatter({ value }) {
    if (value === undefined || value === null || value === "" || value === "0001-01-01T00:00:00Z") {
        return "-";
    }

    try {
        // Create a JavaScript Date object from the input string
        const date = new Date(value);

        // Extract the individual date components
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // Adding 1 because getMonth() is zero-based
        const day = date.getDate();

        // Format the date as "MM/DD/YYYY"
        const formattedDate = `${month}/${day}/${year}`;

        // // For debugging purposes only.
        // console.log("DateTextFormatter | Input:value:", value);
        // console.log("DateTextFormatter | Input:year:", year);
        // console.log("DateTextFormatter | Input:month:", month);
        // console.log("DateTextFormatter | Input:day:", day);
        // console.log("DateTextFormatter | Output:date", date);
        // console.log("DateTextFormatter | Output:formattedDate:", formattedDate);

        return formattedDate;
    } catch (err) {
        return "Invalid ISO Date";
    }
}


export default DateTextFormatter;
