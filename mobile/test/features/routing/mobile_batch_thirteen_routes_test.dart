import 'package:auratio_mobile/app/router/app_route_paths.dart';
import 'package:auratio_mobile/features/profile/presentation/screens/manage_paths_screen.dart';
import 'package:auratio_mobile/features/profile/presentation/screens/profile_screen.dart';
import 'package:auratio_mobile/features/profile/presentation/screens/settings_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/auratio_test_harness.dart';

void main() {
  const screens = <_BatchScreenCase>[
    _BatchScreenCase(
      name: 'Profile',
      path: AppRoutePaths.profile,
      identifyingCopy: 'Alex Morgan',
    ),
    _BatchScreenCase(
      name: 'Profile Three Paths',
      path: AppRoutePaths.profileThreePaths,
      identifyingCopy: 'Content Creation  •  Manage Paths  →',
    ),
    _BatchScreenCase(
      name: 'Settings',
      path: AppRoutePaths.profileSettings,
      identifyingCopy: 'Account & app settings',
    ),
    _BatchScreenCase(
      name: 'Manage Paths',
      path: AppRoutePaths.managePaths,
      identifyingCopy: 'Personalize Auratio by adding or removing Paths.',
    ),
    _BatchScreenCase(
      name: 'Manage Paths Content Added',
      path: AppRoutePaths.managePathsContentAdded,
      identifyingCopy: 'Personalize Auratio by adding or removing Paths.',
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

  group('Upstream Profile Navigation', () {
    testWidgets('Home Profile bottom nav routes to /profile', (tester) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.home,
        settle: false,
      );
      await tester.pumpAndSettle();

      // Tap Profile in bottom nav (index 3)
      await tester.tap(find.text('Profile'));
      await tester.pumpAndSettle();

      expect(router.state.uri.path, AppRoutePaths.profile);
      expect(find.byKey(ProfileScreen.screenKey), findsOneWidget);
    });

    testWidgets('Tracks Profile bottom nav routes to /profile, Home is no-op',
        (tester) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.tracks,
        settle: false,
      );
      await tester.pumpAndSettle();

      // Tap Home in bottom nav -> remains on Tracks
      await tester.tap(find.text('Home'));
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.tracks);

      // Tap Profile in bottom nav -> routes to /profile
      await tester.tap(find.text('Profile'));
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.profile);
    });

    testWidgets(
        'Private Progress Profile bottom nav routes to /profile, Home is no-op',
        (tester) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.progress,
        settle: false,
      );
      await tester.pumpAndSettle();

      // Tap Home in bottom nav -> remains on Progress
      await tester.tap(find.text('Home'));
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.progress);

      // Tap Profile in bottom nav -> routes to /profile
      await tester.tap(find.text('Profile'));
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.profile);
    });

    testWidgets('Events Discovery Profile bottom nav routes to /profile',
        (tester) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.events,
        settle: false,
      );
      await tester.pumpAndSettle();

      // Tap Profile in bottom nav -> routes to /profile
      await tester.tap(find.text('Profile'));
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.profile);
    });
  });

  group('Base Profile (295:179)', () {
    testWidgets('Renders base two-path state and navigates to Manage Paths',
        (tester) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.profile,
        settle: false,
      );
      await tester.pumpAndSettle();

      expect(router.state.uri.path, AppRoutePaths.profile);
      expect(find.text('Manage Paths  →'), findsOneWidget);

      // Tap Manage Paths -> /profile/manage-paths
      await tester.tap(find.byKey(ProfileScreen.managePathsLinkKey));
      await tester.pumpAndSettle();

      expect(router.state.uri.path, AppRoutePaths.managePaths);
      expect(find.byKey(ManagePathsScreen.screenKey), findsOneWidget);
    });

    testWidgets('Navigates to Settings', (tester) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.profile,
        settle: false,
      );
      await tester.pumpAndSettle();

      // Tap Settings button -> /profile/settings
      await tester.tap(find.byKey(ProfileScreen.settingsButtonKey));
      await tester.pumpAndSettle();

      expect(router.state.uri.path, AppRoutePaths.profileSettings);
      expect(find.byKey(SettingsScreen.screenKey), findsOneWidget);
    });

    testWidgets('Activity links navigate to their destinations',
        (tester) async {
      final router = await pumpAuratioApp(tester);

      // 1. Private Progress
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.profile,
        settle: false,
      );
      await tester.pumpAndSettle();
      await tester.tap(find.byKey(ProfileScreen.privateProgressLinkKey));
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.progress);

      // 2. Approved History
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.profile,
        settle: false,
      );
      await tester.pumpAndSettle();
      await tester.tap(find.byKey(ProfileScreen.approvedHistoryLinkKey));
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.approvedEvaluationHistory);

      // 3. Leaderboards
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.profile,
        settle: false,
      );
      await tester.pumpAndSettle();
      await tester.tap(find.byKey(ProfileScreen.leaderboardsLinkKey));
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.leaderboard);

      // 4. Events
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.profile,
        settle: false,
      );
      await tester.pumpAndSettle();
      await tester.tap(find.byKey(ProfileScreen.eventsLinkKey));
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.events);
    });

    testWidgets('Bottom nav on Profile works for Tracks and Progress',
        (tester) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.profile,
        settle: false,
      );
      await tester.pumpAndSettle();

      // Tap Tracks -> /tracks
      await tester.tap(find.text('Tracks'));
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.tracks);

      // Return to Profile
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.profile,
        settle: false,
      );
      await tester.pumpAndSettle();

      // Tap Progress -> /progress
      await tester.tap(find.text('Progress'));
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.progress);
    });
  });

  group('Settings (295:214)', () {
    testWidgets('Header back and Back to Profile CTA route to /profile',
        (tester) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.profileSettings,
        settle: false,
      );
      await tester.pumpAndSettle();

      // Header back chevron -> /profile
      await tester.tap(find.text('‹'));
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.profile);

      // Re-open Settings
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.profileSettings,
        settle: false,
      );
      await tester.pumpAndSettle();

      // Back to Profile CTA -> /profile
      await tester.tap(find.byKey(SettingsScreen.backToProfileButtonKey));
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.profile);
    });

    testWidgets('Manage selected Paths link routes to /profile/manage-paths',
        (tester) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.profileSettings,
        settle: false,
      );
      await tester.pumpAndSettle();

      await tester.tap(find.byKey(SettingsScreen.managePathsLinkKey));
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.managePaths);
    });
  });

  group('Manage Paths (295:239) & Content Added (300:65)', () {
    testWidgets(
        'Base Manage Paths (295:239): Content Creation title is interactive, but checkbox, subtitle, background, and other cards are non-interactive',
        (tester) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.managePaths,
        settle: false,
      );
      await tester.pumpAndSettle();

      // 1. Tapping Public Speaking title / subtitle / card does NOT navigate
      await tester.tap(find.text('Public Speaking'));
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.managePaths);

      await tester.tap(find.text('Five speaking formats'));
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.managePaths);

      // 2. Tapping Professional Presenting title / subtitle / card does NOT navigate
      await tester.tap(find.text('Professional Presenting'));
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.managePaths);

      await tester.tap(find.text('Five professional presentation modes'));
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.managePaths);

      // 3. Tapping Content Creation checkbox does NOT navigate
      final cardRect =
          tester.getRect(find.byKey(ManagePathsScreen.contentCreationCardKey));
      final checkboxCenter = cardRect.topLeft + const Offset(28, 52);
      await tester.tapAt(checkboxCenter);
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.managePaths);

      // 4. Tapping Content Creation subtitle does NOT navigate
      await tester.tap(find.text('Three speaker-led content niches'));
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.managePaths);

      // 5. Tapping empty/background card space does NOT navigate
      final cardBackground = cardRect.topRight + const Offset(-20, 20);
      await tester.tapAt(cardBackground);
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.managePaths);

      // 6. ONLY tapping the "Content Creation" text affordance routes to content-added
      await tester.tap(find.byKey(ManagePathsScreen.contentCreationTitleKey));
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.managePathsContentAdded);
    });

    testWidgets('Base Manage Paths: Save Changes routes to /profile',
        (tester) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.managePaths,
        settle: false,
      );
      await tester.pumpAndSettle();

      await tester.tap(find.byKey(ManagePathsScreen.saveChangesButtonKey));
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.profile);
    });

    testWidgets(
        'Content Added (300:65): Content Creation title is interactive, but checkbox, subtitle, background, and other cards are non-interactive',
        (tester) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.managePathsContentAdded,
        settle: false,
      );
      await tester.pumpAndSettle();

      // 1. Tapping Public Speaking does NOT navigate
      await tester.tap(find.text('Public Speaking'));
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.managePathsContentAdded);

      // 2. Tapping Professional Presenting does NOT navigate
      await tester.tap(find.text('Professional Presenting'));
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.managePathsContentAdded);

      // 3. Tapping Content Creation checkbox does NOT navigate
      final cardRect =
          tester.getRect(find.byKey(ManagePathsScreen.contentCreationCardKey));
      final checkboxCenter = cardRect.topLeft + const Offset(28, 52);
      await tester.tapAt(checkboxCenter);
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.managePathsContentAdded);

      // 4. Tapping Content Creation subtitle does NOT navigate
      await tester.tap(find.text('Three speaker-led content niches'));
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.managePathsContentAdded);

      // 5. Tapping empty/background card space does NOT navigate
      final cardBackground = cardRect.topRight + const Offset(-20, 20);
      await tester.tapAt(cardBackground);
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.managePathsContentAdded);

      // 6. ONLY tapping the "Content Creation" text affordance routes back to base manage-paths
      await tester.tap(find.byKey(ManagePathsScreen.contentCreationTitleKey));
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.managePaths);
    });

    testWidgets('Content Added: Save Changes routes to /profile/three-paths',
        (tester) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.managePathsContentAdded,
        settle: false,
      );
      await tester.pumpAndSettle();

      // Tap Save Changes -> /profile/three-paths
      await tester.tap(find.byKey(ManagePathsScreen.saveChangesButtonKey));
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.profileThreePaths);
    });
  });

  group('Profile • 3 Paths (300:92)', () {
    testWidgets(
        'Manage Paths affordance routes to /profile/manage-paths/content-added',
        (tester) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.profileThreePaths,
        settle: false,
      );
      await tester.pumpAndSettle();

      expect(
        find.text('Content Creation  •  Manage Paths  →'),
        findsOneWidget,
      );

      // Tap Manage Paths -> /profile/manage-paths/content-added
      await tester.tap(find.byKey(ProfileScreen.managePathsLinkKey));
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.managePathsContentAdded);
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
