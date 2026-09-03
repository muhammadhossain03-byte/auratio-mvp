import 'package:auratio_mobile/app/router/app_route_paths.dart';
import 'package:auratio_mobile/features/events/presentation/screens/event_details_screen.dart';
import 'package:auratio_mobile/features/events/presentation/screens/events_discovery_screen.dart';
import 'package:auratio_mobile/features/home/presentation/screens/home_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/auratio_test_harness.dart';

void main() {
  const screens = <_BatchScreenCase>[
    _BatchScreenCase(
      name: 'Events Discovery',
      path: AppRoutePaths.events,
      identifyingCopy: 'Events for you',
    ),
    _BatchScreenCase(
      name: 'Event Details',
      path: AppRoutePaths.eventDetails,
      identifyingCopy: 'Public Speaking Summit',
    ),
  ];

  for (final screen in screens) {
    testWidgets('${screen.name} route renders without overflow at 390 x 844', (
      tester,
    ) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(tester, router, screen.path, settle: false);
      await tester.pumpAndSettle();

      expect(router.state.uri.path, screen.path);
      expect(find.text(screen.identifyingCopy), findsWidgets);
      expectInsideTestCanvas(tester, find.byType(Scaffold));
      expect(tester.takeException(), isNull);
    });
  }

  group('Upstream Home Events Navigation', () {
    testWidgets(
      'Home Events button navigates to Events Discovery; Leaderboards navigates to Leaderboard',
      (tester) async {
        final router = await pumpAuratioApp(tester);
        await openAuratioRoute(
          tester,
          router,
          AppRoutePaths.home,
          settle: false,
        );
        await tester.pumpAndSettle();

        expect(router.state.uri.path, AppRoutePaths.home);

        // Tap Events button -> navigates to Events Discovery
        final eventsBtn = find.byKey(HomeScreen.eventsButtonKey);
        expect(eventsBtn, findsOneWidget);
        await tester.tap(eventsBtn);
        await tester.pumpAndSettle();

        expect(router.state.uri.path, AppRoutePaths.events);
        expect(find.byKey(EventsDiscoveryScreen.screenKey), findsOneWidget);

        // Return to Home via openAuratioRoute
        await openAuratioRoute(
          tester,
          router,
          AppRoutePaths.home,
          settle: false,
        );
        await tester.pumpAndSettle();

        // Tap Leaderboards button -> navigates to AI Leaderboard
        final leaderboardsBtn = find.byKey(HomeScreen.leaderboardsButtonKey);
        expect(leaderboardsBtn, findsOneWidget);
        await tester.tap(leaderboardsBtn);
        await tester.pumpAndSettle();

        expect(router.state.uri.path, AppRoutePaths.leaderboard);
      },
    );
  });

  group('Events Discovery (282:650)', () {
    testWidgets(
      'Event card details links navigate to parameterized Event Details routes',
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

        // Card 1 link -> Event Details (public-speaking-summit)
        final card1Link = find.descendant(
          of: find.byKey(EventsDiscoveryScreen.eventCard1Key),
          matching: find.text('View event details  →'),
        );
        expect(card1Link, findsOneWidget);
        await tester.tap(card1Link);
        await tester.pumpAndSettle();

        expect(
          router.state.uri.path,
          '${AppRoutePaths.events}/public-speaking-summit',
        );
        expect(find.byKey(EventDetailsScreen.screenKey), findsOneWidget);

        // Go back to Events Discovery
        await openAuratioRoute(
          tester,
          router,
          AppRoutePaths.events,
          settle: false,
        );
        await tester.pumpAndSettle();

        // Card 2 link -> Event Details (presentation-practice-meetup)
        final card2Link = find.descendant(
          of: find.byKey(EventsDiscoveryScreen.eventCard2Key),
          matching: find.text('View event details  →'),
        );
        expect(card2Link, findsOneWidget);
        await tester.tap(card2Link);
        await tester.pumpAndSettle();

        expect(
          router.state.uri.path,
          '${AppRoutePaths.events}/presentation-practice-meetup',
        );
        expect(find.byKey(EventDetailsScreen.screenKey), findsOneWidget);
      },
    );

    testWidgets(
      'Bottom navigation: Home, Profile, Tracks, and Progress navigate to their routes',
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

        // Tap Home nav item -> navigates to /home
        final homeNav = find.text('Home');
        expect(homeNav, findsOneWidget);
        await tester.tap(homeNav);
        await tester.pumpAndSettle();
        expect(router.state.uri.path, AppRoutePaths.home);

        // Tap Profile nav item -> navigates to /profile (activated in Batch 13)
        final profileNav = find.text('Profile');
        expect(profileNav, findsOneWidget);
        await tester.tap(profileNav);
        await tester.pumpAndSettle();
        expect(router.state.uri.path, AppRoutePaths.profile);

        // Return to Events
        await openAuratioRoute(
          tester,
          router,
          AppRoutePaths.events,
          settle: false,
        );
        await tester.pumpAndSettle();

        // Tap Tracks nav item -> navigates to Tracks
        final tracksNav = find.text('Tracks');
        expect(tracksNav, findsOneWidget);
        await tester.tap(tracksNav);
        await tester.pumpAndSettle();
        expect(router.state.uri.path, AppRoutePaths.tracks);

        // Return to Events
        await openAuratioRoute(
          tester,
          router,
          AppRoutePaths.events,
          settle: false,
        );
        await tester.pumpAndSettle();

        // Tap Progress nav item -> navigates to Progress
        final progressNav = find.text('Progress');
        expect(progressNav, findsOneWidget);
        await tester.tap(progressNav);
        await tester.pumpAndSettle();
        expect(router.state.uri.path, AppRoutePaths.progress);
      },
    );

    testWidgets('Filter controls are presentation-only without reactions', (
      tester,
    ) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.events,
        settle: false,
      );
      await tester.pumpAndSettle();

      expect(router.state.uri.path, AppRoutePaths.events);

      final divisionFilter = find.byKey(
        EventsDiscoveryScreen.filterDivisionKey,
      );
      expect(divisionFilter, findsOneWidget);
      await tester.tap(divisionFilter);
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.events);

      final pathFilter = find.byKey(EventsDiscoveryScreen.filterPathKey);
      expect(pathFilter, findsOneWidget);
      await tester.tap(pathFilter);
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.events);

      final dateFilter = find.byKey(EventsDiscoveryScreen.filterDateKey);
      expect(dateFilter, findsOneWidget);
      await tester.tap(dateFilter);
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.events);
    });
  });

  group('Event Details (282:689)', () {
    testWidgets('Header back chevron navigates to Events Discovery', (
      tester,
    ) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.eventDetails,
        settle: false,
      );
      await tester.pumpAndSettle();

      expect(router.state.uri.path, AppRoutePaths.eventDetails);

      final backFinder = find.text('‹');
      expect(backFinder, findsOneWidget);
      await tester.tap(backFinder);
      await tester.pumpAndSettle();

      expect(router.state.uri.path, AppRoutePaths.events);
    });

    testWidgets('Back to Events CTA navigates to Events Discovery', (
      tester,
    ) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.eventDetails,
        settle: false,
      );
      await tester.pumpAndSettle();

      expect(router.state.uri.path, AppRoutePaths.eventDetails);

      final backBtn = find.byKey(EventDetailsScreen.backToEventsButtonKey);
      expect(backBtn, findsOneWidget);
      await tester.tap(backBtn);
      await tester.pumpAndSettle();

      expect(router.state.uri.path, AppRoutePaths.events);
    });
  });
}

class _BatchScreenCase {
  const _BatchScreenCase({
    required this.name,
    required this.path,
    required this.identifyingCopy,
  });

  final String name;
  final String path;
  final String identifyingCopy;
}
