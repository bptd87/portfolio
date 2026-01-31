#!/bin/bash
ARTICLE_URL="http://localhost:3002/articles/building-the-visual-world-art-direction-in-film-television"

echo "Fetching Article Page..."
curl -s "$ARTICLE_URL" > page_output.html

echo "Extracting Hero Image URL..."
HERO_SRC=$(grep -o '/_next/image?url=[^"]*' page_output.html | head -n 1 | sed 's/&amp;/\&/g')

if [ -z "$HERO_SRC" ]; then
  echo "❌ Hero Image NOT found in HTML!"
else
  echo "✅ Hero Image Found: $HERO_SRC"
  FULL_HERO_URL="http://localhost:3002$HERO_SRC"
  echo "Checking Hero Image Status..."
  STATUS=$(curl -o /dev/null -s -w "%{http_code}\n" "$FULL_HERO_URL")
  if [ "$STATUS" == "200" ]; then
    echo "✅ Hero Image Loaded Successfully (200 OK)"
  else
    echo "❌ Hero Image Failed with Status: $STATUS"
  fi
fi

echo "Checking Content Images (Direct Cloudinary)..."
CONTENT_IMG_COUNT=$(grep -o 'src="https://res.cloudinary.com' page_output.html | wc -l)
if [ "$CONTENT_IMG_COUNT" -gt 0 ]; then
    echo "✅ Found $CONTENT_IMG_COUNT direct Cloudinary content images."
else
    echo "❌ No direct Cloudinary content images found."
fi
