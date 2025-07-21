# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Environment Setup

### OpenAI API Configuration

This project uses OpenAI API for AI-powered features like hashtag recommendations and travel destination suggestions.

#### 1. Get OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/account/api-keys)
2. Create an account or sign in
3. Generate a new API key
4. Copy the API key (format: `sk-xxxxxxxxxx`)

#### 2. Set Environment Variable

Create a `.env` file in the project root directory and add your API key:

```env
REACT_APP_OPENAI_API_KEY=sk-your-actual-api-key-here
```

**Important:**

- Replace `sk-your-actual-api-key-here` with your actual OpenAI API key
- Never commit your `.env` file to version control
- The `.env` file is already added to `.gitignore`

#### 3. Features Enabled with API Key

- 🏷️ **Smart Hashtag Generation**: AI analyzes your travel plan and generates 5 specific, trending hashtags
- 📍 **Personalized Place Recommendations**: Get 9 curated recommendations (3 restaurants, 3 activities, 3 attractions) based on your destination and travel style

**Note:** If no API key is provided, the app will work with default recommendations instead.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
