# AI Chat Assistant

A modern AI-powered chat assistant with document analysis and voice command capabilities, built with React, TypeScript, and Vite.

## Features

- 🤖 AI-powered conversations using Google Gemini
- 📄 Document analysis (PDFs, images)
- 🎙️ Voice command support
- 🎨 Beautiful, responsive UI with dark theme
- 🔧 Built with React, TypeScript, and Vite
- ☁️ Backend integration with Supabase

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google Gemini API key
- Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/samyak-jain19/chat-assistance.git
   ```

2. Navigate to the project directory:
   ```bash
   cd chat-assistance
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a `.env` file in the root directory with your API keys:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open your browser and visit `http://localhost:5173`

## Deployment

This project can be easily deployed to Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set the environment variables in Vercel dashboard
4. Deploy!

## Project Structure

- `index.tsx` - Main application file with all React components
- `supabaseClient.ts` - Supabase client configuration
- `vite.config.ts` - Vite configuration
- `tsconfig.json` - TypeScript configuration
- `package.json` - Project dependencies and scripts

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.