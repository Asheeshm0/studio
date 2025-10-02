# KATTAPA AI - Next.js & Genkit Starter

This is a Next.js application integrated with Google's Genkit for AI-powered features.

## Project Setup

### Prerequisites

- Node.js (v20 or later recommended)
- `npm`

### Installation

1.  Clone the repository.
2.  Install the dependencies:

    ```bash
    npm install
    ```

### Environment Variables

Create a `.env` file in the root of the project by copying the example file:

```bash
cp .env.example .env
```

You will need to add your Gemini API key to the `.env` file.

- `GEMINI_API_KEY`: Your API key for the Google AI (Gemini) models.

## Development

To run the development server, which includes the Next.js app and the Genkit developer UI:

```bash
npm run dev
```

The application will be available at `http://localhost:9002`, and the Genkit developer UI will be at `http://localhost:4000`.

## Building for Production

To create a production-ready build of your application:

```bash
npm run build
```

This will compile the Next.js application into static assets and server-side code in the `.next` directory.

## Deployment

This project is configured for deployment on **Firebase App Hosting**.

To deploy the application, you can use the Firebase CLI. After setting up your Firebase project and installing the CLI, you can run:

```bash
firebase deploy --only hosting
```

The `apphosting.yaml` file in the root of the project contains the configuration for the deployment, including the build and start commands.
