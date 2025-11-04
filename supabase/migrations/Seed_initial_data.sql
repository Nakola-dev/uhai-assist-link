/*
  # UhaiLink – Initial Seed Data
  Purpose: Pre-populate public resources on fresh deployment
  Tables:
    - emergency_organizations: 5 Kenyan hospitals & emergency services
    - tutorials: 7 first-aid video tutorials
  Run once after schema migration.
  Uses ON CONFLICT DO NOTHING → safe to re-run.
*/

--------------------------------------------------------------------
-- 1. EMERGENCY ORGANIZATIONS (Kenyan Services)
--------------------------------------------------------------------
INSERT INTO public.emergency_organizations (name, type, phone, location, website)
VALUES
  ('Kenyatta National Hospital', 'Hospital', '+254-20-2726300', 'Hospital Road, Nairobi', 'https://knh.or.ke'),
  ('Nairobi Hospital', 'Hospital', '+254-20-2845000', 'Argwings Kodhek Rd, Nairobi', 'https://nbi-hospital.or.ke'),
  ('Aga Khan University Hospital', 'Hospital', '+254-20-3662000', 'Third Parklands Ave, Nairobi', 'https://aku.edu'),
  ('Kenya Red Cross', 'Emergency Services', '1199', 'South C, Nairobi', 'https://redcross.or.ke'),
  ('AMREF Flying Doctors', 'Air Ambulance', '+254-20-6993000', 'Wilson Airport, Nairobi', 'https://flydoc.org')
ON CONFLICT DO NOTHING;

--------------------------------------------------------------------
-- 2. FIRST-AID TUTORIALS (7 Videos)
--------------------------------------------------------------------
INSERT INTO public.tutorials (title, description, video_url, category, thumbnail)
VALUES
  ('CPR for Adults', 'Step-by-step CPR for conscious and unconscious adults', 'https://www.youtube.com/watch?v=7A7e9KqjOKU', 'CPR', 'https://img.youtube.com/vi/7A7e9KqjOKU/maxresdefault.jpg'),
  ('CPR for Infants', 'CPR technique for babies under 1 year old', 'https://www.youtube.com/watch?v=example-infant', 'CPR', 'https://img.youtube.com/vi/example-infant/maxresdefault.jpg'),
  ('Heimlich Maneuver', 'How to clear a choking airway in adults and children', 'https://www.youtube.com/watch?v=zp4YTjL0CvM', 'Choking', 'https://img.youtube.com/vi/zp4YTjL0CvM/maxresdefault.jpg'),
  ('Stop Severe Bleeding', 'How to apply pressure and use a tourniquet', 'https://www.youtube.com/watch?v=I1jSKhHrME8', 'Bleeding', 'https://img.youtube.com/vi/I1jSKhHrME8/maxresdefault.jpg'),
  ('Burns First Aid', 'Cool, cover, and when to seek medical help', 'https://www.youtube.com/watch?v=HRa0YvWvvvg', 'Burns', 'https://img.youtube.com/vi/HRa0YvWvvvg/maxresdefault.jpg'),
  ('Snake Bite Response', 'Critical first 5 minutes after a snake bite', 'https://www.youtube.com/watch?v=NcP6Zs72u8k', 'Snake Bite', 'https://img.youtube.com/vi/NcP6Zs72u8k/maxresdefault.jpg'),
  ('Recovery Position', 'How to safely position an unconscious breathing person', 'https://www.youtube.com/watch?v=example-recovery', 'CPR', 'https://img.youtube.com/vi/example-recovery/maxresdefault.jpg')
ON CONFLICT DO NOTHING;

--------------------------------------------------------------------
-- END OF SEED
--------------------------------------------------------------------