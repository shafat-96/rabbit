const { spawn } = require('child_process');

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

const handleEmbed = (embedUrl, referrer) => {
    return new Promise((resolve, reject) => {
        const process = spawn('node', [
            'rabbit.js',
            `--embed-url=${embedUrl}`,
            `--referrer=${referrer}`
        ]);

        let outputData = '';
        let errorData = '';

        process.stdout.on('data', (data) => {
            outputData += data.toString();
        });

        process.stderr.on('data', (data) => {
            errorData += data.toString();
        });

        process.on('close', (code) => {
            if (code !== 0) {
                console.error('Error processing embed:', errorData);
                reject(new Error(`Process exited with code ${code}`));
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
    });
};

module.exports = async (req, res) => {
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
        res.status(500).json({ error: 'Internal server error' });
    }
}; 