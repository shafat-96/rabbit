const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

class EmbedSource {
    constructor(file, sourceType) {
        this.file = file;
        this.type = sourceType;
    }
}

class Track {
    constructor(file, label, kind, isDefault = false) {
        this.file = file;
        this.label = label;
        this.kind = kind;
        if (isDefault) {
            this.default = isDefault;
        }
    }
}

class EmbedSources {
    constructor(sources = [], tracks = [], t = 0, server = 1) {
        this.sources = sources;
        this.tracks = tracks;
        this.t = t;
        this.server = server;
    }
}

const findRabbitScript = async () => {
    const possiblePaths = [
        path.join(__dirname, '..', 'rabbit.js'),
        path.join(__dirname, 'rabbit.js'),
        path.join(process.cwd(), 'rabbit.js')
    ];

    for (const p of possiblePaths) {
        try {
            await fs.access(p);
            console.log('Found rabbit.js at:', p);
            return p;
        } catch (error) {
            console.log('Not found at:', p);
        }
    }
    throw new Error('rabbit.js not found in any expected locations');
};

const handleEmbed = async (embedUrl, referrer) => {
    return new Promise(async (resolve, reject) => {
        try {
            const rabbitPath = await findRabbitScript();
            console.log('Using rabbit.js from:', rabbitPath);

            const childProcess = spawn('node', [
                rabbitPath,
                `--embed-url=${embedUrl}`,
                `--referrer=${referrer}`
            ]);

            let outputData = '';
            let errorData = '';

            childProcess.stdout.on('data', (data) => {
                outputData += data.toString();
                console.log('Stdout:', data.toString());
            });

            childProcess.stderr.on('data', (data) => {
                errorData += data.toString();
                console.error('Stderr:', data.toString());
            });

            childProcess.on('close', (code) => {
                console.log('Process exited with code:', code);
                if (code !== 0) {
                    console.error('Error processing embed:', errorData);
                    reject(new Error(`Process exited with code ${code}: ${errorData}`));
                    return;
                }

                try {
                    const parsedOutput = JSON.parse(outputData.trim());
                    const embedSources = new EmbedSources(
                        parsedOutput.sources.map(s => new EmbedSource(s.file, s.type)),
                        parsedOutput.tracks.map(t => new Track(t.file, t.label, t.kind, t.default)),
                        parsedOutput.t,
                        parsedOutput.server
                    );
                    resolve(embedSources);
                } catch (error) {
                    console.error('Error parsing embed output:', error);
                    reject(error);
                }
            });

            childProcess.on('error', (error) => {
                console.error('Failed to start process:', error);
                reject(error);
            });
        } catch (error) {
            console.error('Error in handleEmbed:', error);
            reject(error);
        }
    });
};

module.exports = async (req, res) => {
    console.log('Received request:', {
        method: req.method,
        query: req.query,
        headers: req.headers
    });

    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const { embed_url, referrer } = req.query;
        
        if (!embed_url || !referrer) {
            return res.status(400).json({ 
                error: 'Missing required parameters: embed_url and referrer' 
            });
        }

        const embedSources = await handleEmbed(embed_url, referrer);
        res.json(embedSources);
    } catch (error) {
        console.error('Error processing embed request:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}; 
