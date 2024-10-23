# Create a directory for the lambda layer
New-Item -ItemType Directory -Name "lambda_layer"

# Navigate into the directory
Set-Location -Path "lambda_layer"

# Install the dependencies
npm install axios day.js

# Navigate back to the parent directory
Set-Location -Path ..

# Zip the lambda layer directory
Compress-Archive -Path "lambda_layer/*" -DestinationPath "lambda_layer.zip"
