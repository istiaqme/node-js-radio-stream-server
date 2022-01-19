/* 
    fs.readfile()
        loads the whole file → sends it to the client
        The data transfer speed will be slower if the file content is big.
*/

/* 
    fs.createReadStream()
        reads the entire file in chunks of sizes (streaming) → sends it to the client
        The client will also receive the data faster

*/
const express     = require('express');
const app         = express();
const fs          = require('fs');

app.listen(3000, function() {
    console.log("Radio Server Listening at PORT 3000");
});

app.get('/api/play/:key', function(req, res) {
    let key = req.params.key;

    let music = 'radio/' + key + '.mp3';

    let stat = fs.statSync(music);
    range = req.headers.range;
    let readStream;
    // if there is no request about range
    if (range !== undefined) {
        // remove 'bytes=' and split the string by '-'
        let parts = range.replace(/bytes=/, "").split("-");

        let partialStart = parts[0];
        let partialEnd = parts[1];

        if ((isNaN(partialStart) && partialStart.length > 1) || (isNaN(partialEnd) && partialEnd.length > 1)) {
            return res.sendStatus(500); //ERR_INCOMPLETE_CHUNKED_ENCODING
        }
        // convert string to integer (start)
        let start = parseInt(partialStart, 10);
        // convert string to integer (end)
        // if partial_end doesn't exist, end equals whole file size - 1
        let end = partialEnd ? parseInt(partialEnd, 10) : stat.size - 1;
        let contentLength = (end - start) + 1;

        res.status(206).header({
            'Content-Type': 'audio/mpeg',
            'Content-Length': contentLength,
            'Content-Range': "bytes " + start + "-" + end + "/" + stat.size
        });
        // Read the stream of starting & ending part
        readStream = fs.createReadStream(music, {start: start, end: end});
    } else {
        res.header({
            'Content-Type': 'audio/mpeg',
            'Content-Length': stat.size
        });
        readStream = fs.createReadStream(music);
    }
    readStream.pipe(res);
});