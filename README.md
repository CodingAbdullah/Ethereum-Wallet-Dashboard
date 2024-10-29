# Ethereum-Wallet-Dashboard
A lightweight Etherscan implementation for the Ethereum network. Swiftly allowing users to view wallet activity, transactions, asset holdings, tokenomics of ERC20 tokens, coin prices by market cap and so much more.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app). It also incorporates Node.js/Express.js for the back-end and utilizes AWS for cloud deployment.

### `Testnet Information`
<p>Note that APIs related to the <b>Ropsten, Rinkeby, Goerli, and Kovan testnets are NO LONGER AVAILABLE.</b> Searches related to these networks has been removed.</b>
<br />
<p>Only the <b>Sepolia</b> and the new <b>Holesky testnets</b> will be supported. </p>

### `List of APIs Incorporated`
<table>
    <tr>
        <th>API Name</th>
        <th>API Link</th>
    </tr>
    <tr>
        <td>
            <b>Alchemy</b>
        </td>
        <td>
            <a href="https://docs.alchemy.com/reference/api-overview">Alchemy Developer Docs</a>
        </td>
    </tr>
    <tr>
        <td>
            <b>Blocknative</b>
        </td>
        <td>
            <a href="https://www.blocknative.com/gas-platform">Blocknative Ethereum Gas APIs</a>
        </td>
    </tr>
    <tr>
        <td>
            <b>CoinGecko</b>
        </td>
        <td>
            <a href="https://www.coingecko.com/en/api">CoinGecko APIs</a>
        </td>
    </tr>
    <tr>
        <td>
            <b>Etherscan</b>
        </td>
        <td>
            <a href="https://etherscan.io/apis">Etherscan Developer Docs</a>
        </td>
    </tr>
    <tr>
        <td>
            <b>Moralis</b>
        </td>
        <td>
            <a href="https://moralis.io/">Moralis Enterprise Grade Web3 APIs</a>
        </td>
    </tr>
        <tr>
        <td>
            <b>Opensea</b>
        </td>
        <td>
            <a href="https://docs.opensea.io/reference/api-overview">Opensea Developer APIs</a>
        </td>
    </tr>
    <tr>
        <td>
            <b>Transpose</b>
        </td>
        <td>
            <a href="https://docs.transpose.io/">Transpose Data APIs</a>
        </td>
    </tr>
</table>

### `AWS Route 53`
**Domain was purchased using Namecheap and propagated through AWS Route 53 name servers.**
**Domain:** https://ethereumdashboard.dev/

### `AWS Amplify Front-end Deployment`.

The front-end of the application has been deployed to the cloud using AWS Amplify.

### `AWS Amplify Back-end Deployment`

The back-end application has been deployed to the cloud using AWS. The full stack application consists of a React front-end deployed using AWS Amplify and a Node back-end deployed to an AWS EC2 instance. Communication between the two applications is secure. AWS has complete features on security and reliability.

### `Start Here`

All available scripts run under the front-end folder of this repository. You must have Node installed on your computer and have access to the npm package manager which will allow you to download external libraries and also run, build, and test your react app.

For security reasons, many APIs that require Authorization, will be moved to the back-end and be made available for front-end usage via node server with connected routes. It is from these routes that API calls will be made to fetch information and send as responses to the front-end.

Therefore, it is required to have both the front-end and back-end servers running simultaneously on different ports for correct communication and function.

Running this project locally will require you to acquire separate API keys for running API requests to resources. These include various different sites such as CoinGecko, Etherscan, Moralis, and Alchemy. Dev's keys are hidden in this project under the .env file which was not committed to GitHub for security reasons. 

No API keys means failed requests to select API resources.

## `Dockerfile`
Attached within the server folders are Dockerfiles needed to Dockerize the servers and run as standalone containers. This will essentially, allow users to containerize the application by generating an image to represent the servers and run them as containers.
 
## `Scripts`
For basic project setup, scripts for each operating system (MAC/WINDOWS) have been provided as bash, powershell scripts respectively.

### `Links`

Below, is a list of links to the appropriate API resources used in this project.

[Alchemy](https://docs.alchemy.com/reference/)
<br />
[Blocknative](https://docs.blocknative.com/)
<br />
[CoinGecko](https://docs.coingecko.com/reference/introduction)
<br />
[Etherscan](https://etherscan.io/apis)
<br />
[Moralis](https://docs.moralis.io/)
<br />
[Opensea](https://docs.opensea.io/reference/api-overview)
<br />
[Transpose](https://docs.transpose.io/)

## Local/AWS Configuration

### Local
<p>Due to size and refactoring, the <b>LOCAL_DEV_ENV</b> directory has been removed. To run locally, ensure that React components make calls to the back-end server and point to <code>http://localhost:5000</code>.</p>

You'll also need to install all node modules and dependencies under the <code>package.json</code> file as the node_modules folder was not committed. This can be done with <code>npm install</code>. You'll also need to add the <code>.env</code> file in the back-end directory as it contains all the API keys for your back-end server.

### AWS
If you want to run this app in the cloud, you'll need to configure quite a few things before getting started. This app makes use of AWS Amplify and AWS EC2, services which are offered for free and allow for hosting and deploying front-end and back-end applications. These can be accessed in the AWS folder of this app.

#### AWS Amplify (Front-end)
The two main folders in this project, each represent a standalone app that can be deployed to an independent server. When deploying the front-end application, you'll need to create a local branch and copy over the front-end code. 

This can be done with the `git checkout <branch name>` command on your local terminal, followed by deletions of the back-end folder. Followed by the usual, `git add, git commit, git push` commands.

#### AWS EC2 (Back-end)
When configuring the back-end server on the cloud, a lot needs to be done to successfully create an EC2 instance, configure security groups, route traffic and add a SSL certificate. But that is just to configure the server, you'll need to deploy your node-express app and have it run as a background process in real-time to receive and respond to incoming API requests.

A link to spin up a virtual server on AWS can be found here: [AWS EC2](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/get-set-up-for-amazon-ec2.html).

#### AWS Lambda (Future Integration)
The back-end to this project will be transitioning to AWS Lambda soon. EC2, while provides great versatility, for the size of this project, Lambda will be more cost-efficient.