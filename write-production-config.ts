import { writeFile } from 'fs';

const targetPath = './src/environments/environment.prod.ts';

const envConfigFile = `
export const environment = {
   production: true,
   google: {
      GA_TRACKING_ID: '${process.env.GA_TRACKING_ID}'
   },
   api: '${process.env.API ?? 'https://soundbuttons.azure-api.net'}',
   origin: '${process.env.ORIGIN ?? 'https://sound-buttons.maki0419.com'}',
   button_origin: '${process.env.BUTTON_ORIGIN ?? 'https://button.sound-buttons.maki0419.com'}',
   version: '${process.env.VERSION ?? ''}'
};
`;

writeFile(targetPath, envConfigFile, 'utf8', (err) => {
  if (err) {
    return console.log(err);
  }
});
