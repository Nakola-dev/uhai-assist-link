/*
  # Seed Emergency Organizations and First Aid Tutorials

  1. Emergency Organizations
    - Major Kenyan hospitals (Kenyatta National Hospital, Nairobi Hospital)
    - Emergency services (Kenya Red Cross, AMREF, St. John Ambulance)
    - Contact information and websites for quick access

  2. First Aid Tutorials
    - CPR for adults and infants
    - Choking (Heimlich maneuver)
    - Severe bleeding control
    - Burn treatment
    - Snake bite response
    - Recovery position
    - All with video links and thumbnail images from Pexels
*/

INSERT INTO public.emergency_organizations (name, type, phone, location, website) 
VALUES 
  ('Kenyatta National Hospital', 'Hospital', '+254-20-2726300', 'Hospital Road, Nairobi', 'https://www.knh.or.ke'),
  ('Nairobi Hospital', 'Hospital', '+254-20-8000000', 'Argwings Kodhek Road, Nairobi', 'https://nairobihospital.org'),
  ('Kenya Red Cross Society', 'Emergency Services', '+254-20-6699000', 'Nairobi', 'https://www.kenyaredcross.org'),
  ('AMREF Flying Doctors', 'Air Ambulance', '+254-41-232566', 'Wilson Airport, Nairobi', 'https://www.amref.org'),
  ('St. John Ambulance', 'Emergency Services', '+254-20-2823688', 'Nairobi', 'https://www.stjohnkenya.org')
ON CONFLICT DO NOTHING;

INSERT INTO public.tutorials (title, description, video_url, category, thumbnail)
VALUES 
  ('CPR for Adults', 'Step-by-step cardiopulmonary resuscitation technique for unresponsive adults with proper hand placement and compression rate', 'https://youtu.be/ea1RJUOiNfQ', 'CPR', 'https://images.pexels.com/photos/7974/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=400'),
  ('CPR for Infants', 'How to perform CPR on infants and young children using proper pressure and technique', 'https://youtu.be/example', 'CPR', 'https://images.pexels.com/photos/8936/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=400'),
  ('Heimlich Maneuver', 'Complete guide to the Heimlich maneuver for choking victims - when and how to perform it', 'https://youtu.be/example', 'Choking', 'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=400'),
  ('Stop Severe Bleeding', 'How to control and stop heavy bleeding using tourniquets, pressure bandages, and elevation', 'https://youtu.be/example', 'Bleeding', 'https://images.pexels.com/photos/7651/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=400'),
  ('Treating Burns', 'First aid treatment for minor and severe burns - cooling, covering, and when to seek emergency care', 'https://youtu.be/example', 'Burns', 'https://images.pexels.com/photos/4624391/pexels-photo-4624391.jpeg?auto=compress&cs=tinysrgb&w=400'),
  ('Snake Bite Response', 'Emergency response and first aid for snake bites in Africa - identification, immobilization, and evacuation', 'https://youtu.be/example', 'Snake Bite', 'https://images.pexels.com/photos/209037/pexels-photo-209037.jpeg?auto=compress&cs=tinysrgb&w=400'),
  ('Recovery Position', 'How to place an unresponsive person in the recovery position to maintain airway and breathing', 'https://youtu.be/example', 'CPR', 'https://images.pexels.com/photos/2682305/pexels-photo-2682305.jpeg?auto=compress&cs=tinysrgb&w=400')
ON CONFLICT DO NOTHING;
