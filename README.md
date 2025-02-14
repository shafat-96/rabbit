# Video Embed Processing Server

A serverless API service that processes video embed URLs and returns structured video source information. Built with Node.js and deployable to Vercel.

## Features

- Process video embed URLs
- Return video sources and subtitle tracks
- CORS enabled
- Serverless architecture
- Local development support

## Requirements

- Node.js >= 18.0.0
- npm or yarn
- Vercel CLI (for deployment)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd <repository-name>
```

2. Install dependencies:
```bash
npm install
```

## Development

There are two ways to run the development server:

1. Local Express server:
```bash
npm start
```
This will start the server at `http://localhost:3000`

2. Vercel development environment:
```bash
npm run dev
```
This will start Vercel's local development environment

## API Usage

### GET /api/embed

Process a video embed URL and return video sources.

**Parameters:**

- `embed_url` (required): The video embed URL to process
- `referrer` (required): The referring website URL

**Example Request:**
```bash
curl "http://localhost:3000/api/embed?embed_url=https://example.com/embed/video123&referrer=https://example.com"
```

**Example Response:**
```json
{
  "sources": [
    {
      "file": "https://example.com/stream/m3u8",
      "type": "video/hls"
    }
  ],
  "tracks": [
    {
      "file": "https://example.com/subs/video123.vtt",
      "label": "English",
      "kind": "captions",
      "default": true
    }
  ],
  "t": 1707901234,
  "server": 1
}
```

## Deployment

1. Install Vercel CLI globally (if not already installed):
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy to production:
```bash
npm run deploy
```

After deployment, your API will be available at:
```
https://your-project.vercel.app/api/embed
```

## Project Structure

```
├── api/
│   └── embed.js        # Main API endpoint handler
├── server.js           # Local development server
├── vercel.json         # Vercel configuration
├── package.json        # Project dependencies and scripts
└── README.md          # Project documentation
```

## Environment Variables

- `PORT` - Server port for local development (default: 3000)

## License

MIT License

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request 