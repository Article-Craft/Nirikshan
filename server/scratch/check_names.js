const fs = require('fs');
const path = require('path');

try {
  const geojsonPath = path.join(__dirname, '../../client/public/data/nepal-districts.json');
  const geojsonData = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));
  
  const geojsonNames = geojsonData.features.map(f => {
    return f.properties.DISTRICT || f.properties.name || '';
  });
  
  console.log('Total GeoJSON Districts:', geojsonNames.length);
  console.log('Sample GeoJSON Names:', geojsonNames.slice(0, 15));
  
  // Look for Rukum or Kailali
  console.log('Rukum match in GeoJSON:', geojsonNames.filter(n => n.toUpperCase().includes('RUKUM')));
  console.log('Kailali match in GeoJSON:', geojsonNames.filter(n => n.toUpperCase().includes('KAILALI')));
  console.log('Chitwan match in GeoJSON:', geojsonNames.filter(n => n.toUpperCase().includes('CHITWAN')));
} catch (e) {
  console.error(e);
}
