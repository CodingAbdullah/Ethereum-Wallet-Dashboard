# Ethereum-Wallet-Dashboard
A descriptive web app, detailing the history of all transactions including all different kinds of ERC transactions.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### `Start Here`

The frontend application is deployed to **AWS Amplify**

Please note that more testing (frontend/backend), security is required. As well as the backend server needing to be deployed. This is just PARTIAL preview.

**URL is here:** https://front-end-branch.db82n09wcg0iz.amplifyapp.com/

All available scripts run under the front end folder of this repository. You must have Node installed on your  computer and have access to the npm package manager which will allow you to download external libraries and also run, build, and test your react app.

For security reasons, many APIs that require Authorization, will be moved to the backend and be made available for frontend usage via node server with connected routes. It is from these routes that API calls will be made to fetch information and send as responses to the frontend.

Therefore, this is now a full stack project and it is required to have both the frontend and backend servers running simultaneously on different ports for correct communication and function.

Running this project locally will require you to acquire separate API keys for running API requests to resources. These include various different sites such as Etherscan, Moralis, and Alchemy. Dev's keys are hidden in this project under the .env file which was not committed to GitHub for security reasons. 

Additional documentation on the app and the API resources used will be provided as the project completes.

No API keys means failed requests to select API resources.

### `Links`

Here are links to the available API resources used in this project. NOTE: Opensea API resources are NOT available at this time as they are not issuing API keys. Hence, an alternate platform, Alchemy will be used instead.

[Alchemy](https://docs.alchemy.com/reference/)
[Etherscan](https://etherscan.io/apis)
[Moralis](https://docs.moralis.io/)
[Transpose](https://transpose.io/)
[Blocknative](https://blocknative.com/)
[CoinGecko](https://www.coingecko.com/en/api/documentation)


## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

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

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
