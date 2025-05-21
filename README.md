# Seeker AI - Browser Automation Interface

A modern, elegant interface for browser automation using the Browser-Use API and OpenAI GPT-4o integration.

![Seeker AI](https://via.placeholder.com/800x400?text=Seeker+AI)

## Overview

Seeker AI provides a clean, user-friendly interface for browser automation tasks. It leverages the Browser-Use API to automate browser actions based on natural language instructions, with optional GPT-4o-powered AI for enhanced capabilities.

Features:

- Execute browser automation tasks with natural language
- View live task execution in a browser preview
- Control tasks (pause, resume, stop)
- Sandbox environment for safe testing
- OpenAI GPT-4o integration for enhanced task performance

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- A Browser-Use API key (get one from [Browser-Use Cloud](https://cloud.browser-use.com/billing))
- An OpenAI API key for GPT-4o integration (optional, but recommended)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/seeker.git
cd seeker
```

2. Install dependencies:

```bash
npm install
# or
pnpm install
```

3. Create a `.env.local` file with your API keys:

```
# Browser-Use API
NEXT_PUBLIC_BROWSER_USE_API_KEY=your_browser_use_api_key_here

# OpenAI API (optional, for enhanced performance)
OPENAI_API_KEY=your_openai_api_key_here
USE_OPENAI_AGENT=true
```

4. Start the development server:

```bash
npm run dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## OpenAI Integration

Seeker now supports OpenAI's GPT-4o model for enhanced browser automation performance. This integration leverages LangChain to connect OpenAI's powerful language models with Browser-Use's automation capabilities.

### Setup

1. Get an OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add your API key to the `.env.local` file:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   USE_OPENAI_AGENT=true
   ```
3. Optional: Configure additional OpenAI settings in `.env.local`:
   ```
   OPENAI_MODEL=gpt-4o
   OPENAI_TEMPERATURE=0.0
   OPENAI_USE_VISION=true
   ```

### Benefits of OpenAI Integration

- Improved task understanding and execution
- Better handling of complex, multi-step instructions
- Enhanced visual understanding capabilities (with vision enabled)
- More reliable task completion

## How to Test

1. **Enter Your API Key**: Click on "API Keys" in the top right corner and enter your Browser-Use API key. This key will be stored in your browser's local storage.

2. **Configure OpenAI**: If you have an OpenAI API key, enable the "Use OpenAI GPT-4o" option and enter your API key.

3. **Enter a Task**: Type a natural language task in the main input field, such as:
   - "Go to google.com and search for 'latest tech news'"
   - "Visit wikipedia and find information about quantum computing"
   - "Go to twitter.com and search for #AI"

4. **Execute the Task**: Click the "Execute" button to run the task.

5. **View the Live Preview**: The task will execute and you'll see a live preview in the iframe below the input field.

6. **Control the Task**: Use the control buttons to:
   - Pause the task
   - Resume a paused task
   - Stop the task completely

## Example Tasks

Try these example tasks to test the functionality:

- "Go to weather.com and get the weather for New York City"
- "Visit amazon.com, search for headphones, and sort by customer rating"
- "Go to linkedin.com and search for software engineer jobs in San Francisco"

## Troubleshooting

- **API Key Issues**: If you get authentication errors, make sure your API key is correct and has the necessary permissions.
- **Task Not Starting**: Ensure your task description is clear and specific.
- **Preview Not Loading**: Some websites may block iframe embedding. Try with google.com or other public sites first.
- **OpenAI Integration**: If the OpenAI integration isn't working, check your API key and make sure the `USE_OPENAI_AGENT` flag is set to `true` in your `.env.local` file.

## License

MIT

## Acknowledgements

- [Browser-Use API](https://docs.browser-use.com)
- [OpenAI API](https://platform.openai.com)
- [LangChain](https://js.langchain.com)
- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)