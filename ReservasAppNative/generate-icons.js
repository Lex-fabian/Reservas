const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const iconSizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192
};

const inputIcon = path.join(__dirname, 'src', 'assets', 'icono.jpeg');
const outputBase = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');

async function generateIcons() {
  console.log(' Generando iconos para Android...\n');

  for (const [folder, size] of Object.entries(iconSizes)) {
    const outputDir = path.join(outputBase, folder);
    
    // Crear directorio si no existe
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generar ic_launcher.png (cuadrado)
    const launcherPath = path.join(outputDir, 'ic_launcher.png');
    await sharp(inputIcon)
      .resize(size, size, {
        fit: 'cover',
        position: 'center'
      })
      .png()
      .toFile(launcherPath);
    
    console.log(` ${folder}/ic_launcher.png (${size}x${size})`);

    // Generar ic_launcher_round.png (circular)
    const roundPath = path.join(outputDir, 'ic_launcher_round.png');
    await sharp(inputIcon)
      .resize(size, size, {
        fit: 'cover',
        position: 'center'
      })
      .png()
      .toFile(roundPath);
    
    console.log(` ${folder}/ic_launcher_round.png (${size}x${size})`);
  }

  console.log('\n ¡Iconos generados exitosamente!');
  console.log('\n Ahora ejecuta:');
  console.log('   cd android');
  console.log('   & ".\\gradlew.bat" clean');
  console.log('   & ".\\gradlew.bat" assembleRelease');
}

generateIcons().catch(err => {
  console.error(' Error generando iconos:', err);
  process.exit(1);
});
