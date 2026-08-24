-- ============================================================================
-- Lead & Grow — reference data seed
-- Safe to re-run: uses ON CONFLICT DO NOTHING / UPDATE on natural keys.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 12 LEADERSHIP PARAMETERS
-- ----------------------------------------------------------------------------
insert into public.parameters (key, name, description, icon, sort_order) values
  ('self_awareness',        'Self-awareness',        'Understanding your own emotions, values and impact on others.', 'user',        1),
  ('communication',         'Communication',         'Expressing ideas clearly and listening actively.',              'message-circle', 2),
  ('emotional_intelligence','Emotional intelligence','Recognizing and managing emotion in yourself and others.',      'heart',       3),
  ('decision_making',       'Decision-making',       'Making sound, timely calls under uncertainty.',                 'scale',       4),
  ('influence',             'Influence',              'Inspiring action and buy-in without authority.',                'star',        5),
  ('adaptability',          'Adaptability',           'Adjusting approach as circumstances change.',                   'refresh-cw',  6),
  ('teamwork',              'Teamwork',               'Collaborating effectively toward shared goals.',                'users',       7),
  ('discipline',            'Discipline',             'Consistent follow-through on commitments.',                     'target',      8),
  ('confidence',            'Confidence',             'Acting with conviction while staying open to feedback.',        'shield',      9),
  ('vision_purpose',        'Vision & purpose',       'Anchoring decisions in a clear long-term direction.',           'eye',         10),
  ('stress_management',     'Stress management',      'Staying steady and clear-headed under pressure.',               'flower',      11),
  ('consistency',           'Consistency',            'Reliability of behavior and standards over time.',              'check-circle',12)
on conflict (key) do update set
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  sort_order = excluded.sort_order;

-- ----------------------------------------------------------------------------
-- 36 ASSESSMENT QUESTIONS (3 per parameter, 5-point Likert)
-- ----------------------------------------------------------------------------
with q(param_key, prompt, sort_order) as (
  values
    ('self_awareness', 'I understand how my emotions affect my decisions.', 1),
    ('self_awareness', 'I can accurately describe my strengths and weaknesses.', 2),
    ('self_awareness', 'I notice how my behavior affects the people around me.', 3),

    ('communication', 'I express my ideas clearly and listen actively to others.', 1),
    ('communication', 'People rarely misunderstand what I am trying to say.', 2),
    ('communication', 'I adjust how I communicate depending on my audience.', 3),

    ('emotional_intelligence', 'I stay calm and composed when others are upset.', 1),
    ('emotional_intelligence', 'I can sense how someone is feeling before they say it.', 2),
    ('emotional_intelligence', 'I respond thoughtfully rather than react impulsively.', 3),

    ('decision_making', 'I make sound decisions even with incomplete information.', 1),
    ('decision_making', 'I weigh trade-offs before committing to a course of action.', 2),
    ('decision_making', 'I take responsibility for the outcomes of my decisions.', 3),

    ('influence', 'I can get others on board with my ideas without formal authority.', 1),
    ('influence', 'People seek out my opinion before making decisions.', 2),
    ('influence', 'I build trust quickly with new people.', 3),

    ('adaptability', 'I adjust quickly when plans or priorities change.', 1),
    ('adaptability', 'I stay effective in ambiguous or unfamiliar situations.', 2),
    ('adaptability', 'I welcome new approaches instead of defaulting to habit.', 3),

    ('teamwork', 'I actively support my teammates'' success, not just my own.', 1),
    ('teamwork', 'I contribute constructively in group discussions.', 2),
    ('teamwork', 'I give credit to others for shared wins.', 3),

    ('discipline', 'I follow through on commitments even when motivation dips.', 1),
    ('discipline', 'I keep consistent daily habits that support my goals.', 2),
    ('discipline', 'I finish what I start.', 3),

    ('confidence', 'I voice my perspective even when it differs from the group.', 1),
    ('confidence', 'I recover quickly from setbacks or criticism.', 2),
    ('confidence', 'I trust my judgment in high-pressure moments.', 3),

    ('vision_purpose', 'I have a clear sense of the long-term impact I want to have.', 1),
    ('vision_purpose', 'My daily actions connect to a bigger purpose.', 2),
    ('vision_purpose', 'I can articulate a compelling vision to others.', 3),

    ('stress_management', 'I stay clear-headed when things get stressful.', 1),
    ('stress_management', 'I have reliable ways to reset when I feel overwhelmed.', 2),
    ('stress_management', 'Stress rarely affects the quality of my decisions.', 3),

    ('consistency', 'My behavior and standards stay steady over time.', 1),
    ('consistency', 'People know what to expect from me.', 2),
    ('consistency', 'I show up the same way on hard days as on easy ones.', 3)
)
insert into public.questions (parameter_id, prompt, sort_order)
select p.id, q.prompt, q.sort_order
from q
join public.parameters p on p.key = q.param_key
where not exists (
  select 1 from public.questions ex where ex.parameter_id = p.id and ex.prompt = q.prompt
);

