import 'package:auratio_mobile/app/router/app_route_paths.dart';
import 'package:auratio_mobile/features/onboarding/application/path_selection_controller.dart';
import 'package:auratio_mobile/features/onboarding/domain/auratio_path.dart';
import 'package:auratio_mobile/features/profile/presentation/screens/manage_paths_screen.dart';
import 'package:auratio_mobile/features/profile/presentation/screens/profile_screen.dart';
import 'package:auratio_mobile/features/tracks/presentation/screens/tracks_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/auratio_test_harness.dart';

void main() {
  group('Unified Mobile Path-Selection State (Section 6)', () {
    testWidgets(
      '1. Onboarding selection persists into Home & 2. Home displays saved selected Paths',
      (tester) async {
        final router = await pumpAuratioApp(tester);
        final container = ProviderScope.containerOf(
          tester.element(find.byType(MaterialApp)),
        );

        // Customize selection in unified provider
        container.read(selectedPathsProvider.notifier).setPaths({
          AuratioPath.publicSpeaking,
          AuratioPath.contentCreation,
        });

        await openAuratioRoute(tester, router, AppRoutePaths.home);
        await tester.pumpAndSettle();

        expect(router.state.uri.path, AppRoutePaths.home);
        expect(find.text('Public Speaking'), findsWidgets);
        expect(find.text('Content Creation'), findsWidgets);
      },
    );

    testWidgets(
      '3. Profile displays the same selected Paths from unified provider',
      (tester) async {
        final router = await pumpAuratioApp(tester);
        final container = ProviderScope.containerOf(
          tester.element(find.byType(MaterialApp)),
        );

        container.read(selectedPathsProvider.notifier).setPaths({
          AuratioPath.publicSpeaking,
          AuratioPath.professionalPresenting,
        });

        await openAuratioRoute(tester, router, AppRoutePaths.profile);
        await tester.pumpAndSettle();

        expect(find.byKey(ProfileScreen.selectedPathsCardKey), findsOneWidget);
        expect(find.text('Public Speaking'), findsOneWidget);
        expect(find.text('Professional Presenting'), findsOneWidget);
        expect(find.text('Manage Paths  →'), findsOneWidget);
      },
    );

    testWidgets(
      '4. Manage Paths can add Content Creation, save, and reflect on Profile',
      (tester) async {
        final router = await pumpAuratioApp(tester);
        final container = ProviderScope.containerOf(
          tester.element(find.byType(MaterialApp)),
        );

        container.read(selectedPathsProvider.notifier).setPaths({
          AuratioPath.publicSpeaking,
          AuratioPath.professionalPresenting,
        });

        await openAuratioRoute(tester, router, AppRoutePaths.managePaths);
        await tester.pumpAndSettle();

        // Check Content Creation
        await tester.tap(find.byKey(ManagePathsScreen.contentCreationCardKey));
        await tester.pumpAndSettle();

        // Save Changes
        await tester.tap(find.byKey(ManagePathsScreen.saveChangesButtonKey));
        await tester.pumpAndSettle();

        // Profile reflects 3 paths
        expect(
          find.text('Content Creation  •  Manage Paths  →'),
          findsOneWidget,
        );
        expect(
          container.read(selectedPathsProvider),
          contains(AuratioPath.contentCreation),
        );
      },
    );

    testWidgets('5. Manage Paths can remove Public Speaking and save', (
      tester,
    ) async {
      final router = await pumpAuratioApp(tester);
      final container = ProviderScope.containerOf(
        tester.element(find.byType(MaterialApp)),
      );

      container.read(selectedPathsProvider.notifier).setPaths({
        AuratioPath.publicSpeaking,
        AuratioPath.professionalPresenting,
      });

      await openAuratioRoute(tester, router, AppRoutePaths.managePaths);
      await tester.pumpAndSettle();

      // Tap Public Speaking to remove
      await tester.tap(find.text('Public Speaking'));
      await tester.pumpAndSettle();

      // Save
      await tester.tap(find.byKey(ManagePathsScreen.saveChangesButtonKey));
      await tester.pumpAndSettle();

      // Profile should no longer display Public Speaking
      expect(find.byKey(ProfileScreen.selectedPathsCardKey), findsOneWidget);
      expect(find.text('Professional Presenting'), findsOneWidget);
      expect(find.text('Public Speaking'), findsNothing);
    });

    testWidgets('6. Manage Paths can remove Professional Presenting and save', (
      tester,
    ) async {
      final router = await pumpAuratioApp(tester);
      final container = ProviderScope.containerOf(
        tester.element(find.byType(MaterialApp)),
      );

      container.read(selectedPathsProvider.notifier).setPaths({
        AuratioPath.publicSpeaking,
        AuratioPath.professionalPresenting,
      });

      await openAuratioRoute(tester, router, AppRoutePaths.managePaths);
      await tester.pumpAndSettle();

      // Tap Professional Presenting to remove
      await tester.tap(find.text('Professional Presenting'));
      await tester.pumpAndSettle();

      // Save
      await tester.tap(find.byKey(ManagePathsScreen.saveChangesButtonKey));
      await tester.pumpAndSettle();

      // Profile should no longer display Professional Presenting
      expect(find.byKey(ProfileScreen.selectedPathsCardKey), findsOneWidget);
      expect(find.text('Public Speaking'), findsOneWidget);
      expect(find.text('Professional Presenting'), findsNothing);
    });

    testWidgets('7. Cannot save zero Paths (minimum-one rule)', (tester) async {
      final router = await pumpAuratioApp(tester);
      final container = ProviderScope.containerOf(
        tester.element(find.byType(MaterialApp)),
      );

      container.read(selectedPathsProvider.notifier).setPaths({
        AuratioPath.publicSpeaking,
      });

      await openAuratioRoute(tester, router, AppRoutePaths.managePaths);
      await tester.pumpAndSettle();

      // Deselect Public Speaking so draft is empty
      await tester.tap(find.text('Public Speaking'));
      await tester.pumpAndSettle();

      // Attempt to tap Save Changes button
      await tester.tap(find.byKey(ManagePathsScreen.saveChangesButtonKey));
      await tester.pumpAndSettle();

      // Must still be on managePaths (save blocked) and provider untouched
      expect(router.state.uri.path, AppRoutePaths.managePaths);
      expect(
        container.read(selectedPathsProvider),
        equals({AuratioPath.publicSpeaking}),
      );
    });

    testWidgets(
      '8. Saved state survives navigation between Home, Profile, and Manage Paths without losing sync',
      (tester) async {
        final router = await pumpAuratioApp(tester);
        final container = ProviderScope.containerOf(
          tester.element(find.byType(MaterialApp)),
        );

        container.read(selectedPathsProvider.notifier).setPaths({
          AuratioPath.publicSpeaking,
          AuratioPath.professionalPresenting,
          AuratioPath.contentCreation,
        });

        // Open Home
        await openAuratioRoute(tester, router, AppRoutePaths.home);
        await tester.pumpAndSettle();
        expect(find.text('Content Creation'), findsWidgets);

        // Open Profile
        await openAuratioRoute(tester, router, AppRoutePaths.profile);
        await tester.pumpAndSettle();
        expect(
          find.text('Content Creation  •  Manage Paths  →'),
          findsOneWidget,
        );

        // Discard draft on back navigation
        await openAuratioRoute(tester, router, AppRoutePaths.managePaths);
        await tester.pumpAndSettle();

        // Toggle off Public Speaking in draft
        await tester.tap(find.text('Public Speaking'));
        await tester.pumpAndSettle();

        // Navigate back without saving
        await tester.tap(find.text('‹'));
        await tester.pumpAndSettle();

        // Still on Profile and Public Speaking is still present
        expect(find.text('Public Speaking'), findsOneWidget);
        expect(
          find.text('Content Creation  •  Manage Paths  →'),
          findsOneWidget,
        );
      },
    );

    testWidgets(
      '9. Tracks catalogue remains fully visible regardless of Path selection',
      (tester) async {
        final router = await pumpAuratioApp(tester);
        final container = ProviderScope.containerOf(
          tester.element(find.byType(MaterialApp)),
        );

        // Only 1 path selected
        container.read(selectedPathsProvider.notifier).setPaths({
          AuratioPath.publicSpeaking,
        });

        await openAuratioRoute(tester, router, AppRoutePaths.tracks);
        await tester.pumpAndSettle();

        expect(find.byKey(TracksScreen.tracksScreenKey), findsOneWidget);
        // All catalog tracks remain present
        expect(find.text('Informative'), findsOneWidget);
        expect(find.text('Extempore'), findsOneWidget);
        expect(find.text('Persuasive'), findsOneWidget);
      },
    );

    testWidgets(
      '10. Historical progress and mock evaluations remain unaltered when changing Paths',
      (tester) async {
        final router = await pumpAuratioApp(tester);

        // Check progress
        await openAuratioRoute(tester, router, AppRoutePaths.progress);
        await tester.pumpAndSettle();
        expect(find.text('84.2 / 100'), findsOneWidget); // Composite score

        // Change paths on Manage Paths
        await openAuratioRoute(tester, router, AppRoutePaths.managePaths);
        await tester.pumpAndSettle();
        await tester.tap(find.byKey(ManagePathsScreen.contentCreationCardKey));
        await tester.pumpAndSettle();
        await tester.tap(find.byKey(ManagePathsScreen.saveChangesButtonKey));
        await tester.pumpAndSettle();

        // Revisit progress
        await openAuratioRoute(tester, router, AppRoutePaths.progress);
        await tester.pumpAndSettle();
        expect(find.text('84.2 / 100'), findsOneWidget); // Score intact
      },
    );

    testWidgets(
      '11. Removing Content Creation from saved 3-Path state results in 2-Path Profile without Content Creation',
      (tester) async {
        final router = await pumpAuratioApp(tester);
        final container = ProviderScope.containerOf(
          tester.element(find.byType(MaterialApp)),
        );

        // 1. Saved 3 Paths
        container
            .read(selectedPathsProvider.notifier)
            .setPaths(AuratioPath.values.toSet());

        // 2. Enter Profile
        await openAuratioRoute(tester, router, AppRoutePaths.profile);
        await tester.pumpAndSettle();
        expect(
          find.text('Content Creation  •  Manage Paths  →'),
          findsOneWidget,
        );

        // 3. Enter Manage Paths through the 3-Path affordance
        await tester.tap(find.byKey(ProfileScreen.managePathsLinkKey));
        await tester.pumpAndSettle();

        // 4. Remove Content Creation
        await tester.tap(find.byKey(ManagePathsScreen.contentCreationCardKey));
        await tester.pumpAndSettle();

        // 5. Save
        await tester.tap(find.byKey(ManagePathsScreen.saveChangesButtonKey));
        await tester.pumpAndSettle();

        // 6. Assert provider has exactly 2 Paths
        final saved = container.read(selectedPathsProvider);
        expect(saved.length, 2);
        expect(saved.contains(AuratioPath.contentCreation), isFalse);

        // 7. Assert Profile does NOT contain Content Creation
        expect(find.byKey(ProfileScreen.selectedPathsCardKey), findsOneWidget);
        expect(find.text('Content Creation'), findsNothing);
        expect(find.text('Content Creation  •  Manage Paths  →'), findsNothing);
        expect(find.text('Manage Paths  →'), findsOneWidget);
        expect(router.state.uri.path, AppRoutePaths.profile);
      },
    );

    testWidgets(
      '12. Tapping Content Creation title affordance toggles selection without losing unsaved draft changes',
      (tester) async {
        final router = await pumpAuratioApp(tester);
        final container = ProviderScope.containerOf(
          tester.element(find.byType(MaterialApp)),
        );

        container
            .read(selectedPathsProvider.notifier)
            .setPaths(AuratioPath.values.toSet());

        await openAuratioRoute(tester, router, AppRoutePaths.managePaths);
        await tester.pumpAndSettle();

        // Uncheck Public Speaking in draft
        await tester.tap(find.text('Public Speaking'));
        await tester.pumpAndSettle();

        // Tap Content Creation title to remove Content Creation
        await tester.tap(find.byKey(ManagePathsScreen.contentCreationTitleKey));
        await tester.pumpAndSettle();

        // Public Speaking must STILL be unselected (draft not reset!)
        // Toggle Public Speaking back on
        await tester.tap(find.text('Public Speaking'));
        await tester.pumpAndSettle();

        // Save
        await tester.tap(find.byKey(ManagePathsScreen.saveChangesButtonKey));
        await tester.pumpAndSettle();

        final saved = container.read(selectedPathsProvider);
        expect(saved.length, 2);
        expect(saved, contains(AuratioPath.publicSpeaking));
        expect(saved, contains(AuratioPath.professionalPresenting));
        expect(saved, isNot(contains(AuratioPath.contentCreation)));

        expect(find.text('Content Creation'), findsNothing);
      },
    );
  });
}
