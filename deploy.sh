#!/bin/bash
# ── CommunityLink — Deploy to Google Cloud Run ─────────────────
# Prerequisites:
#   - gcloud CLI installed and authenticated
#   - Docker installed
#   - .env file configured

set -e

PROJECT_ID=${GOOGLE_CLOUD_PROJECT:-"your-project-id"}
REGION=${REGION:-"asia-south1"}
SERVICE_NAME="communitylink"
IMAGE="gcr.io/$PROJECT_ID/$SERVICE_NAME"

echo "🚀 Deploying CommunityLink to Cloud Run..."
echo "   Project: $PROJECT_ID"
echo "   Region:  $REGION"
echo "   Image:   $IMAGE"

# Build Docker image
echo ""
echo "📦 Building Docker image..."
docker build -t $IMAGE .

# Push to Google Container Registry
echo ""
echo "⬆️  Pushing image to GCR..."
docker push $IMAGE

# Deploy to Cloud Run
echo ""
echo "☁️  Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
    --image $IMAGE \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --port 8080 \
    --memory 512Mi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 10 \
    --set-env-vars "GOOGLE_CLOUD_PROJECT=$PROJECT_ID,GEMINI_API_KEY=$GEMINI_API_KEY" \
    --project $PROJECT_ID

echo ""
echo "✅ Deployment complete!"
echo "   URL: $(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')"
