const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const bodyParser = require('body-parser');

const AGGREGATOR = "https://aggregator.walrus-testnet.walrus.space";
const PUBLISHER = "https://publisher.walrus-testnet.walrus.space";


const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));


async function upload(fileBuffer) {
    try {
        const url = `${PUBLISHER}/v1/blobs`;

        const response = await axios({
            method: 'put',
            url: url,
            data: fileBuffer,
            headers: {
                'Content-Type': 'application/octet-stream'
            }
        });

        const jsonResponse = response.data;
        console.log(response);
        

        if (jsonResponse.alreadyCertified) {
            return jsonResponse.alreadyCertified.blobId;
        }

        return jsonResponse.newlyCreated.blobObject.blobId;
    } catch (error) {
        console.error(`Error uploading file: ${error.message}`);
        throw error;
    }
}

async function get(blobId, savePath) {
    try {
        const url = `${AGGREGATOR}/v1/blobs/${blobId}`;
        const response = await axios({
            method: 'get',
            url: url,
            responseType: 'arraybuffer'
        });

        await require('fs').promises.writeFile(savePath, response.data);
        return true;
    } catch (error) {
        console.error(`Error downloading blob: ${error.message}`);
        return false;
    }
}

app.get('/retrieve', async (req, res) => {
    try {
        const blobId = req.query.blobId;
        if (!blobId) {
            return res.status(400).json({ error: 'No blob ID provided' });
        }

        const savePath = path.join(__dirname, 'downloaded_blob');
        const success = await get(blobId, savePath);

        if (success) {
            res.status(200).sendFile(savePath);
        } else {
            res.status(500).json({ error: 'Failed to download blob' });
        }
    } catch (error) {
        console.error(`Unexpected error: ${error.message}`);
        res.status(500).json({
            error: 'An unexpected error occurred',
            details: error.message
        });
    }
})

app.post('/upload', async (req, res) => {
    try {
        // Validate request data
        if (!req.body || !req.body.data) {
            return res.status(400).json({ error: 'No data provided' });
        }

        // Convert data to buffer
        const fileBuffer = Buffer.from(req.body.data, 'utf-8');

        // Upload file directly
        const uploader = await upload(fileBuffer);
        console.log('Uploaded blob ID:', uploader);


        res.status(200).send(uploader);
    } catch (error) {
        console.error(`Unexpected error: ${error.message}`);

        // Differentiate between different types of errors
        if (error.name === 'TypeError') {
            return res.status(400).json({ error: 'Invalid data format' });
        }

        res.status(500).json({
            error: 'An unexpected error occurred',
            details: error.message
        });
    }
});



// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Export for potential testing or module usage
module.exports = { app, upload, get };