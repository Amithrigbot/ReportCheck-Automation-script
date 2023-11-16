const fs = require('fs');
const path = require('path');
const readline = require('readline');

function csvFileToJson() {
  return new Promise((resolve, reject) => {
    const results = [];
    const filePath = path.join(__dirname, 'PANKA0017110123-000000000_12_54_56Z_.csv');
    let currentSection = null;
    let currentHeader = null;

    const lineReader = readline.createInterface({
      input: fs.createReadStream(filePath, 'utf-8'),
      crlfDelay: Infinity,
    });

    lineReader.on('line', (line) => {
      const trimmedLine = line.trim();

      if (trimmedLine.endsWith(':')) {
        currentHeader = trimmedLine.slice(0, -1);
        currentSection = { [currentHeader]: [] };
        results.push(currentSection);
      } else if (currentHeader !== null && trimmedLine !== '') {
        currentSection[currentHeader].push(trimmedLine);
      }
    });

    lineReader.on('close', () => {
      resolve(results);
    });

    lineReader.on('error', (error) => {
      reject(error);
    });
  });
}

csvFileToJson()
  .then((jsonArray) => {
    const outputFile = path.join(__dirname, '1Singh.json');
    fs.writeFile(outputFile, JSON.stringify(jsonArray, null, 2), (err) => {
      if (err) {
        console.error('Error writing to data.json:', err);
      } else {
        console.log(`Data has been written to ${outputFile}`);
      }
    });
  })
  .catch((error) => {
    console.error('Error:', error);
  });
