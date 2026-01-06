import { writeFile } from 'fs';

const targetPath = './src/environments/environment.prod.ts';

const envConfigFile = `
export const environment = {
   production: true,
   google: {
      GA_TRACKING_ID: '${process.env.GA_TRACKING_ID}'
   },
   api: '${process.env.API ?? 'https://soundbuttons.azure-api.net'}',
   origin: '${process.env.ORIGIN ?? 'https://sound-buttons.click'}',
   version: '${process.env.VERSION ?? ''}',
   CLARITY_TRACKING_ID: '${process.env.CLARITY_TRACKING_ID ?? ''}',
   CLOUDFLARE_RUM_TOKEN: '${process.env.CLOUDFLARE_RUM_TOKEN ?? ''}'
};
`;

writeFile(targetPath, envConfigFile, 'utf8', (err) => {
  if (err) {
    return console.log(err);
  }
});
