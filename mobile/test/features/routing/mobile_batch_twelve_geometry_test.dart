import 'package:auratio_mobile/app/router/app_route_paths.dart';
import 'package:auratio_mobile/features/events/presentation/screens/event_details_screen.dart';
import 'package:auratio_mobile/features/events/presentation/screens/events_discovery_screen.dart';
import 'package:auratio_mobile/features/shared/presentation/widgets/auratio_screen_header.dart';
import 'package:auratio_mobile/foundation/navigation/auratio_navigation.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/auratio_test_harness.dart';

void main() {
  group('Batch 12 Exact Figma Geometry Verification at 390 × 844', () {
    testWidgets(
      'Events Discovery (282:650) rendered rectangles match Figma metadata',
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

        // Header: Rect(0, 0, 390, 92)
        final headerFinder = find.byType(AuratioScreenHeader);
        expect(headerFinder, findsOneWidget);
        final headerRect = tester.getRect(headerFinder);
        expect(headerRect.left, 0.0);
        expect(headerRect.top, 0.0);
        expect(headerRect.width, 390.0);
        expect(headerRect.height, 92.0);

        // Heading: x=20, y=120
        final headingFinder = find.byKey(EventsDiscoveryScreen.headingKey);
        expect(headingFinder, findsOneWidget);
        final headingRect = tester.getRect(headingFinder);
        expect(headingRect.left, 20.0);
        expect(headingRect.top, 120.0);

        // Intro: x=20, y=160, w=350
        final introFinder = find.byKey(EventsDiscoveryScreen.introKey);
        expect(introFinder, findsOneWidget);
        final introRect = tester.getRect(introFinder);
        expect(introRect.left, 20.0);
        expect(introRect.top, 160.0);
        expect(introRect.width, 350.0);

        // Filter Card: Rect(20, 214, 350, 142)
        final filterCard = find.byKey(EventsDiscoveryScreen.filterCardKey);
        expect(filterCard, findsOneWidget);
        final filterCardRect = tester.getRect(filterCard);
        expect(filterCardRect.left, 20.0);
        expect(filterCardRect.top, 214.0);
        expect(filterCardRect.width, 350.0);
        expect(filterCardRect.height, 142.0);

        // Division Filter: Rect(34, 278, 102, 40)
        final divFilter = find.byKey(EventsDiscoveryScreen.filterDivisionKey);
        expect(divFilter, findsOneWidget);
        final divRect = tester.getRect(divFilter);
        expect(divRect.left, 34.0);
        expect(divRect.top, 278.0);
        expect(divRect.width, 102.0);
        expect(divRect.height, 40.0);

        // Path Filter: Rect(144, 278, 102, 40)
        final pathFilter = find.byKey(EventsDiscoveryScreen.filterPathKey);
        expect(pathFilter, findsOneWidget);
        final pathRect = tester.getRect(pathFilter);
        expect(pathRect.left, 144.0);
        expect(pathRect.top, 278.0);
        expect(pathRect.width, 102.0);
        expect(pathRect.height, 40.0);

        // Date Filter: Rect(254, 278, 102, 40)
        final dateFilter = find.byKey(EventsDiscoveryScreen.filterDateKey);
        expect(dateFilter, findsOneWidget);
        final dateRect = tester.getRect(dateFilter);
        expect(dateRect.left, 254.0);
        expect(dateRect.top, 278.0);
        expect(dateRect.width, 102.0);
        expect(dateRect.height, 40.0);

        // Relevant Events Label: x=20, y=374
        final labelFinder = find.byKey(
          EventsDiscoveryScreen.relevantEventsLabelKey,
        );
        expect(labelFinder, findsOneWidget);
        final labelRect = tester.getRect(labelFinder);
        expect(labelRect.left, 20.0);
        expect(labelRect.top, 374.0);

        // Event Card 1: Rect(20, 400, 350, 112)
        final card1 = find.byKey(EventsDiscoveryScreen.eventCard1Key);
        expect(card1, findsOneWidget);
        final card1Rect = tester.getRect(card1);
        expect(card1Rect.left, 20.0);
        expect(card1Rect.top, 400.0);
        expect(card1Rect.width, 350.0);
        expect(card1Rect.height, 112.0);

        // Event Card 2: Rect(20, 530, 350, 112)
        final card2 = find.byKey(EventsDiscoveryScreen.eventCard2Key);
        expect(card2, findsOneWidget);
        final card2Rect = tester.getRect(card2);
        expect(card2Rect.left, 20.0);
        expect(card2Rect.top, 530.0);
        expect(card2Rect.width, 350.0);
        expect(card2Rect.height, 112.0);

        // Read-only Directory Card: Rect(20, 660, 350, 82)
        final readOnlyCard = find.byKey(EventsDiscoveryScreen.readOnlyCardKey);
        expect(readOnlyCard, findsOneWidget);
        final readOnlyRect = tester.getRect(readOnlyCard);
        expect(readOnlyRect.left, 20.0);
        expect(readOnlyRect.top, 660.0);
        expect(readOnlyRect.width, 350.0);
        expect(readOnlyRect.height, 82.0);

        // Bottom Navigation: Rect(0, 770, 390, 74)
        final navFinder = find.byType(AuratioMobileNavigationBar);
        expect(navFinder, findsOneWidget);
        final navRect = tester.getRect(navFinder);
        expect(navRect.left, 0.0);
        expect(navRect.top, 770.0);
        expect(navRect.width, 390.0);
        expect(navRect.height, 74.0);
      },
    );

    testWidgets(
      'Event Details (282:689) rendered rectangles match Figma metadata',
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

        // Header: Rect(0, 0, 390, 92)
        final headerFinder = find.byType(AuratioScreenHeader);
        expect(headerFinder, findsOneWidget);
        final headerRect = tester.getRect(headerFinder);
        expect(headerRect.left, 0.0);
        expect(headerRect.top, 0.0);
        expect(headerRect.width, 390.0);
        expect(headerRect.height, 92.0);

        // Title: x=20, y=120, w=350
        final titleFinder = find.byKey(EventDetailsScreen.titleKey);
        expect(titleFinder, findsOneWidget);
        final titleRect = tester.getRect(titleFinder);
        expect(titleRect.left, 20.0);
        expect(titleRect.top, 120.0);
        expect(titleRect.width, 350.0);

        // Supporting text: x=20, y=158
        final supportFinder = find.byKey(EventDetailsScreen.supportingTextKey);
        expect(supportFinder, findsOneWidget);
        final supportRect = tester.getRect(supportFinder);
        expect(supportRect.left, 20.0);
        expect(supportRect.top, 158.0);

        // Event information card: Rect(20, 210, 350, 160)
        final infoCard = find.byKey(EventDetailsScreen.eventInfoCardKey);
        expect(infoCard, findsOneWidget);
        final infoRect = tester.getRect(infoCard);
        expect(infoRect.left, 20.0);
        expect(infoRect.top, 210.0);
        expect(infoRect.width, 350.0);
        expect(infoRect.height, 160.0);

        // About this event card: Rect(20, 390, 350, 140)
        final aboutCard = find.byKey(EventDetailsScreen.aboutCardKey);
        expect(aboutCard, findsOneWidget);
        final aboutRect = tester.getRect(aboutCard);
        expect(aboutRect.left, 20.0);
        expect(aboutRect.top, 390.0);
        expect(aboutRect.width, 350.0);
        expect(aboutRect.height, 140.0);

        // Why this event is shown card: Rect(20, 548, 350, 112)
        final whyCard = find.byKey(EventDetailsScreen.whyShownCardKey);
        expect(whyCard, findsOneWidget);
        final whyRect = tester.getRect(whyCard);
        expect(whyRect.left, 20.0);
        expect(whyRect.top, 548.0);
        expect(whyRect.width, 350.0);
        expect(whyRect.height, 112.0);

        // Back to Events CTA: Rect(20, 750, 350, 48)
        final backBtn = find.byKey(EventDetailsScreen.backToEventsButtonKey);
        expect(backBtn, findsOneWidget);
        final backRect = tester.getRect(backBtn);
        expect(backRect.left, 20.0);
        expect(backRect.top, 750.0);
        expect(backRect.width, 350.0);
        expect(backRect.height, 48.0);
      },
    );
  });
}
