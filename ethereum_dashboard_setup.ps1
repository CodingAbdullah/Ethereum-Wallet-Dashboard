# Make sure you have Node and Git installed on your machine
# This script is for POWERSHELL (Windows only), you will need to run this on a Windows machine
# To run this script, run the command in the Windows command prompt below with the name of your laptop as part of the command parameter
# ---> .\ethereum_dashboard_setup.ps1 <laptop name>

# Access the laptop name passed in as an argument
$NAME = $args[0]
Set-Location "C:\Users\$NAME\Desktop"  # Navigating to the Desktop directory of the user

# Build as you like, change the name of the folder to that which you desire
Write-Host 'Setting up local development directory on Desktop...'
New-Item -ItemType Directory -Name 'ETH_DASHBOARD'

Set-Location 'ETH_DASHBOARD'

# Initialize git on the empty repo
git init

# Setting up the Next.js web application
Write-Host 'Setting up and Installing Next.js'
npx create-next-app@latest .

# Install the necessary NPM packages
npm install ai api dayjs lucide-react react react-dom react-hook-form recharts swr zod

# Install npm packages for frontend apps
npm install axios popper.js react-router react-router-dom redux redux-thunk validator

# Add the .env file to the .gitignore file
Add-Content -Path '.gitignore' -Value '# Hiding environment variables'
Add-Content -Path '.gitignore' -Value '.env'

# Adding the .env file here for storing API keys
New-Item -ItemType File -Name '.env'
Add-Content -Path '.env' -Value '# Add your API keys, secrets here'

Write-Host 'Project setup is complete'