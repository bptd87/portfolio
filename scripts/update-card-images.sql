-- Update card_image to use cover_image for all projects where card_image is null
-- This ensures all portfolio cards display images

UPDATE portfolio_projects
SET card_image = cover_image
WHERE card_image IS NULL AND cover_image IS NOT NULL;

-- Verify the update
SELECT id, title, card_image, cover_image
FROM portfolio_projects
ORDER BY year DESC;
