# Ethereum-Wallet-Dashboard
A descriptive web app, detailing the history of all transactions including all different kinds of ERC transactions.
This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).


### `AWS Amplify Front-end Deployment`

The front-end application is deployed to **AWS Amplify.** The link to the front-end AWS deployment is here [AWS Amplify](https://aws.d3rwxneb2bnpjl.amplifyapp.com/).

Please note that more testing (front-end/back-end), security is required. As well as the back-end server needing to be deployed. This is just a PARTIAL preview.


### `AWS Amplify Back-end Deployment`

The back-end application is in the process of deployment using AWS. The full stack application will enable both components (front/back) to communicate with each other on the cloud. AWS has complete features on security and reliability.


### `Start Here`

All available scripts run under the front-end folder of this repository. You must have Node installed on your  computer and have access to the npm package manager which will allow you to download external libraries and also run, build, and test your react app.

For security reasons, many APIs that require Authorization, will be moved to the back-end and be made available for front-end usage via node server with connected routes. It is from these routes that API calls will be made to fetch information and send as responses to the front-end.

Therefore, this is now a full stack project and it is required to have both the front-end and back-end servers running simultaneously on different ports for correct communication and function.

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


## Local/AWS Configuration

### Local
If you want to run this app locally, the LOCAL_DEV_ENV folder is the repo for that. You'll need to assign two ports (3000 and 5000, by default) for front-end/back-end servers respectively. 

You'll also need to install all the node modules and dependencies under the `package.json` file as the node_modules folder was not committed. This can be done with `npm install`. You'll also need to add the `.env` file under the back-end folder as it contains all the API keys for your back-end server.

### AWS
If you want to run this app on the cloud, you'll need to configure quite a few things before getting started. This app makes use of AWS Amplify and AWS EC2 services which are offered for free and allow for hosting and deploying front-end and back-end applications. These can be accessed under the AWS folder of this app.

#### AWS Amplify (Front-end)
The two main folders in this project, each represent a standalone app that can be deployed to an independent server. When deploying the front-end application, you'll need to create a local branch and copy over the front-end code. 

This can be done with the `git checkout <branch name>` command on your local terminal, followed by deletions of the back-end folder. Followed by the usual, `git add, git commit, git push` commands.


#### AWS EC2 (Back-end)
When configuring the back-end server on the cloud, a lot needs to be done to successfully create an EC2 instance, configure security groups, route traffic and add a SSL certificate. But that is just to configure the server, you'll need to deploy your node-express app and have it run as a background process in real-time to receive and respond to incoming API requests.

A link to spin up a virtual server on AWS can be found here: [AWS EC2](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/get-set-up-for-amazon-ec2.html).

Instructions on how to install node on a virtual server, retrieve code from a github repo, and run the node server on EC2 are found below.

Note that AWS EC2 Ubuntu was used to configure the server (using the free-tier one provided by Amazon).

<img src="/AWS/aws-amplify/src/assets/images/ubuntu.png" height='500px' width='1000px' alt="Alt text" title="Ubuntu setup">

## 1. Install Node/NPM
```
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -

sudo apt install nodejs

node --version
```

## 2. Clone your project from Github
There are a few ways to get your files on to the server, I would suggest using Git
```
git clone https://github.com/CodingAbdullah/Ethereum-Wallet-Dashboard.git
```

## 3. Install dependencies and test app
```
cd AWS
cd aws-ec2
npm install
npm start (or whatever your start command)
# stop app
ctrl+C
```
## 4. Setup PM2 process manager to keep your app running
```
sudo npm i pm2 -g
pm2 start app (or whatever your file name)

# Other pm2 commands
pm2 show app
pm2 status
pm2 restart app
pm2 stop app
pm2 logs (Show log stream)
pm2 flush (Clear logs)

# To make sure app starts when reboot
pm2 startup ubuntu
```
You should now be able to access your app using your IP and port. Now we want to setup a firewall blocking that port and setup NGINX as a reverse proxy so we can access it directly using port 80 (http)

## 5. Setup ufw firewall
```
sudo ufw enable
sudo ufw status
sudo ufw allow ssh (Port 22)
sudo ufw allow http (Port 80)
sudo ufw allow https (Port 443)
```

## 6. Install NGINX and configure
```
sudo apt install nginx

sudo nano /etc/nginx/sites-available/default
```
Add the following to the location part of the server block
```
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000; #whatever port your app runs on
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
```
```
# Check NGINX config
sudo nginx -t

# Restart NGINX
sudo service nginx restart
```

### You should now be able to visit your IP with no port (port 80) and see your app. Now let's add a domain

## 7. Add SSL with LetsEncrypt
```
sudo add-apt-repository ppa:certbot/certbot
sudo apt-get update
sudo apt-get install python-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Only valid for 90 days, test the renewal process with
certbot renew --dry-run
```

Now visit https://yourdomain.com and you should see your Node app

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