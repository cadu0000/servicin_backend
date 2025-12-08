-- Create function to calculate service rating
CREATE OR REPLACE FUNCTION calculate_service_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE "services"
  SET "rating" = (
    SELECT COALESCE(AVG(rating), 0.00)
    FROM "review"
    WHERE "service_id" = COALESCE(NEW."service_id", OLD."service_id")
  )
  WHERE "id" = COALESCE(NEW."service_id", OLD."service_id");
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create function to calculate provider rating
CREATE OR REPLACE FUNCTION calculate_provider_rating()
RETURNS TRIGGER AS $$
DECLARE
  provider_user_id UUID;
BEGIN
  -- Get providerId from the service
  SELECT s."providerId" INTO provider_user_id
  FROM "services" s
  WHERE s."id" = COALESCE(NEW."service_id", OLD."service_id");
  
  -- Update provider rating
  UPDATE "service_providers"
  SET "average_rating" = (
    SELECT COALESCE(AVG(r.rating), 0.00)
    FROM "review" r
    INNER JOIN "services" s ON s."id" = r."service_id"
    WHERE s."providerId" = provider_user_id
  )
  WHERE "user_id" = provider_user_id;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for service rating (on INSERT, UPDATE, DELETE)
CREATE TRIGGER update_service_rating_on_review_change
AFTER INSERT OR UPDATE OR DELETE ON "review"
FOR EACH ROW
EXECUTE FUNCTION calculate_service_rating();

-- Create trigger for provider rating (on INSERT, UPDATE, DELETE)
CREATE TRIGGER update_provider_rating_on_review_change
AFTER INSERT OR UPDATE OR DELETE ON "review"
FOR EACH ROW
EXECUTE FUNCTION calculate_provider_rating();

-- Recalculate all ratings for existing data
UPDATE "services" s
SET "rating" = (
  SELECT COALESCE(AVG(rating), 0.00)
  FROM "review"
  WHERE "service_id" = s."id"
);

UPDATE "service_providers" sp
SET "average_rating" = (
  SELECT COALESCE(AVG(r.rating), 0.00)
  FROM "review" r
  INNER JOIN "services" s ON s."id" = r."service_id"
  WHERE s."providerId" = sp."user_id"
);
