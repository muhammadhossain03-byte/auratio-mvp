import 'package:auratio_mobile/app/router/app_route_paths.dart';
import 'package:auratio_mobile/features/profile/presentation/screens/manage_paths_screen.dart';
import 'package:auratio_mobile/features/profile/presentation/screens/profile_screen.dart';
import 'package:auratio_mobile/features/profile/presentation/screens/settings_screen.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/auratio_test_harness.dart';

void main() {
  group('Batch 13 Exact Figma Geometry Verification at 390 × 844', () {
    testWidgets('Profile (295:179) rendered rectangles match Figma metadata',
        (tester) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.profile,
        settle: false,
      );
      await tester.pumpAndSettle();

      // Avatar: (20, 120, 64, 64)
      final avatarRect = tester.getRect(find.byKey(ProfileScreen.avatarKey));
      expect(avatarRect.left, 20.0);
      expect(avatarRect.top, 120.0);
      expect(avatarRect.width, 64.0);
      expect(avatarRect.height, 64.0);

      // Account Card: (20, 214, 350, 116)
      final accountRect =
          tester.getRect(find.byKey(ProfileScreen.accountCardKey));
      expect(accountRect.left, 20.0);
      expect(accountRect.top, 214.0);
      expect(accountRect.width, 350.0);
      expect(accountRect.height, 116.0);

      // Selected Paths Card: (20, 348, 350, 120)
      final pathsRect =
          tester.getRect(find.byKey(ProfileScreen.selectedPathsCardKey));
      expect(pathsRect.left, 20.0);
      expect(pathsRect.top, 348.0);
      expect(pathsRect.width, 350.0);
      expect(pathsRect.height, 120.0);

      // Activity Card: (20, 486, 350, 156)
      final activityRect =
          tester.getRect(find.byKey(ProfileScreen.activityCardKey));
      expect(activityRect.left, 20.0);
      expect(activityRect.top, 486.0);
      expect(activityRect.width, 350.0);
      expect(activityRect.height, 156.0);

      // Settings Button: (20, 672, 350, 48)
      final settingsRect =
          tester.getRect(find.byKey(ProfileScreen.settingsButtonKey));
      expect(settingsRect.left, 20.0);
      expect(settingsRect.top, 672.0);
      expect(settingsRect.width, 350.0);
      expect(settingsRect.height, 48.0);

      // Bottom Nav: (0, 770, 390, 74)
      final navRect = tester.getRect(find.byKey(ProfileScreen.bottomNavKey));
      expect(navRect.left, 0.0);
      expect(navRect.top, 770.0);
      expect(navRect.width, 390.0);
      expect(navRect.height, 74.0);
    });

    testWidgets('Settings (295:214) rendered rectangles match Figma metadata',
        (tester) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.profileSettings,
        settle: false,
      );
      await tester.pumpAndSettle();

      // Account Card: (20, 174, 350, 100)
      final accountRect =
          tester.getRect(find.byKey(SettingsScreen.accountCardKey));
      expect(accountRect.left, 20.0);
      expect(accountRect.top, 174.0);
      expect(accountRect.width, 350.0);
      expect(accountRect.height, 100.0);

      // Event Preferences: (20, 292, 350, 164)
      final prefRect =
          tester.getRect(find.byKey(SettingsScreen.eventPreferencesCardKey));
      expect(prefRect.left, 20.0);
      expect(prefRect.top, 292.0);
      expect(prefRect.width, 350.0);
      expect(prefRect.height, 164.0);

      // Privacy Card: (20, 474, 350, 154)
      final privacyRect =
          tester.getRect(find.byKey(SettingsScreen.privacyCardKey));
      expect(privacyRect.left, 20.0);
      expect(privacyRect.top, 474.0);
      expect(privacyRect.width, 350.0);
      expect(privacyRect.height, 154.0);

      // Sign Out Visual: (20, 670, 350, 48)
      final signOutRect =
          tester.getRect(find.byKey(SettingsScreen.signOutVisualKey));
      expect(signOutRect.left, 20.0);
      expect(signOutRect.top, 670.0);
      expect(signOutRect.width, 350.0);
      expect(signOutRect.height, 48.0);

      // Back to Profile: (20, 730, 350, 48)
      final backRect =
          tester.getRect(find.byKey(SettingsScreen.backToProfileButtonKey));
      expect(backRect.left, 20.0);
      expect(backRect.top, 730.0);
      expect(backRect.width, 350.0);
      expect(backRect.height, 48.0);
    });

    testWidgets(
        'Manage Paths (295:239) rendered rectangles match Figma metadata',
        (tester) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.managePaths,
        settle: false,
      );
      await tester.pumpAndSettle();

      // Public Speaking Card: (20, 166, 350, 104)
      final pubRect =
          tester.getRect(find.byKey(ManagePathsScreen.publicSpeakingCardKey));
      expect(pubRect.left, 20.0);
      expect(pubRect.top, 166.0);
      expect(pubRect.width, 350.0);
      expect(pubRect.height, 104.0);

      // Professional Presenting Card: (20, 294, 350, 104)
      final presRect = tester
          .getRect(find.byKey(ManagePathsScreen.professionalPresentingCardKey));
      expect(presRect.left, 20.0);
      expect(presRect.top, 294.0);
      expect(presRect.width, 350.0);
      expect(presRect.height, 104.0);

      // Content Creation Card: (20, 422, 350, 104)
      final contentRect =
          tester.getRect(find.byKey(ManagePathsScreen.contentCreationCardKey));
      expect(contentRect.left, 20.0);
      expect(contentRect.top, 422.0);
      expect(contentRect.width, 350.0);
      expect(contentRect.height, 104.0);

      // Info Card: (20, 570, 350, 88)
      final infoRect = tester.getRect(find.byKey(ManagePathsScreen.infoCardKey));
      expect(infoRect.left, 20.0);
      expect(infoRect.top, 570.0);
      expect(infoRect.width, 350.0);
      expect(infoRect.height, 88.0);

      // Save Changes: (20, 750, 350, 48)
      final saveRect =
          tester.getRect(find.byKey(ManagePathsScreen.saveChangesButtonKey));
      expect(saveRect.left, 20.0);
      expect(saveRect.top, 750.0);
      expect(saveRect.width, 350.0);
      expect(saveRect.height, 48.0);
    });
  });
}
