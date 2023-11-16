const moment = require("moment");

function convertCsvStringToJson(csvString) {
    return new Promise((resolve, reject) => {
        try {
            console.log(new Date().toUTCString(), " | Entry [validateSubmission]");
            const lines = csvString
                .trim()
                .replace(/\n/gm, "")
                .split(/\r/gm);

            const segmentHeaders = lines
                .filter((line) => line.match(/.*:/g));

            const dataJson = segmentHeaders.reduce((accJson, segmentHeader, i) => {

                accJson[segmentHeader] = lines.
                    slice(lines.indexOf(segmentHeader) + 1, lines.indexOf(segmentHeaders[i + 1]));

                return accJson;
            }, {});

            resolve(dataJson);

        } catch (e) {
            reject(e);
        }
    });
}

function createWebViewFromCsvFile(fileContents) {

    const {
        "ELD File Header Segment:": EldFileHeaderSegment,
        "User List:": UserList,
        "CMV List:": CMVList,
        "ELD Event List:": ELDEventList,
        "ELD Event Annotations or Comments:": ELDEventAnnotationsOrComments,
        "Driver's Certification/Recertification Actions:": DriversCertificationReCertificationActions,
        "Malfunctions and Data Diagnostic Events:": MalfunctionsAndDataDiagnosticEvents,
        "ELD Login/Logout Report:": ELDLoginLogoutReport,
        "CMV Engine Power-Up and Shut Down Activity:": CMVEnginePowerupAndShutdownActivity,
        "Unidentified Driver Profile Records:": UnidentifiedDriverProfileRecords,
        "End of File:": EndOfFile
    } = fileContents;

    function sortBasedOnDates(eventA, eventB){
        const elementsEventA = eventA.split(" | ");
        const elementsEventB = eventB.split(" | ");
        const leftDate = moment.utc(elementsEventA[1] + " " + elementsEventA[2], "MMDDYY HHmmss");
        const rightDate = moment.utc(elementsEventB[1] + " " + elementsEventB[2], "MMDDYY HHmmss");
        return leftDate.diff(rightDate);
    }

    const driverStatusEvents = ELDEventList.reduce((acc,  currentLine, i) => {

        const currentLineAnnotationsSegmentElements = ELDEventAnnotationsOrComments[i].split(",");
        const currentLineElements = currentLine.split(",");

        const seqId = currentLineElements[0];
        const date = currentLineElements[5];
        const time = currentLineElements[6];
        const location = currentLineAnnotationsSegmentElements[5];
        const odoDiff = Number(currentLineElements[7]); // .toFixed(2);
        const engHoursDiff = Number(currentLineElements[8]); // .toFixed(2);
        const eType = Number(currentLineElements[3]);
        const eCode = Number(currentLineElements[4]);
        const eventType = getEventType(eType, eCode);
        const eventStatus = Number(currentLineElements[1]) === 1 ? "" : " (Inactive-Changed)";
        const eventTypeAndStatus = eventType + eventStatus;
        const eventRecordOriginMap = {
            1: "ELD",
            2: "Driver",
        };
        const origin = eventRecordOriginMap[currentLineElements[2]];

        const oneEvent = [ seqId, date, time, location, odoDiff, engHoursDiff, eventTypeAndStatus, origin ].join(" | ");

        acc = [...acc, oneEvent];

        return acc;

    }, []);

    const certificationEvents = DriversCertificationReCertificationActions.reduce((acc, currentLine) => {

        const currentLineElements = currentLine.split(",");
        const seqId = currentLineElements[0];
        const date = currentLineElements[2];
        const time = currentLineElements[3];
        const location = "          ";
        const odometer = "          "; // .toFixed(2);
        const engHours = "          "; // .toFixed(2);
        const eType = 4;
        const eCode = Number(currentLineElements[1]);
        const eventType = getEventType(eType, eCode);
        const eventStatus = "";
        const eventTypeAndStatus = eventType + eventStatus;
        const eventRecordOriginMap = {
            1: "ELD",
            2: "Driver",
        };
        const origin = "ELD";

        const oneEvent = [seqId, date, time, location, odometer, engHours, eventTypeAndStatus, origin].join(" | ");

        return [...acc, oneEvent];
    }, []);

    const malfunctionAndDDEvents = MalfunctionsAndDataDiagnosticEvents.reduce((acc, currentLine) => {

        const currentLineElements = currentLine.split(",");
        const seqId = currentLineElements[0];
        const date = currentLineElements[3];
        const time = currentLineElements[4];
        const location = "          ";
        const odometer = currentLineElements[5]; // .toFixed(2);
        const engHours = currentLineElements[6]; // .toFixed(2);
        const eType = 7;
        const eCode = Number(currentLineElements[1]);
        const eventType = getEventType(eType, eCode);
        const eventStatus = "";
        const eventTypeAndStatus = eventType + eventStatus;
        const eventRecordOriginMap = {
            1: "ELD",
            2: "Driver",
        };
        const origin = "ELD";

        const oneEvent = [seqId, date, time, location, odometer, engHours, eventTypeAndStatus, origin].join(" | ");

        return [...acc, oneEvent];
    }, []);

    const powerupEvents = CMVEnginePowerupAndShutdownActivity.reduce((acc, currentLine) => {

        const currentLineElements = currentLine.split(",");
        const seqId = currentLineElements[0];
        const date = currentLineElements[2];
        const time = currentLineElements[3];
        const location = currentLineElements[6] + "," + currentLineElements[7];
        const odometer = currentLineElements[4]; // .toFixed(2);
        const engHours = currentLineElements[5]; // .toFixed(2);
        const eType = 6;
        const eCode = Number(currentLineElements[1]);
        const eventType = getEventType(eType, eCode);
        const eventStatus = "";
        const eventTypeAndStatus = eventType + eventStatus;
        const eventRecordOriginMap = {
            1: "ELD",
            2: "Driver",
        };
        const origin = "ELD";

        const oneEvent = [seqId, date, time, location, odometer, engHours, eventTypeAndStatus, origin].join(" | ");
        // console.log(currentLine);
        // console.log(oneEvent);

        return [...acc, oneEvent];
    }, []);

    const loginLogoutEvents = ELDLoginLogoutReport.reduce((acc, currentLine) => {

        const currentLineElements = currentLine.split(",");
        const seqId = currentLineElements[0];
        const date = currentLineElements[3];
        const time = currentLineElements[4];
        const location = "          ";
        const odometer = currentLineElements[5]; // .toFixed(2);
        const engHours = currentLineElements[6]; // .toFixed(2);
        const eType = 5;
        const eCode = Number(currentLineElements[1]);
        const eventType = getEventType(eType, eCode);
        const eventStatus = "";
        const eventTypeAndStatus = eventType + eventStatus;
        const eventRecordOriginMap = {
            1: "ELD",
            2: "Driver",
        };
        const origin = "ELD";

        const oneEvent = [seqId, date, time, location, odometer, engHours, eventTypeAndStatus, origin].join(" | ");

        return [...acc, oneEvent];
    }, []);


    const allEvents = [...driverStatusEvents, ...certificationEvents, ...powerupEvents, ...loginLogoutEvents, ...malfunctionAndDDEvents];

    const sortedAllEvents = allEvents.sort(sortBasedOnDates);

    let isPUEventActive = false;
    let absOdometer = 0;
    let absEngHours = 0;
    let latestHosStatus;
    let latestDrivingStatus;
    const resultStatements = [];
    const results = sortedAllEvents.map((event, i) => {

        const eventElements = event.split(" | ");

        if (eventElements[6] === "Power-up") {
            isPUEventActive = true;
            absOdometer = eventElements[4];
            absEngHours = eventElements[5];
        }
        if (eventElements[6] === "Shut-down") {
            isPUEventActive = false;
        }

        const hosStatuses = [
            "Off-duty", "On-duty, not driving", "Driving", "Sleeper Berth",
            "Off-duty (Inactive-Changed)", "On-duty, not driving (Inactive-Changed)", "Driving (Inactive-Changed)", "Sleeper Berth (Inactive-Changed)",
        ];

        const nonDrivingHosStatuses = [
            "Off-duty", "On-duty, not driving", "Sleeper Berth",
            "Off-duty (Inactive-Changed)", "On-duty, not driving (Inactive-Changed)", "Sleeper Berth (Inactive-Changed)",
        ];

        if (!isPUEventActive && eventElements[6] !== "Shut-down") {
            eventElements[4] = "Missing power-up event";
            eventElements[5] = "Missing power-up event";
        } else if (isPUEventActive && eventElements[6] !== "Power-up" && eventElements[6] !== "Shut-down" &&
            eventElements[6] !== "Login" && eventElements[6] !== "Logout" && !eventElements[6].includes("diagnostic") &&
            !eventElements[6].includes("Malfunction")) {
            eventElements[4] = Number(absOdometer) + Number(eventElements[4]);
            eventElements[5] = Number(absEngHours) + Number(eventElements[5]);
        } else {
            eventElements[4] = Number(eventElements[4]);
            eventElements[5] = Number(eventElements[5]);
        }

        // console.log(eventElements);

        if (eventElements[6] === "Intermediate log") {
            if ((latestHosStatus === "Driving" || latestHosStatus === "Driving (Inactive-Changed)")) {
                // console.log("condition", eventElements[5], latestHosStatus, (eventElements[5] === "Intermediate log") && (latestHosStatus !== "Driving" || latestHosStatus !== "Driving (Inactive-Changed)"));
                resultStatements.push(`Unwanted Intermediate log, ${latestHosStatus}, ${eventElements[1]}, ${eventElements[2]} ${eventElements[6]}`);

                eventElements.push("OK");
                // latestDrivingStatus = true;

            } else {
                eventElements.push("NOT OK");
            }
        }

        if (eventElements[6] === "Driving (Inactive-Changed)") {
            eventElements[8] = eventElements[8] ? eventElements[8] + ". edited drive" : "edited drive";
        }

        // if (hosStatuses.indexOf(eventElements[5]) !== -1) {
        if (hosStatuses.indexOf(eventElements[6]) >= 0) {
            latestHosStatus = hosStatuses[Number(hosStatuses.indexOf(eventElements[6]))];
        }

        // if (eventElements[5] === "Driving" || eventElements[5] === "Driving (Inactive-Changed)") {
        //     latestDrivingStatus = true;
        // } else if (latestDrivingStatus && (eventElements[5] in nonDrivingHosStatuses)) {
        //     latestDrivingStatus = true;
        // } else {
        //     latestDrivingStatus = false;
        // }

        const keys = ["seqId", "date", "time", "location", "odometer",
            "engineHours", "status", "origin", "gpsPositionFromDevice", "remarks"];

        const eventElementsAsObject = {
            seqId: parseInt(eventElements[0], 16),
            date: moment(eventElements[1], "MMDDYYYY").format("MM/DD/YYYY"),
            time: moment(eventElements[2], "hhmmss").format("hh:mm:ss"),
            location: eventElements[3],
            odometer: eventElements[4],
            engineHours: eventElements[5],
            status: eventElements[6],
            origin: eventElements[7],
            gpsPositionFromDevice: eventElements[8] || "",
            remarks: eventElements[9] || "",
        };

        return eventElementsAsObject;
    });

    // const r = results.filter(a => a[7] === "NOT OK");
    console.log(new Date().toUTCString(), " | Exit [validateSubmission]");

    return { results };
}

