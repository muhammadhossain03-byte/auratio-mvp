import 'package:auratio_mobile/app/router/app_route_paths.dart';
import 'package:auratio_mobile/features/profile/presentation/screens/manage_paths_screen.dart';
import 'package:auratio_mobile/features/profile/presentation/screens/profile_screen.dart';
import 'package:auratio_mobile/features/profile/presentation/screens/settings_screen.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/auratio_test_harness.dart';

void main() {
  group('Batch 13 Visual QA Verification', () {
    testWidgets(
        'visual QA: Profile (295:179) layout, cards, identity, links, and bottom nav',
        (tester) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.profile,
        settle: false,
      );
      await tester.pumpAndSettle();

      expect(find.byKey(ProfileScreen.screenKey), findsOneWidget);
      expect(find.text('Profile'), findsNWidgets(2)); // Header + Bottom nav
      expect(find.text('AM'), findsOneWidget);
      expect(find.text('Alex Morgan'), findsOneWidget);
      expect(find.text('End user'), findsOneWidget);

      // Account Card
      expect(find.text('Account'), findsOneWidget);
      expect(find.text('alex@example.com'), findsOneWidget);
      expect(
        find.text(
          'Identity and authorization are backed by the shared system.',
        ),
        findsOneWidget,
      );

      // Selected Paths Card
      expect(find.text('Selected Auratio paths'), findsOneWidget);
      expect(find.text('Public Speaking'), findsOneWidget);
      expect(find.text('Professional Presenting'), findsOneWidget);
      expect(find.text('Manage Paths  →'), findsOneWidget);

      // Activity Card
      expect(find.text('Your Auratio activity'), findsOneWidget);
      expect(find.text('Private Progress  →'), findsOneWidget);
      expect(find.text('Approved Evaluation History  →'), findsOneWidget);
      expect(find.text('Leaderboards  →'), findsOneWidget);
      expect(find.text('Events  →'), findsOneWidget);

      // Settings Button
      expect(find.text('Settings'), findsOneWidget);
    });

    testWidgets('visual QA: Profile • 3 Paths (300:92) content card',
        (tester) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.profileThreePaths,
        settle: false,
      );
      await tester.pumpAndSettle();

      expect(find.text('Selected Auratio paths'), findsOneWidget);
      expect(find.text('Public Speaking'), findsOneWidget);
      expect(find.text('Professional Presenting'), findsOneWidget);
      expect(
        find.text('Content Creation  •  Manage Paths  →'),
        findsOneWidget,
      );
    });

    testWidgets(
        'visual QA: Settings (295:214) account, event preferences, privacy, sign out, and back button',
        (tester) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.profileSettings,
        settle: false,
      );
      await tester.pumpAndSettle();

      expect(find.byKey(SettingsScreen.screenKey), findsOneWidget);
      expect(find.text('Settings'), findsOneWidget);
      expect(find.text('Account & app settings'), findsOneWidget);

      // Account Card
      expect(find.text('Email: alex@example.com'), findsOneWidget);
      expect(find.text('Role: End user'), findsOneWidget);

      // Event Preferences Card
      expect(find.text('Event discovery preferences'), findsOneWidget);
      expect(
        find.text(
          'Auratio lists Bangladesh events only and uses your saved Division plus selected paths for relevance.',
        ),
        findsOneWidget,
      );
      expect(find.text('Country: Bangladesh (MVP)'), findsOneWidget);
      expect(find.text('Division: Dhaka Division'), findsOneWidget);
      expect(find.text('Manage selected Paths  →'), findsOneWidget);

      // Privacy & Retention Card
      expect(find.text('Submission privacy & retention'), findsOneWidget);
      expect(
        find.text(
          'Performance videos are temporary evaluation artifacts. They remain through evaluation/moderation and are deleted after the final Approved or Rejected decision.',
        ),
        findsOneWidget,
      );
      expect(
        find.text(
          'Final .docx reports remain accessible after video deletion.',
        ),
        findsOneWidget,
      );

      // Sign Out & Back to Profile
      expect(find.text('Sign Out'), findsOneWidget);
      expect(find.text('Back to Profile'), findsOneWidget);
    });

    testWidgets(
        'visual QA: Manage Paths Base (295:239) and Content Added (300:65)',
        (tester) async {
      final router = await pumpAuratioApp(tester);

      // Base
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.managePaths,
        settle: false,
      );
      await tester.pumpAndSettle();

      expect(find.byKey(ManagePathsScreen.screenKey), findsOneWidget);
      expect(find.text('Manage Paths'), findsOneWidget);
      expect(
        find.text('Personalize Auratio by adding or removing Paths.'),
        findsOneWidget,
      );
      expect(find.text('Public Speaking'), findsOneWidget);
      expect(find.text('Five speaking formats'), findsOneWidget);
      expect(find.text('Professional Presenting'), findsOneWidget);
      expect(
        find.text('Five professional presentation modes'),
        findsOneWidget,
      );
      expect(find.text('Content Creation'), findsOneWidget);
      expect(
        find.text('Three speaker-led content niches'),
        findsOneWidget,
      );
      expect(
        find.text('Paths personalize Home and event relevance.'),
        findsOneWidget,
      );
      expect(
        find.text(
          'All tracks stay available. Past results, mastery, reports and leaderboard history stay unchanged.',
        ),
        findsOneWidget,
      );
      expect(find.text('Save Changes'), findsOneWidget);
      // In base, 2 checkboxes are checked (2 '✓')
      expect(find.text('✓'), findsNWidgets(2));

      // Content Added
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.managePathsContentAdded,
        settle: false,
      );
      await tester.pumpAndSettle();
      // In content added, all 3 checkboxes are checked (3 '✓')
      expect(find.text('✓'), findsNWidgets(3));
    });
  });
}
