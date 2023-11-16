const fs = require('fs');
const path = require('path');

//checks if any SeqId's are missing 
function checkSeqId(jsonData) {
  const headersToCheck = [
    'ELD Event List',
    "Driver's Certification/Recertification Actions",
    "Malfunctions and Data Diagnostic Events",
    "ELD Login/Logout Report",
    "CMV Engine Power-Up and Shut Down Activity",
    "Unidentified Driver Profile Records"
  ];

  const result = [];
  const allEventSeqIds = [];

  // Collect all eventSeqId values
  headersToCheck.forEach((header) => {
    const eventList = jsonData[header];
    if (!eventList) {
      console.log(`Header ${header} not found.`);
      return;
    }

    eventList.forEach((event) => {
      allEventSeqIds.push(parseInt(event.eventSeqId, 16));
    });
  });

  // Sort all eventSeqId values
  allEventSeqIds.sort((a, b) => a - b);

  // Find missing eventSeqId values
  for (let i = 0; i < allEventSeqIds.length - 1; i++) {
    const currentId = allEventSeqIds[i];
    const nextId = allEventSeqIds[i + 1];

    if (nextId - currentId !== 1) {
      for (let j = currentId + 1; j < nextId; j++) {
        result.push(`Missing eventSeqId: ${j.toString(16)}`);
      }
    }
  }

  return result;
}



//checks if Odometer and EngineHoues values are increasing
function checkOrderOfOdometerAndEngineHrs(jsonData) {
  const headersToCheck = [
    "Malfunctions and Data Diagnostic Events",
    "ELD Login/Logout Report",
    "CMV Engine Power-Up and Shut Down Activity",
  ];

  const result = {};

  headersToCheck.forEach((header) => {
    if (jsonData[header]) {
      const data = jsonData[header];
      let isOrderMaintained = true;

      for (let i = 1; i < data.length; i++) {
        const prevVehicleMiles = parseFloat(data[i - 1]["(totalVehicleMiles || 0)"]);
        const currVehicleMiles = parseFloat(data[i]["(totalVehicleMiles || 0)"]);
        const prevEngineHours = parseFloat(data[i - 1]["(totalEngineHours || 0.0)"]);
        const currEngineHours = parseFloat(data[i]["(totalEngineHours || 0.0)"]);

        if (prevVehicleMiles < currVehicleMiles || prevEngineHours < currEngineHours) {
          isOrderMaintained = false;
          break;
        }
      }

      if (isOrderMaintained) {
        result[header] = `Values are in Ascending order`;
      } else {
        result[header] = `Values are not in Ascending order`;
      }
    } else {
      result[header] = `No data found for ${header}.`;
    }
  });

  return result;
}

//checks if Odometer and EngineHours values are 0, if it is zero it gives it's SeqId
function checkForZerosInOdometerAndEnginehrs(jsonData) {
  const result = {};

  const headersToCheck = [
    "Malfunctions and Data Diagnostic Events",
    "ELD Login/Logout Report", 
    "CMV Engine Power-Up and Shut Down Activity"
  ];

  headersToCheck.forEach((header) => {
    const data = jsonData[header] || [];
    const headerResult = [];

    data.forEach((item) => {
      const totalVehicleMiles = parseFloat(item["(totalVehicleMiles || 0)"]);
      const totalEngineHours = parseFloat(item["(totalEngineHours || 0.0)"]);

      if (totalVehicleMiles === 0) {
        console.log("Value is 0 at eventSeqId: ${item.eventSeqId} for ${header} - totalVehicleMiles");
        headerResult.push(item.eventSeqId);
      }
      if (totalEngineHours === 0) {
        console.log(`Value is 0 at eventSeqId: ${item.eventSeqId} for ${header} - totalEngineHours`);
        headerResult.push(item.eventSeqId);
      }
    });

    result[header] = headerResult;
  });

  return result;
}






//calling functions
function checkFile(filePath) {
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
      console.error('Error reading JSON file:', err);
      return;
    }

    try {
      const jsonData = JSON.parse(data);

      const zerosResult = checkForZerosInOdometerAndEnginehrs(jsonData);
      const seqIdResult = checkSeqId(jsonData);
      const valuesResult = checkOrderOfOdometerAndEngineHrs(jsonData);

      console.log("Odometer and EngineHours Zero's Result: ", zerosResult);
      console.log("SeqId Order Result: ", seqIdResult);
      console.log("Odometer and EngineHours Order Result: ", valuesResult);
    } catch (jsonError) {
      console.error('Error parsing JSON:', jsonError);
    }
  });
}

const filePath = path.join(__dirname, '2shah.json');
checkFile(filePath);