function getEventType(eType, eCode) {

    let eventType;

    if (eType === 1 && eCode === 1) {

        eventType = "Off-duty";

    } else if (eType === 1 && eCode === 2) {

        eventType = "Sleeper Berth";

    } else if (eType === 1 && eCode === 3) {

        eventType = "Driving";

    } else if (eType === 1 && eCode === 4) {

        eventType = "On-duty, not driving";

    } else if (eType === 2 && eCode === 1) {

        eventType = "Intermediate log";

    } else if (eType === 2 && eCode === 2) {

        eventType = "Intermediate log, reduced location precision";

    } else if (eType === 3 && eCode === 1) {

        eventType = "Authorized Personal Use of CMV";

    } else if (eType === 3 && eCode === 2) {

        eventType = "Yard Move";

    } else if (eType === 3 && eCode === 0) {

        eventType = "PC, YM and WT cleared";

    } else if (eType === 4 && eCode === 1) {

        eventType = "First Certification";

    } else if (eType === 4 && eCode !== 1) {

        eventType = eCode + " th Certification";

    } else if (eType === 5 && eCode === 1) {

        eventType = "Login";

    } else if (eType === 5 && eCode === 2) {

        eventType = "Logout";

    } else if (eType === 6 && (eCode === 1 || eCode === 2)) {

        eventType = "Power-up";

    } else if (eType === 6 && (eCode === 3 || eCode === 4)) {

        eventType = "Shut-down";

    } else if (eType === 7 && eCode === 1) {

        eventType = "Malfunction Logged";

    } else if (eType === 7 && eCode === 2) {

        eventType = "Malfunction Cleared";

    } else if (eType === 7 && eCode === 3) {

        eventType = "Data-diagnostic Logged";

    } else if (eType === 7 && eCode === 4) {

        eventType = "Data-diagnostic Cleared";

    } else {

        // console.log('eType, eCode: ', eType, eCode);
        // console.log('currentLine: ', currentLine);
        throw new Error("Invalid event type");

    }

    return eventType;
}

module.exports = {
    convertCsvStringToJson,
    createWebViewFromCsvFile
};
