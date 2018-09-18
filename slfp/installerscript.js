const MSICreator = require('electron-wix-msi').MSICreator;

async function installer() {

  // Step 1: Instantiate the MSICreator
  const msiCreator = new MSICreator({
    appDirectory: 'C:/Design/auxilium/slfp/Auxfina-win32-x64',
    description: 'Auxfina - Langfristige Liquiditaetsplanung',
    exe: 'Auxfina',
    name: 'Auxfina',
    manufacturer: 'Auxilium AG',
    version: '2.5.1',
    outputDirectory: 'C:/Design/auxilium/slfp/installer',
    language: 2055,
    ui:{
      enabled: true,
      chooseDirectory: true
    }
  });

  // Step 2: Create a .wxs template file
  await msiCreator.create();

  // Step 3: Compile the template to a .msi file
  await msiCreator.compile();

}

installer();
