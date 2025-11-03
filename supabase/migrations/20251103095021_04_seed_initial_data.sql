/*
  # UhaiLink Schema - Part 4: Seed Data
  
  Populates initial data:
  - 5 Kenyan emergency organizations (hospitals and services)
  - 7 first aid tutorial videos across categories
*/

-- ========================================
-- 1. SEED EMERGENCY ORGANIZATIONS
-- ========================================
INSERT INTO public.emergency_organizations (name, type, phone, location, website)
VALUES
  ('Kenyatta National Hospital', 'Hospital', '+254-20-2726300', 'Hospital Road, Nairobi', 'https://knh.or.ke'),
  ('Nairobi Hospital', 'Hospital', '+254-20-2845000', 'Argwings Kodhek Road, Nairobi', 'https://nbi-hospital.or.ke'),
  ('Aga Khan University Hospital', 'Hospital', '+254-20-3662000', 'Third Parklands Avenue, Nairobi', 'https://aku.edu'),
  ('Kenya Red Cross', 'Emergency Services', '1199', 'South C, Red Cross Road, Nairobi', 'https://redcross.or.ke'),
  ('AMREF Flying Doctors', 'Air Ambulance', '+254-20-6993000', 'Wilson Airport, Nairobi', 'https://flydoc.org')
ON CONFLICT DO NOTHING;

-- ========================================
-- 2. SEED FIRST AID TUTORIALS
-- ========================================
INSERT INTO public.tutorials (title, description, video_url, category, thumbnail)
VALUES
  (
    'CPR - Cardiopulmonary Resuscitation',
    'Learn how to perform CPR to save a life during cardiac arrest',
    'https://www.youtube.com/watch?v=7A7e9KqjOKU',
    'CPR',
    'https://img.youtube.com/vi/7A7e9KqjOKU/maxresdefault.jpg'
  ),
  (
    'How to Help a Choking Person',
    'Step-by-step guide to the Heimlich maneuver for choking victims',
    'https://www.youtube.com/watch?v=zp4YTjL0CvM',
    'Choking',
    'https://img.youtube.com/vi/zp4YTjL0CvM/maxresdefault.jpg'
  ),
  (
    'First Aid for Burns',
    'Immediate treatment for burn injuries',
    'https://www.youtube.com/watch?v=HRa0YvWvvvg',
    'Burns',
    'https://img.youtube.com/vi/HRa0YvWvvvg/maxresdefault.jpg'
  ),
  (
    'Treating Severe Bleeding',
    'How to stop heavy bleeding and apply pressure',
    'https://www.youtube.com/watch?v=I1jSKhHrME8',
    'Bleeding',
    'https://img.youtube.com/vi/I1jSKhHrME8/maxresdefault.jpg'
  ),
  (
    'How to Treat a Snake Bite',
    'Essential first aid steps for snake bite emergencies',
    'https://www.youtube.com/watch?v=NcP6Zs72u8k',
    'Snake Bite',
    'https://img.youtube.com/vi/NcP6Zs72u8k/maxresdefault.jpg'
  )
ON CONFLICT DO NOTHING;