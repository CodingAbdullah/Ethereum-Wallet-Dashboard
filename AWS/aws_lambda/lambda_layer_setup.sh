#!/bin/bash

# Adding a script for installing dependencies
# Zipp the layer directory

mkdir lambda_layer
cd lambda_layer

npm install axios day.js

cd ..

zip -r lambda_layer.zip lambda_layer