const https = require('https');

const url = 'https://www.mlg-consulting.com/smart_territory/form/api.php?action=getJuryEvent&ije=a5lrYw==';

console.log('Fetching:', url);

https.get(url, (res) => {
    console.log('StatusCode:', res.statusCode);
    console.log('Headers:', res.headers);

    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Body:', data);
        try {
            const json = JSON.parse(data);
            console.log('JSON parsed successfully');
        } catch (e) {
            console.error('JSON parse error:', e.message);
        }
    });

}).on('error', (e) => {
    console.error('Error:', e);
});
