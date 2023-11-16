const fs = require('fs');
const path = require('path');

function ELD_Event_List(lines) {
  const objects = lines.map((line) => {
    const values = line.split(',');
    const obj = {
      eventSeqId: values[0].trim() || 'info1',
      eventRecordStatus: values[1].trim() || 'info2',
      eventRecordOrigin: values[2].trim() || 'info3',
      eventType: values[3].trim() || 'info4', 
      eventCode: values[4].trim() || 'info5',
      eventDate: values[5].trim() || 'info6',
      eventTime: values[6].trim() || 'info7',
      accumulatedVehicleMiles: values[7].trim() || 'info8',
      accumulatedEngineHours: values[8].trim() || 'info9',
      eventLatitude: values[9].trim() || 'info10',
      eventLongitude: values[10].trim() || 'info11',
      '1': values[11].trim() || 'info12',
      cmvOrderNumber: values[12].trim() || 'info13',
      userOrderNumber: values[13].trim() || 'info14',
      malfunctionStatus: values[14].trim() || 'info15',
      dataDiagnosticStatus: values[15].trim() || 'info16',
    };

    return obj;
  });

  return objects;
}

function Drivers_Certification_Recertification_Actions(lines) {
  const objects = lines.map((line) => {
    const values = line.split(',');
    const obj = {
      eventSeqId: values[0].trim() || 'info1',
      eventCode: values[1].trim() || 'info2',
      eventDate: values[2].trim() || 'info3',
      eventTime: values[3].trim() || 'info4',
      certifiedForDate: values[4].trim() || 'info5',
      '1': values[5].trim() || 'info6',
    };

    return obj;
  });

  return objects;
}

function Malfunctions_and_Data_Diagnostic_Events(lines) {
  const objects = lines.map((lines) => {
    const values = lines.split(',');
    const obj = {
      eventSeqId: values[0].trim() || 'info1',
      eventCode: values[1].trim() || 'info2',
      MForDDCode: values[2].trim() || 'info3',
      eventDate: values[3].trim() || 'info4',
      eventTime: values[4].trim() || 'info5',
      '(totalVehicleMiles || 0)': values[5].trim() ,
      '(totalEngineHours || 0.0)': values[6].trim() ,
      cmvOrderNumber: values[7].trim() || 'info8'
    };
    return obj;
  });
  return objects;
}

function ELD_Login_Logout_report(lines){
  const object = lines.map((lines) => {
    const values = lines.split(',');
    const obj = {
      eventSeqId: values[0].trim() || 'info1',
      eventCode: values[1].trim() || 'info2',
      userName: values[2].trim() || 'info3',
      eventDate: values[3].trim() || 'info4',
      eventTime: values[4].trim() || 'info5',
      '(totalVehicleMiles || 0)': values[5].trim() || 'info6',
      '(totalEngineHours || 0.0)':values[6].trim() || 'info7'
    };
    return obj;
  });
  return object;
}

function CMV_Engine_PowerUp_and_Shut_Down_Activity(lines){
  const object = lines.map((lines) =>{
    const values = lines.split(',');
    const obj = {
      eventSeqId: values[0].trim() || 'info1',
      eventCode: values[1].trim() || 'info2',
      eventDate:values[2].trim() || 'info3',
      eventTime:values[3].trim() || 'info4',
      '(totalVehicleMiles || 0)': values[4].trim() || 'info5',
      '(totalEngineHours || 0.0)': values[5].trim() || 'info6', 
      latitude:values[6].trim() || 'info7',
      longitude:values[7].trim() || 'info8',
      powerUnitNumber: values[8].trim() || 'info9',
      vin:values[9].trim() || 'info10',
      trailerNumbers:values[10].trim() || 'info11',
      shippingDocNumbers:values[11].trim() || 'info12'
    };
    return obj;
  });
  return object;
}

function Unidentified_Driver_Profile_Records(lines){
  const object = lines.map((lines) =>{
    const values = lines.split(',');
    const obj = {
      eventSeqId: values[0].trim() || 'info1',
      eventRecordStatus:values[1].trim() || 'info2',
      eventRecordOrigin: values[2].trim() || 'info3',
      eventType: values[3].trim() || 'info4',
      eventCode : values[4].trim() || 'info5',
      eventDate : values[5].trim() || 'info6',
      eventTime : values[6].trim() || 'info7',
      accumulatedVehicleMiles : values[7].trim() || 'info8',
      accumulatedEngineHours: values[8].trim() || 'info9',
      eventLatitude : values[9].trim() || 'info10',
      eventLongitude :values[10].trim() || 'info12',
      '1':values[10].trim() || 'info13',
      cmvOrderNumber: values[12].trim() || 'info13',
      '0':values[13].trim() || 'info14'
    };
    return obj;
  });
  return object;
}

const processingHeaders = {
    'ELD Event List': ELD_Event_List,
    "Driver's Certification/Recertification Actions" : Drivers_Certification_Recertification_Actions,
    "Malfunctions and Data Diagnostic Events" : Malfunctions_and_Data_Diagnostic_Events,
    "ELD Login/Logout Report": ELD_Login_Logout_report,
    "CMV Engine Power-Up and Shut Down Activity": CMV_Engine_PowerUp_and_Shut_Down_Activity,
    "Unidentified Driver Profile Records": Unidentified_Driver_Profile_Records,
  };

//converting JSON data into array of object 
function processingJsonData(jsonData) {
    const result = {};
  
    jsonData.forEach((headerObject) => {
      const header = Object.keys(headerObject)[0];
      const lines = headerObject[header];
      const processingHeader = processingHeaders[header];
      if (processingHeader) {
        const objects = processingHeader(lines);
        result[header] = objects;
      }
    });
  
    return result;
  }
  

  //calling function to convert Json array of objects from json file
  function ConvertJsonFile(inputFile, outputFile) {
    fs.readFile(inputFile, 'utf-8', (err, data) => {
      if (err) {
        console.error('Error reading JSON file:', err);
        return;
      }
  
      try {
        const jsonData = JSON.parse(data);
        const result = processingJsonData(jsonData);
  
        fs.writeFile(
          path.join(__dirname, outputFile),
          JSON.stringify(result, null, 2),
          (writeErr) => {
            if (writeErr) {
              console.error('Error writing to conversionResult.json:', writeErr);
            } else {
              console.log('Data has been written successfully to conversionResult.json');
            }
          }
        );
      } catch (jsonError) {
        console.error('Error parsing JSON:', jsonError);
      }
    });
  }
  


//const jsonFilePath = path.join(__dirname, 'Singh2037092823-000000000_00-00-00Z_.json');

ConvertJsonFile('1Singh.json', '2Singh.json');
