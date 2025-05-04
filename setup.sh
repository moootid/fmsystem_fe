#!/bin/bash
set -e # Exit immediately if a command fails

echo "Backend URL for build: $BACKEND_URL" # Note: Renamed to VITE_ for Vite build process
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
S3_PATH="s3://${S3_WEB_BUCKET_NAME}"
if [ -n "$S3_PREFIX" ]; then
  S3_PATH="${S3_PATH}/${S3_PREFIX}"
fi

# Build the frontend (Ensure VITE_BACKEND_URL is set before this)
echo "Building frontend..."
# The build should happen *before* syncing if LOCAL_DIR points to the build output (e.g., 'dist')
bunx vite build # Moved this potentially to CI/CD step *before* running this script
# Delete files from S3
echo "Deleting files from $S3_PATH"
# Use --delete flag with sync for efficiency, or rm if preferred
# aws s3 rm "$S3_PATH" --recursive
aws s3 sync --delete $LOCAL_DIR "$S3_PATH" # More efficient: syncs differences and deletes extras


# Upload new files to S3
echo "Uploading files from $LOCAL_DIR to $S3_PATH"
# aws s3 cp $LOCAL_DIR "$S3_PATH" --recursive # sync command already handled upload

# Create CloudFront invalidation
echo "Creating CloudFront invalidation for path: $INVALIDATION_PATH"
aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" --paths "$INVALIDATION_PATH"

echo "Frontend deployment successful."
# No tail -f /dev/null, script exits here