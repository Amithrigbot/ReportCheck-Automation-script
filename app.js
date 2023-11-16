const moment = require("moment");
const fs = require('fs').promises;
const path = require('path');

//converting CSV to JSON
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

                accJson[segmentHeader] = lines.slice(lines.indexOf(segmentHeader) + 1, lines.indexOf(segmentHeaders[i + 1]));

                return accJson;
                
            }, {});

            resolve(dataJson);

        } catch (e) {
            reject(e);
        }
    });
}



function createWebViewFromCsvFile(fileContents) {
    const acc = [];
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

    const driverStatusEvents = ELDEventList.reduce((acc, currentLine, i) => {
        const currentLineAnnotationsSegmentElements = ELDEventAnnotationsOrComments[i].split(",");
        const currentLineElements = currentLine.split(",");

        const seqId = currentLineElements[0];
        const date = currentLineElements[5];
        const time = currentLineElements[6];
        const location = currentLineAnnotationsSegmentElements[5];
        const odoDiff = Number(currentLineElements[7]);
        const engHoursDiff = Number(currentLineElements[8]);
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

        const oneEvent = [seqId, date, time, location, odoDiff, engHoursDiff, eventTypeAndStatus, origin].join(" | ");
        acc = [...acc, oneEvent];

        return acc;

    }, []);
    const certificationEvents = DriversCertificationReCertificationActions.reduce((acc, currentLine) => {

        const currentLineElements = currentLine.split(",");
        const seqId = currentLineElements[0];
        const date = currentLineElements[2];
        const time = currentLineElements[3];
        const location = "          ";
        const odometer = "          "; 
        const engHours = "          "; 
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
        //console.log(`certificationEvents:${oneEvent}`);
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
        const odometer = currentLineElements[4]; 
        const engHours = currentLineElements[5];
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
        // console.log(oneEvent);

        return [...acc, oneEvent];
    }, []);
    const loginLogoutEvents = ELDLoginLogoutReport.reduce((acc, currentLine) => {

        const currentLineElements = currentLine.split(",");
        const seqId = currentLineElements[0];
        const date = currentLineElements[3];
        const time = currentLineElements[4];
        const location = "          ";
        const odometer = currentLineElements[5];
        const engHours = currentLineElements[6];
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
        //console.log(oneEvent);
        return [...acc, oneEvent];
    }, []);
    function sortBasedOnDates(eventA, eventB){
        const elementsEventA = eventA.split(" | ");
        const elementsEventB = eventB.split(" | ");
        const leftDate = moment.utc(elementsEventA[1] + " " + elementsEventA[2], "MMDDYY HHmmss");
        const rightDate = moment.utc(elementsEventB[1] + " " + elementsEventB[2], "MMDDYY HHmmss");
        return leftDate.diff(rightDate);
    }

    const allEvents = [...driverStatusEvents, ...certificationEvents, ...powerupEvents, ...loginLogoutEvents, ...malfunctionAndDDEvents];

    //sorting all events based on dates
    const sortedAllEvents = allEvents.sort(sortBasedOnDates);
    //console.log(sortedAllEvents);
    const SeqIdResultStatements = [];
    const OdometerResultStatements = [];
    const EngHrsResultStatements = [];
    const IntermediateLogResultStatements = [];
      
    //checking missing seqId
       const sortedSeqIds = sortedAllEvents.map(event => {
    const seqId = parseInt(event.split(" | ")[0], 16); // Parse as hexadecimal
    if (!isNaN(seqId)) {
        return seqId;
    } else {
        return null; // Handle invalid seqIds by converting them to null
    }
});

const allSeqIds = sortedSeqIds.filter(seqId => seqId !== null);

const seenSeqIds = new Set(); // Set to keep track of seen SeqIds
const repeatedSeqIds = new Set(); // Set to keep track of repeated SeqIds
const missingSeqIds = []; // Initialize missingSeqIds array

for (const seqId of allSeqIds) {
    if (seenSeqIds.has(seqId)) {
        repeatedSeqIds.add(seqId);
    } else {
        seenSeqIds.add(seqId);
    }
}
const minSeqId = Math.min(...allSeqIds);
const maxSeqId = Math.max(...allSeqIds);

for (let i = minSeqId; i <= maxSeqId; i++) {
    if (!seenSeqIds.has(i)) {
        missingSeqIds.push(i.toString(16));
    }
}


if (missingSeqIds.length === 0 && repeatedSeqIds.size === 0) {
    SeqIdResultStatements.push("No missing or repeated seqIds.");
} else {
    const resultStatements = [];
    if (missingSeqIds.length > 0) {
        resultStatements.push(`Missing seqIds: ${missingSeqIds.join(" | ")}`);
    }
    if (repeatedSeqIds.size > 0) {
        resultStatements.push(`Repeated seqIds: ${[...repeatedSeqIds].map(seqId => seqId.toString(16)).join(" | ")}`);
    }
    SeqIdResultStatements.push(resultStatements.join(" "));
}

    
    // Checking Odometer order, Engine Hours order and Unwanted Intermediate log's
    let isPUEventActive = false;
    let absOdometer = 0;
    let absEngHours = 0;
    let latestHosStatus;
    
    let previousOdometer = 0; 
    let previousEngHours = 0;
    let currentOdometer;
    let currentEngHours;
    let currentIndex = 0; 
    let latestDrivingStatus


    const results = sortedAllEvents.map((event, i) => {
        const eventElements = event.split(" | ");
        currentIndex = i;

        if (eventElements[6] === "Power-up") {
            isPUEventActive = true;
            absOdometer = eventElements[4];
            absEngHours = eventElements[5];
        }
        if (eventElements[6] === "Shut-down") {
            isPUEventActive = false;
        }
        const drivingStatus = [
            "Driving","Driving (Inactive-Changed)"
        ];
        const Malfunction_Diagnostic = [
            "Malfunction logged","Malfunction cleared","Diagnostic logged","Diagnostic cleared"
        ];

        const hosStatuses = [
            "Off-duty", "On-duty, not driving", "Driving", "Sleeper Berth",
            "Off-duty (Inactive-Changed)", "On-duty, not driving (Inactive-Changed)", "Driving (Inactive-Changed)", "Sleeper Berth (Inactive-Changed)",
        ];

        const nonDrivingHosStatuses = [
            "Off-duty", "On-duty, not driving", "Sleeper Berth",
            "Off-duty (Inactive-Changed)", "On-duty, not driving (Inactive-Changed)", "Sleeper Berth (Inactive-Changed)",
        ];

        //writing missing power-up events and adding odometer and EngHrs
        if (!isPUEventActive && eventElements[6] !== "Shut-down" ) {
            eventElements[4] = "Missing power-up event";
            eventElements[5] = "Missing power-up event";
        } else if ( eventElements[6] !== "Power-up" && eventElements[6] !== "Shut-down" &&
            eventElements[6] !== "Login" && eventElements[6] !== "Logout" && !eventElements[6].includes("diagnostic") &&
            !eventElements[6].includes("Malfunction")) {
            eventElements[4] = Number(absOdometer) + Number(eventElements[4]);
            eventElements[5] = Number(absEngHours) + Number(eventElements[5]);
        } else {
            eventElements[4] = Number(eventElements[4]);
            eventElements[5] = Number(eventElements[5]);previousEngHours 
        }
        // console.log(eventElements[0], eventElements[4]);

     

        //check if Engine Hours is in ascending order
        if (eventElements[5] !== "Missing power-up event" && eventElements[5] !== null) {
            currentEngHours = parseFloat(eventElements[5]);
            if (currentEngHours < previousEngHours && previousEngHours - currentEngHours > 1) {
                EngHrsResultStatements.push(`Not in Order: ${eventElements[5]}, Date: ${eventElements[1]}, Time: ${eventElements[2]}, EventType: ${eventElements[6]}`);
                //console.log(`Current EngHours: ${currentEngHours}, Previous EngHours: ${previousEngHours}`);
            }
            previousEngHours = currentEngHours;
        }

       

        // Check if the odometer is in ascending order
        if (eventElements[4] !== "Missing power-up event" && eventElements[4] !== null) {
            currentOdometer = parseFloat(eventElements[4]);
            if (currentOdometer < previousOdometer) {
                OdometerResultStatements.push(` Not in Order: ${eventElements[4]}, Date: ${eventElements[1]}, Time: ${eventElements[2]}, EventType: ${eventElements[6]}`);
                //console.log(`Current Odometer: ${currentOdometer}, Previous Odometer: ${previousOdometer}`);
            }
            previousOdometer = currentOdometer;
        }
        
        //checking for unwanted Intermediate log
        if (eventElements[6] === "Intermediate log") {
            const lastStatusIndex = hosStatuses.indexOf(latestHosStatus);
            const isDrivingStatus = (
                lastStatusIndex >= hosStatuses.indexOf(drivingStatus[0]) &&
                lastStatusIndex <= hosStatuses.indexOf(drivingStatus[1])
            );
        
            const isNonDrivingStatus = (
                hosStatuses.indexOf(eventElements[6]) >= hosStatuses.indexOf(nonDrivingHosStatuses[0]) &&
                hosStatuses.indexOf(eventElements[6]) <= hosStatuses.indexOf(nonDrivingHosStatuses[nonDrivingHosStatuses.length - 1])
            );
        
            if (isDrivingStatus || isNonDrivingStatus) {
                IntermediateLogResultStatements.push(`OK: ${latestHosStatus}, Date: ${eventElements[1]}, Time: ${eventElements[2]}, EventType: ${eventElements[6]}`);
            } else {
                IntermediateLogResultStatements.push(`NOT OK: latestHosStatus: ${latestHosStatus}, Date: ${eventElements[1]}, Time: ${eventElements[2]}, CurrentHosStatus ${eventElements[6]}`);
            }
        }
        
        if (eventElements[6] === "Driving (Inactive-Changed)") {
            eventElements[8] = eventElements[8] ? eventElements[8] + ". edited drive" : "edited drive";
        }
        
        if (hosStatuses.indexOf(eventElements[6]) >= 0) {
            latestHosStatus = hosStatuses[Number(hosStatuses.indexOf(eventElements[6]))];
        }
        
        

        return eventElements;
    });
    
    
    // console.log("Odometer Result Statements: ", OdometerResultStatements);
    // console.log("Engine Hours Result Statements: ", EngHrsResultStatements); 
    // console.log("Intermediate Log Result Statements: ", IntermediateLogResultStatements);
    console.log(new Date().toUTCString(), " | Exit [validateSubmission]");

    return { 
        results,
        SeqIdResultStatements,
        OdometerResultStatements,
        EngHrsResultStatements,
        IntermediateLogResultStatements,
     };
}


//Defining eventTypes
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
        throw new Error("Invalid event type");
    }

    return eventType;
}


async function processCsvFile(inputFile , outputFile) {
    try {
        const csvFilePath = inputFile;
        const csvData = await fs.readFile(csvFilePath, 'utf8');

        const jsonData = await convertCsvStringToJson(csvData);

        if (jsonData) {
            const validationReport = createWebViewFromCsvFile(jsonData);
            
            // Extract the results from the validation report
            const { SeqIdResultStatements, OdometerResultStatements, EngHrsResultStatements, IntermediateLogResultStatements } = validationReport;

            // Create a new object with the extracted results
            const outputData = {
                SeqIdResultStatements,
                OdometerResultStatements,
                EngHrsResultStatements,
                IntermediateLogResultStatements,
            };

            const validationReportString = JSON.stringify(outputData, null, 2);

            const outputPath = path.join(__dirname,outputFile );
            await fs.writeFile(outputPath, validationReportString);

            console.log('Output has been written to the file successfully.');
        } else {
            throw new Error('Failed to convert CSV data to JSON');
        }
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

// Call the function
processCsvFile('PANKA0017110123-000000000_12_54_56Z_.csv', '1output.txt');

