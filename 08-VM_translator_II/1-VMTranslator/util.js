const fs = require('fs');

const getFiles = path => {
  if (path.endsWith('/')) path = path.slice(0, -1);
  const pathArr = path.split('/');

  let dir;
  let fileName;
  let filePaths = [];

  if (fs.statSync(path).isFile()) {
    fileName = pathArr.pop().slice(0, -3);
    dir = pathArr.join('/');
    filePaths = [`${dir}/${fileName}.vm`];
  } else if (fs.statSync(path).isDirectory()) {
    dir = path;
    fileName = pathArr.pop();
    fs.readdirSync(dir)
      .filter(fileName => fileName.endsWith('.vm'))
      .forEach(fileName => filePaths.push(`${dir}/${fileName}`));
  } else {
    console.log('Invalid file path!');
    process.exit(1);
  }

  return { dir, fileName, filePaths };
};

module.exports = { getFiles };
