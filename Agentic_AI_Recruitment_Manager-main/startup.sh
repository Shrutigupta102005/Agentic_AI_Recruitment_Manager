#!/bin/bash

# Navigate to the backend directory
cd beckend

# Install dependencies (Azure does this automatically if requirements.txt is at root, 
# but since it's in a subfolder, we might need to be explicit or configure Azure to look here)
# pip install -r requirements.txt

# Start the Unified Backend using Gunicorn
# -w 4: 4 worker processes
# -b 0.0.0.0:8000: Bind to port 8000 (Azure expects this)
# unified_app:application: Module 'unified_app', object 'application'
gunicorn -w 4 -b 0.0.0.0:8000 unified_app:application
