const fs = require('fs');
const path = require('path');

function createFile(user, pass, database, filePath, fileName) {
  const stream = fs.createWriteStream(path.join(filePath, fileName));

  stream.once('open', () => {
    stream.write(`[Academico]\n`);
    stream.write(`DriverName=Oracle\n`);
    stream.write(`Database=${database}\n`);
    stream.write(`User_Name=${user}\n`);
    stream.write(`Password=${pass}`);
    stream.end();
  });
}

module.exports = { createFile };
