import '../../onboarding/domain/auratio_path.dart';
import 'event_item.dart';

abstract final class AuratioEventCatalog {
  static const summit = EventItem(
    slug: 'public-speaking-summit',
    title: 'Public Speaking Summit',
    division: 'Dhaka Division',
    location: 'Dhaka Division, Bangladesh',
    date: 'Upcoming date',
    relevantPath: AuratioPath.publicSpeaking,
    source: 'Published by Auratio admin',
    supportingText: 'Admin-curated event information',
    aboutText: 'Event description and organizer-provided information appear here. End users do not manage the event through Auratio.',
    whyShownText: 'Shown because your saved Division and selected Public Speaking path match this event.',
  );

  static const meetup = EventItem(
    slug: 'presentation-practice-meetup',
    title: 'Presentation Practice Meetup',
    division: 'Dhaka Division',
    location: 'Dhaka Division, Bangladesh',
    date: 'Upcoming date',
    relevantPath: AuratioPath.professionalPresenting,
    source: 'Published by Auratio admin',
    supportingText: 'Admin-curated event information',
    aboutText: 'Event description and organizer-provided information appear here. End users do not manage the event through Auratio.',
    whyShownText: 'Shown because your saved Division and selected Professional Presenting path match this event.',
  );

  static const all = [summit, meetup];

  static EventItem? findBySlug(String slug) {
    for (final event in all) {
      if (event.slug == slug) {
        return event;
      }
    }
    return null;
  }
}
