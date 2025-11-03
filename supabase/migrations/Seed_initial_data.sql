/*
  # Seed Emergency Organizations and Tutorials

  1. Pre-load Kenyan emergency services
  2. Pre-load first aid tutorials by category
*/

INSERT INTO public.emergency_organizations (name, type, phone, location, website)
VALUES
  ('Kenyatta National Hospital', 'Hospital', '+254-20-2726300', 'Hospital Road, Nairobi', 'https://www.knh.or.ke'),
  ('Nairobi Hospital', 'Hospital', '+254-20-8000000', 'Argwings Kodhek Road, Nairobi', 'https://nairobihospital.org'),
  ('Kenya Red Cross Society', 'Emergency Services', '+254-20-6699000', 'Nairobi', 'https://www.kenyaredcross.org'),
  ('AMREF Flying Doctors', 'Air Ambulance', '+254-41-232566', 'Wilson Airport, Nairobi', 'https://www.amref.org'),
  ('St. John Ambulance', 'Emergency Services', '+254-20-2823688', 'Nairobi', 'https://www.stjohnkenya.org');

INSERT INTO public.tutorials (title, description, video_url, category, thumbnail)
VALUES
  ('CPR for Adults', 'Step-by-step cardiopulmonary resuscitation for unresponsive adults', 'https://youtu.be/ea1RJUOiNfQ', 'CPR', 'https://images.pexels.com/photos/7974/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=400'),
  ('CPR for Infants', 'How to perform CPR on infants and young children', 'https://youtu.be/example', 'CPR', 'https://images.pexels.com/photos/8936/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=400'),
  ('Heimlich Maneuver', 'Complete guide to treating choking victims', 'https://youtu.be/example', 'Choking', 'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=400'),
  ('Stop Severe Bleeding', 'Control heavy bleeding with tourniquets and pressure', 'https://youtu.be/example', 'Bleeding', 'https://images.pexels.com/photos/7651/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=400'),
  ('Treating Burns', 'First aid for minor and severe burns', 'https://youtu.be/example', 'Burns', 'https://images.pexels.com/photos/4624391/pexels-photo-4624391.jpeg?auto=compress&cs=tinysrgb&w=400'),
  ('Snake Bite Response', 'Emergency response for snake bites in Africa', 'https://youtu.be/example', 'Snake Bite', 'https://images.pexels.com/photos/209037/pexels-photo-209037.jpeg?auto=compress&cs=tinysrgb&w=400'),
  ('Recovery Position', 'Place unresponsive person in recovery position', 'https://youtu.be/example', 'CPR', 'https://images.pexels.com/photos/2682305/pexels-photo-2682305.jpeg?auto=compress&cs=tinysrgb&w=400');
