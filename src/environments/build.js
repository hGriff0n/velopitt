const setEnv = () => {
  const fs = require('fs');
  require('dotenv').config({
    path: 'src/environments/.env'
  });
  const appVersion = require('../../package.json').version;

  const writeFile = fs.writeFile;
  const targetPath = './src/environments/environment.ts';

  const envConfigFile = `export const environment = {
  GH_TOKEN: '${process.env['GH_TOKEN']}',
  STRAVA_ID: '${process.env['STRAVA_ID']}',
  STRAVA_SECRET: '${process.env['STRAVA_SECRET']}',
  STRAVA_TOKEN: '${process.env['STRAVA_TOKEN']}',
  appVersion: '${appVersion}',
  production: true,
};`;

  console.log('The file `environment.ts` will be written with the following content: \n');
  writeFile(targetPath, envConfigFile, (err) => {
    if (err) {
      console.error(err);
      throw err;
    } else {
      console.log(`Angular environment.ts file generated correctly at ${targetPath} \n`);
    }
  });
};

setEnv();
