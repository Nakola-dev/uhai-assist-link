/*
  # UhaiLink – Seed Data
  Organizations and Tutorials
*/

INSERT INTO public.emergency_organizations (name, type, phone, location, website)
VALUES
  ('Kenyatta National Hospital', 'Hospital', '+254-20-2726300', 'Hospital Road, Nairobi', 'https://knh.or.ke'),
  ('Nairobi Hospital', 'Hospital', '+254-20-2845000', 'Argwings Kodhek Rd, Nairobi', 'https://nbi-hospital.or.ke'),
  ('Aga Khan University Hospital', 'Hospital', '+254-20-3662000', 'Third Parklands Ave, Nairobi', 'https://aku.edu'),
  ('Kenya Red Cross', 'Emergency Services', '1199', 'South C, Nairobi', 'https://redcross.or.ke'),
  ('AMREF Flying Doctors', 'Air Ambulance', '+254-20-6993000', 'Wilson Airport, Nairobi', 'https://flydoc.org')
ON CONFLICT DO NOTHING;

INSERT INTO public.tutorials (title, description, video_url, category, thumbnail)
VALUES
  ('CPR for Adults', 'Step-by-step adult CPR', 'https://www.youtube.com/watch?v=7A7e9KqjOKU', 'CPR', 'https://img.youtube.com/vi/7A7e9KqjOKU/maxresdefault.jpg'),
  ('CPR for Infants', 'CPR for babies under 1 year', 'https://www.youtube.com/watch?v=example-infant', 'CPR', 'https://img.youtube.com/vi/example-infant/maxresdefault.jpg'),
  ('Heimlich Maneuver', 'Clear a choking airway', 'https://www.youtube.com/watch?v=zp4YTjL0CvM', 'Choking', 'https://img.youtube.com/vi/zp4YTjL0CvM/maxresdefault.jpg'),
  ('Stop Severe Bleeding', 'Apply pressure and tourniquet', 'https://www.youtube.com/watch?v=I1jSKhHrME8', 'Bleeding', 'https://img.youtube.com/vi/I1jSKhHrME8/maxresdefault.jpg'),
  ('Burns First Aid', 'Cool and cover burns', 'https://www.youtube.com/watch?v=HRa0YvWvvvg', 'Burns', 'https://img.youtube.com/vi/HRa0YvWvvvg/maxresdefault.jpg'),
  ('Snake Bite Response', 'First 5 minutes are critical', 'https://www.youtube.com/watch?v=NcP6Zs72u8k', 'Snake Bite', 'https://img.youtube.com/vi/NcP6Zs72u8k/maxresdefault.jpg'),
  ('Recovery Position', 'Safe position for unconscious person', 'https://www.youtube.com/watch?v=example-recovery', 'CPR', 'https://img.youtube.com/vi/example-recovery/maxresdefault.jpg')
ON CONFLICT DO NOTHING;
