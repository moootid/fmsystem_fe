#!/bin/bash
set -e # Exit immediately if a command fails

echo "Backend URL for build: $BACKEND_URL" 
echo "Frontend URL: $FRONTEND_URL"
echo "S3 Bucket: s3://$S3_WEB_BUCKET_NAME"
echo "S3 Prefix: $S3_PREFIX"
echo "Local Dir: $LOCAL_DIR"
echo "Distribution ID: $DISTRIBUTION_ID"
echo "Invalidation Path: $INVALIDATION_PATH"

# Validate required variables
if [ -z "$S3_WEB_BUCKET_NAME" ] || [ -z "$LOCAL_DIR" ] || [ -z "$DISTRIBUTION_ID" ] || [ -z "$INVALIDATION_PATH" ]; then
  echo "Error: Missing required environment variables (S3_WEB_BUCKET_NAME, LOCAL_DIR, DISTRIBUTION_ID, INVALIDATION_PATH)."
  exit 1
fi

# Construct full S3 path
# S3_PATH="s3://${S3_WEB_BUCKET_NAME}"
# if [ -n "$S3_PREFIX" ]; then
#   S3_PATH="${S3_PATH}/${S3_PREFIX}"
# fi

# Build the frontend (Ensure VITE_BACKEND_URL is set before this)
echo "Building frontend..."
echo "BACKEND_URL=$BACKEND_URL"
# Delete files from S3
echo "Deleting files from s3://$S3_WEB_BUCKET_NAME/$S3_PREFIX"
aws s3 rm s3://$S3_WEB_BUCKET_NAME/$S3_PREFIX --recursive
bunx vite build
# Upload new files to S3
echo "Uploading files from $LOCAL_DIR to s3://$S3_WEB_BUCKET_NAME/$S3_PREFIX"
aws s3 cp $LOCAL_DIR s3://$S3_WEB_BUCKET_NAME/$S3_PREFIX --recursive
# Create CloudFront invalidation
echo "Creating CloudFront invalidation"
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths $INVALIDATION_PATH

echo "Frontend deployment successful."
# No tail -f /dev/null, script exits here