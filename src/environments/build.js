const setEnv = () => {
  const fs = require('fs');
  require('dotenv').config({
    path: 'src/environments/.env'
  });
  const base64 = require('js-base64').Base64;
  const appVersion = require('../../package.json').version;

  const writeFile = fs.writeFile;
  const targetPath = './src/environments/environment.ts';

  // TODO: me - Github will prevent deploying if it detects the raw string
  // Meaning we need to encode and decode the secret
  const envConfigFile = `export const environment = {
  STRAVA_ID: '${base64.encode(process.env['STRAVA_ID'])}',
  STRAVA_SECRET: '${base64.encode(process.env['STRAVA_SECRET'])}',
  STRAVA_TOKEN: '${base64.encode(process.env['STRAVA_TOKEN'])}',
  MAPBOX_API_KEY: '${base64.encode(process.env['MAPBOX_API_KEY'])}',
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