-- ----------------------------------------------------------------------------
-- 5 LEADERSHIP DEVELOPMENT STAGES
-- ----------------------------------------------------------------------------
insert into public.leadership_stages (id, key, name, description, min_score, sort_order) values
  (1, 'awareness',           'Awareness',            'Understand yourself.',                       0,  1),
  (2, 'foundation',          'Rising Leader',         'Build habits and lead with confidence.',      40, 2),
  (3, 'practice',            'Practice Leader',       'Apply skills & create impact.',               60, 3),
  (4, 'influence',           'Influential Leader',    'Inspire & lead others.',                      75, 4),
  (5, 'visionary_leadership','Visionary Leader',      'Lead with purpose & leave a legacy.',          90, 5)
on conflict (id) do update set
  key = excluded.key, name = excluded.name, description = excluded.description,
  min_score = excluded.min_score, sort_order = excluded.sort_order;

-- ----------------------------------------------------------------------------
-- ACHIEVEMENTS
-- ----------------------------------------------------------------------------
insert into public.achievements (key, title, description, icon, sort_order) values
  ('seven_day_streak',   '7 Day Streak',              'Practiced 7 days in a row.',                'flame',   1),
  ('first_assessment',   'First Assessment Completed','Completed your first leadership assessment.','clipboard',2),
  ('ten_practices',      '10 Practices Completed',    'Completed 10 daily practices.',             'timer',   3),
  ('reflection_master',  'Reflection Master',         'Logged 5 reflections.',                     'book-open',4),
  ('rising_leader',      'Rising Leader',             'Reached Stage 2: Rising Leader.',            'trophy',  5)
on conflict (key) do update set
  title = excluded.title, description = excluded.description, icon = excluded.icon, sort_order = excluded.sort_order;

-- ----------------------------------------------------------------------------
-- CONTENT LIBRARY — sample items across all learning categories & practice stages
-- ----------------------------------------------------------------------------
with c(title, category, practice_stage, description, video_url, duration_minutes, param_key, min_score, max_score, sort_order) as (
  values
    ('Breathing & Mindfulness',        'MENTAL_RESET',            'reset',    'Calm your mind and center your attention before you begin.', null, 3, null, 0, 100, 1),
    ('Grounding Body Scan',            'MEDITATION',               'reset',    'A short body scan to arrive fully present.',                   null, 3, null, 0, 100, 2),
    ('Sunrise Breathwork',             'BREATHWORK',               'reset',    'A energizing breath pattern to clear mental noise.',           null, 3, null, 0, 100, 3),

    ('The Art of Effective Communication', 'COMMUNICATION',        'learn',    'Learn how to express your ideas clearly and build stronger connections.', null, 5, 'communication', 0, 70, 1),
    ('Leading with Emotional Intelligence','EMOTIONAL_INTELLIGENCE','learn',   'Recognize emotional patterns in yourself and your team.', null, 5, 'emotional_intelligence', 0, 70, 2),
    ('Deciding Under Pressure',         'LEADERSHIP',               'learn',    'A framework for sound decisions with incomplete information.', null, 5, 'decision_making', 0, 70, 3),
    ('The Confident Leader',            'LEADERSHIP',               'learn',    'Building conviction without losing openness to feedback.',     null, 5, 'confidence', 0, 70, 4),
    ('Vedic Wisdom: The Witness Mind',  'VEDIC_WISDOM',             'learn',    'A traditional reflective practice for observing thought without judgment (optional, non-religious framing).', null, 5, 'self_awareness', 0, 70, 5),

    ('Active Listening Exercise',       'COMMUNICATION',            'practice', 'Practice active listening in a real conversation. Listen fully without interrupting.', null, 5, 'communication', 0, 70, 1),
    ('Influence Without Authority',     'LEADERSHIP',               'practice', 'A short role-play exercise to practice persuasive, trust-building conversation.', null, 5, 'influence', 0, 70, 2),
    ('Stress Reset Protocol',           'STRESS_MANAGEMENT',        'practice', 'A 5-minute technique to regain composure under pressure.',     null, 5, 'stress_management', 0, 70, 3),
    ('Team Check-in Practice',          'LEADERSHIP',               'practice', 'A structured way to check in with a teammate and build trust.', null, 5, 'teamwork', 0, 70, 4),

    ('Reflect & Journal',               'SELF_AWARENESS',           'reflect',  'Reflect on your learning and write your insights.',            null, 2, null, 0, 100, 1),
    ('Vedic-Inspired Self-Inquiry',      'VEDIC_WISDOM',             'reflect',  'Three traditional reflective questions to close your practice (optional).', null, 2, null, 0, 100, 2)
)
insert into public.content_items (title, category, practice_stage, description, video_url, duration_minutes, target_parameter_id, min_score, max_score, sort_order)
select c.title, c.category, c.practice_stage, c.description, c.video_url, c.duration_minutes,
       (select p.id from public.parameters p where p.key = c.param_key),
       c.min_score, c.max_score, c.sort_order
from c
where not exists (select 1 from public.content_items ex where ex.title = c.title);
