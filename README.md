# ArticuLITE

A web-based adaptation of the Articulate board game with AI-powered question generation.

## Features

- **Password Protection**: Secure game sessions with password protection
- **Game Setup Interface**: Configure teams, time limits, and win conditions
- **Question Generation**: AI-powered question generation using the OpenAI API
- **Game Management**: Track scores, time, and progress for each team
- **Responsive Design**: Optimized for both desktop and mobile play

## Getting Started

### Prerequisites

- Node.js 19.0.0 or higher
- npm or yarn package manager
- OpenAI API key (for question generation)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/articulite.git
   cd articulite
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the root directory and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

- `app/` - Next.js App Router pages and layouts
  - `auth/` - Password protection
  - `setup/` - Game configuration
  - `game/` - Game interface
- `components/` - Reusable UI components
- `lib/` - Utility functions and shared code
- `contexts/` - React context providers
- `hooks/` - Custom React hooks

## Deployment

This project is configured for deployment on Vercel. For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

Quick deployment steps:
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables
4. Deploy!

## Testing

Run the test suite with:

```bash
npm test
# or
yarn test
```

## Built With

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [OpenAI API](https://openai.com/) - AI-powered question generation

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Original Articulate board game by Drumond Park
- Next.js team for the amazing framework