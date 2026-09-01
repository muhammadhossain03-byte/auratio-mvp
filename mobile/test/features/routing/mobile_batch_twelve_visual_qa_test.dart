import 'package:auratio_mobile/app/router/app_route_paths.dart';
import 'package:auratio_mobile/features/events/presentation/screens/event_details_screen.dart';
import 'package:auratio_mobile/features/events/presentation/screens/events_discovery_screen.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/auratio_test_harness.dart';

void main() {
  group('Batch 12 Visual QA Verification', () {
    testWidgets(
      'visual QA: Events Discovery (282:650) layout, filters, event cards, read-only card, and nav',
      (tester) async {
        final router = await pumpAuratioApp(tester);
        await openAuratioRoute(
          tester,
          router,
          AppRoutePaths.events,
          settle: false,
        );
        await tester.pumpAndSettle();

        expect(router.state.uri.path, AppRoutePaths.events);

        // Header
        expect(find.text('Events'), findsOneWidget);
        expect(find.text('‹'), findsNothing);

        // Heading & Intro
        expect(find.text('Events for you'), findsOneWidget);
        expect(
          find.text(
            'Bangladesh-only events are matched to your saved Division and selected Auratio paths.',
          ),
          findsOneWidget,
        );

        // Filters Card
        expect(
          find.byKey(EventsDiscoveryScreen.filterCardKey),
          findsOneWidget,
        );
        expect(find.text('Filters'), findsOneWidget);
        expect(
          find.text('Bangladesh-only MVP • refine your results'),
          findsOneWidget,
        );
        expect(find.text('Dhaka Division'), findsOneWidget);
        expect(find.text('All Paths'), findsOneWidget);
        expect(find.text('Upcoming'), findsOneWidget);

        // Relevant Events
        expect(find.text('RELEVANT EVENTS'), findsOneWidget);

        // Event Card 1
        expect(find.text('Public Speaking Summit'), findsOneWidget);
        expect(find.text('Relevant path: Public Speaking'), findsOneWidget);

        // Event Card 2
        expect(find.text('Presentation Practice Meetup'), findsOneWidget);
        expect(
          find.text('Relevant path: Professional Presenting'),
          findsOneWidget,
        );

        // Both cards share division/date and link text
        expect(find.text('Dhaka Division • Upcoming date'), findsNWidgets(2));
        expect(find.text('View event details  →'), findsNWidgets(2));

        // Read-only directory
        expect(
          find.byKey(EventsDiscoveryScreen.readOnlyCardKey),
          findsOneWidget,
        );
        expect(find.text('Read-only directory'), findsOneWidget);
        expect(
          find.text(
            'End users can view event information only; management is admin-controlled.',
          ),
          findsOneWidget,
        );

        // Bottom nav
        expect(find.text('Home'), findsOneWidget);
        expect(find.text('Tracks'), findsOneWidget);
        expect(find.text('Progress'), findsOneWidget);
        expect(find.text('Profile'), findsOneWidget);
      },
    );

    testWidgets(
      'visual QA: Event Details (282:689) layout, two-column information grid, and cards',
      (tester) async {
        final router = await pumpAuratioApp(tester);
        await openAuratioRoute(
          tester,
          router,
          AppRoutePaths.eventDetails,
          settle: false,
        );
        await tester.pumpAndSettle();

        expect(router.state.uri.path, AppRoutePaths.eventDetails);

        // Header
        expect(find.text('Event Details'), findsOneWidget);
        expect(find.text('‹'), findsOneWidget);

        // Title & Supporting text
        expect(find.text('Public Speaking Summit'), findsOneWidget);
        expect(find.text('Admin-curated event information'), findsOneWidget);

        // Event Information card
        expect(
          find.byKey(EventDetailsScreen.eventInfoCardKey),
          findsOneWidget,
        );
        expect(find.text('Event information'), findsOneWidget);
        expect(find.text('Date'), findsOneWidget);
        expect(find.text('Upcoming date'), findsOneWidget);
        expect(find.text('Location'), findsOneWidget);
        expect(find.text('Dhaka Division, Bangladesh'), findsOneWidget);
        expect(find.text('Relevant path'), findsOneWidget);
        expect(find.text('Public Speaking'), findsOneWidget);
        expect(find.text('Source'), findsOneWidget);
        expect(find.text('Published by Auratio admin'), findsOneWidget);

        // About this event card
        expect(find.byKey(EventDetailsScreen.aboutCardKey), findsOneWidget);
        expect(find.text('About this event'), findsOneWidget);
        expect(
          find.text(
            'Event description and organizer-provided information appear here. End users do not manage the event through Auratio.',
          ),
          findsOneWidget,
        );

        // Why this event is shown card
        expect(find.byKey(EventDetailsScreen.whyShownCardKey), findsOneWidget);
        expect(find.text('Why this event is shown'), findsOneWidget);
        expect(
          find.text(
            'Shown because your saved Division and selected Public Speaking path match this event.',
          ),
          findsOneWidget,
        );

        // Back to Events CTA
        expect(
          find.byKey(EventDetailsScreen.backToEventsButtonKey),
          findsOneWidget,
        );
        expect(find.text('Back to Events'), findsOneWidget);
      },
    );
  });
}
