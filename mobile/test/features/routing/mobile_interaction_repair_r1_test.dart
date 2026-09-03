import 'package:auratio_mobile/app/router/app_route_paths.dart';
import 'package:auratio_mobile/features/evaluations/presentation/screens/choose_evaluation_method_screen.dart';
import 'package:auratio_mobile/features/evaluations/presentation/screens/evaluation_pending_moderation_screen.dart';
import 'package:auratio_mobile/features/onboarding/application/path_selection_controller.dart';
import 'package:auratio_mobile/features/onboarding/domain/auratio_path.dart';
import 'package:auratio_mobile/features/tracks/domain/track_catalog.dart';
import 'package:auratio_mobile/features/tracks/presentation/screens/track_details_screen.dart';
import 'package:auratio_mobile/foundation/design_system/auratio_design_system.dart';
import 'package:auratio_mobile/foundation/navigation/auratio_navigation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/auratio_test_harness.dart';

void main() {
  group('Canonical Mobile Bottom Navigation', () {
    testWidgets('Home screen navigates to Tracks, Progress, Profile', (
      tester,
    ) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(tester, router, AppRoutePaths.home, settle: false);
      await tester.pumpAndSettle();

      expect(router.state.uri.path, AppRoutePaths.home);

      // Home -> Tracks
      await tester.tap(
        find.widgetWithText(AuratioMobileNavigationItem, 'Tracks'),
      );
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.tracks);

      // Back to Home
      await openAuratioRoute(tester, router, AppRoutePaths.home, settle: false);
      await tester.pumpAndSettle();

      // Home -> Progress
      await tester.tap(
        find.widgetWithText(AuratioMobileNavigationItem, 'Progress'),
      );
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.progress);

      // Back to Home
      await openAuratioRoute(tester, router, AppRoutePaths.home, settle: false);
      await tester.pumpAndSettle();

      // Home -> Profile
      await tester.tap(
        find.widgetWithText(AuratioMobileNavigationItem, 'Profile'),
      );
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.profile);
    });

    testWidgets('Tracks screen navigates to Home, Progress, Profile', (
      tester,
    ) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.tracks,
        settle: false,
      );
      await tester.pumpAndSettle();

      expect(router.state.uri.path, AppRoutePaths.tracks);

      // Tracks -> Home
      await tester.tap(
        find.widgetWithText(AuratioMobileNavigationItem, 'Home'),
      );
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.home);

      // Back to Tracks
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.tracks,
        settle: false,
      );
      await tester.pumpAndSettle();

      // Tracks -> Progress
      await tester.tap(
        find.widgetWithText(AuratioMobileNavigationItem, 'Progress'),
      );
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.progress);

      // Back to Tracks
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.tracks,
        settle: false,
      );
      await tester.pumpAndSettle();

      // Tracks -> Profile
      await tester.tap(
        find.widgetWithText(AuratioMobileNavigationItem, 'Profile'),
      );
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.profile);
    });

    testWidgets('Progress screen navigates to Home, Tracks, Profile', (
      tester,
    ) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.progress,
        settle: false,
      );
      await tester.pumpAndSettle();

      expect(router.state.uri.path, AppRoutePaths.progress);

      // Progress -> Home
      await tester.tap(
        find.widgetWithText(AuratioMobileNavigationItem, 'Home'),
      );
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.home);

      // Back to Progress
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.progress,
        settle: false,
      );
      await tester.pumpAndSettle();

      // Progress -> Tracks
      await tester.tap(
        find.widgetWithText(AuratioMobileNavigationItem, 'Tracks'),
      );
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.tracks);

      // Back to Progress
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.progress,
        settle: false,
      );
      await tester.pumpAndSettle();

      // Progress -> Profile
      await tester.tap(
        find.widgetWithText(AuratioMobileNavigationItem, 'Profile'),
      );
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.profile);
    });

    testWidgets('Profile screen navigates to Home, Tracks, Progress', (
      tester,
    ) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.profile,
        settle: false,
      );
      await tester.pumpAndSettle();

      expect(router.state.uri.path, AppRoutePaths.profile);

      // Profile -> Home
      await tester.tap(
        find.widgetWithText(AuratioMobileNavigationItem, 'Home'),
      );
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.home);

      // Back to Profile
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.profile,
        settle: false,
      );
      await tester.pumpAndSettle();

      // Profile -> Tracks
      await tester.tap(
        find.widgetWithText(AuratioMobileNavigationItem, 'Tracks'),
      );
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.tracks);

      // Back to Profile
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.profile,
        settle: false,
      );
      await tester.pumpAndSettle();

      // Profile -> Progress
      await tester.tap(
        find.widgetWithText(AuratioMobileNavigationItem, 'Progress'),
      );
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.progress);
    });
  });

  group('13-Track Catalog & Evaluation Availability', () {
    testWidgets(
      'every one of the 13 track rows opens Track Details with correct data',
      (tester) async {
        final router = await pumpAuratioApp(tester);

        for (final track in AuratioTrackCatalog.allTracks) {
          await openAuratioRoute(
            tester,
            router,
            AppRoutePaths.tracks,
            settle: false,
          );
          await tester.pumpAndSettle();

          final trackRowFinder = find.byKey(Key('track-row-${track.slug}'));
          expect(
            trackRowFinder,
            findsOneWidget,
            reason: 'Track row for ${track.name} must exist',
          );

          await tester.scrollUntilVisible(
            trackRowFinder,
            100.0,
            scrollable: find.byType(Scrollable).first,
          );
          await tester.pumpAndSettle();

          await tester.tap(trackRowFinder);
          await tester.pumpAndSettle();

          // Track Details opens
          expect(
            router.state.uri.path,
            AppRoutePaths.trackDetailsFor(track.slug),
            reason: 'Routing must open details for ${track.name}',
          );
          expect(find.text(track.name), findsOneWidget);
          expect(find.text(track.category.path.label), findsOneWidget);
          expect(
            find.textContaining('Target ${track.targetDuration}'),
            findsOneWidget,
            reason: 'Target duration for ${track.name} must match',
          );
          expect(
            find.textContaining(
              'Accepted upload\nwindow ${track.acceptedDuration}',
            ),
            findsOneWidget,
            reason: 'Accepted duration for ${track.name} must match',
          );
        }
      },
    );

    testWidgets('Path selection does not restrict track access', (
      tester,
    ) async {
      final router = await pumpAuratioApp(tester);

      // Set paths to Public Speaking only
      final container = ProviderScope.containerOf(
        tester.element(find.byType(MaterialApp)),
      );
      container.read(selectedPathsProvider.notifier).setPaths({
        AuratioPath.publicSpeaking,
      });

      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.tracks,
        settle: false,
      );
      await tester.pumpAndSettle();

      // Content Creation track (Marketing / Promotional) is still browsable and interactive
      final marketingRow = find.byKey(
        const Key('track-row-marketing-promotional'),
      );
      await tester.scrollUntilVisible(
        marketingRow,
        100.0,
        scrollable: find.byType(Scrollable).first,
      );
      await tester.pumpAndSettle();

      expect(marketingRow, findsOneWidget);
      await tester.tap(marketingRow);
      await tester.pumpAndSettle();

      expect(
        router.state.uri.path,
        AppRoutePaths.trackDetailsFor('marketing-promotional'),
      );
      expect(find.text('Marketing / Promotional'), findsOneWidget);
      expect(find.text('Content Creation'), findsOneWidget);
    });
  });

  group('Active Evaluation Journey Parameterization', () {
    testWidgets('Informative track flows through active evaluation journey', (
      tester,
    ) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.tracks,
        settle: false,
      );
      await tester.pumpAndSettle();

      // Tap Informative
      final infoTrack = AuratioTrackCatalog.informative;
      await tester.tap(find.byKey(Key('track-row-${infoTrack.slug}')));
      await tester.pumpAndSettle();

      expect(
        router.state.uri.path,
        AppRoutePaths.trackDetailsFor(infoTrack.slug),
      );
      expect(find.text(infoTrack.name), findsOneWidget);
      expect(find.text(infoTrack.category.path.label), findsOneWidget);
      expect(
        find.textContaining('Target ${infoTrack.targetDuration}'),
        findsOneWidget,
      );
      expect(
        find.textContaining(
          'Accepted upload\nwindow ${infoTrack.acceptedDuration}',
        ),
        findsOneWidget,
      );

      // Start Evaluation -> Submission Requirements
      await tester.tap(find.byKey(TrackDetailsScreen.startEvaluationButtonKey));
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.submissionRequirements);

      // Choose Video -> Upload Recording
      await tester.tap(find.byKey(const Key('submission-choose-video-button')));
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.uploadRecording);
      expect(find.text(infoTrack.name), findsOneWidget);
      expect(
        find.text('Accepted upload window ${infoTrack.acceptedDuration}'),
        findsOneWidget,
      );
      expect(find.text(infoTrack.effectiveFileName), findsOneWidget);

      // Upload and Check -> Checking Recording
      await tester.tap(find.byKey(const Key('upload-and-check-button')));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));
      expect(router.state.uri.path, AppRoutePaths.checkingRecording);
      expect(find.text(infoTrack.name), findsOneWidget);
      expect(
        find.text('Accepted duration: ${infoTrack.acceptedDuration}'),
        findsOneWidget,
      );

      // Let checking timer finish -> Recording Accepted
      await tester.pump(const Duration(milliseconds: 1300));
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.recordingAccepted);
      expect(find.text(infoTrack.sampleValidDuration), findsOneWidget);
      expect(
        find.text('Accepted window ${infoTrack.acceptedDuration}'),
        findsOneWidget,
      );

      // Continue -> Choose Evaluation Method
      await tester.tap(
        find.byKey(const Key('recording-accepted-continue-button')),
      );
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.chooseEvaluationMethod);

      // Select AI Evaluation and Continue -> Routing Assigned AI
      await tester.tap(
        find.byKey(ChooseEvaluationMethodScreen.continueButtonKey),
      );
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.routingAssignedAi);

      // Continue -> Processing AI
      await tester.tap(
        find.byKey(const Key('routing-assigned-continue-button')),
      );
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.evaluationProcessingAi);
      expect(find.text(infoTrack.name), findsOneWidget);

      // Direct inspection of Result AI screen for Informative
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.evaluationResultAi,
        settle: false,
      );
      await tester.pumpAndSettle();
      expect(find.text(infoTrack.name), findsOneWidget);

      // Direct inspection of Result Human screen for Informative
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.evaluationResultHuman,
        settle: false,
      );
      await tester.pumpAndSettle();
      expect(find.text(infoTrack.name), findsOneWidget);
    });

    testWidgets(
      'Marketing / Promotional track flows through active evaluation journey',
      (tester) async {
        final router = await pumpAuratioApp(tester);
        await openAuratioRoute(
          tester,
          router,
          AppRoutePaths.tracks,
          settle: false,
        );
        await tester.pumpAndSettle();

        final marketingTrack = AuratioTrackCatalog.marketingPromotional;
        final marketingRow = find.byKey(
          Key('track-row-${marketingTrack.slug}'),
        );
        await tester.scrollUntilVisible(
          marketingRow,
          100.0,
          scrollable: find.byType(Scrollable).first,
        );
        await tester.pumpAndSettle();

        await tester.tap(marketingRow);
        await tester.pumpAndSettle();

        expect(
          router.state.uri.path,
          AppRoutePaths.trackDetailsFor(marketingTrack.slug),
        );
        expect(find.text(marketingTrack.name), findsOneWidget);
        expect(find.text(marketingTrack.category.path.label), findsOneWidget);
        expect(
          find.textContaining('Target ${marketingTrack.targetDuration}'),
          findsOneWidget,
        );
        expect(
          find.textContaining(
            'Accepted upload\nwindow ${marketingTrack.acceptedDuration}',
          ),
          findsOneWidget,
        );

        // Start Evaluation -> Submission Requirements
        await tester.tap(
          find.byKey(TrackDetailsScreen.startEvaluationButtonKey),
        );
        await tester.pumpAndSettle();

        // Choose Video -> Upload Recording
        await tester.tap(
          find.byKey(const Key('submission-choose-video-button')),
        );
        await tester.pumpAndSettle();
        expect(find.text(marketingTrack.name), findsOneWidget);
        expect(
          find.text(
            'Accepted upload window ${marketingTrack.acceptedDuration}',
          ),
          findsOneWidget,
        );
        expect(find.text(marketingTrack.effectiveFileName), findsOneWidget);

        // Direct route to Recording Accepted retains Marketing / Promotional
        await openAuratioRoute(
          tester,
          router,
          AppRoutePaths.recordingAccepted,
          settle: false,
        );
        await tester.pumpAndSettle();
        expect(find.text(marketingTrack.sampleValidDuration), findsOneWidget);
        expect(
          find.text('Accepted window ${marketingTrack.acceptedDuration}'),
          findsOneWidget,
        );

        // Direct route to Processing retains Marketing / Promotional
        await openAuratioRoute(
          tester,
          router,
          AppRoutePaths.evaluationProcessingAi,
          settle: false,
        );
        await tester.pumpAndSettle();
        expect(find.text(marketingTrack.name), findsOneWidget);
      },
    );

    testWidgets(
      'Default unselected evaluation flow defaults to Business Pitch / Sales Pitch',
      (tester) async {
        final router = await pumpAuratioApp(tester);
        final defaultTrack = AuratioTrackCatalog.businessPitch;

        // Direct navigation to Upload Recording without prior track selection
        await openAuratioRoute(
          tester,
          router,
          AppRoutePaths.uploadRecording,
          settle: false,
        );
        await tester.pumpAndSettle();

        expect(find.text(defaultTrack.name), findsOneWidget);
        expect(
          find.text('Accepted upload window ${defaultTrack.acceptedDuration}'),
          findsOneWidget,
        );
        expect(find.text(defaultTrack.effectiveFileName), findsOneWidget);

        // Direct navigation to Recording Accepted
        await openAuratioRoute(
          tester,
          router,
          AppRoutePaths.recordingAccepted,
          settle: false,
        );
        await tester.pumpAndSettle();
        expect(find.text(defaultTrack.sampleValidDuration), findsOneWidget);
        expect(
          find.text('Accepted window ${defaultTrack.acceptedDuration}'),
          findsOneWidget,
        );

        // Direct navigation to Recording Accepted
        await openAuratioRoute(
          tester,
          router,
          AppRoutePaths.recordingAccepted,
          settle: false,
        );
        await tester.pumpAndSettle();
        expect(find.text('4:12'), findsOneWidget);
        expect(find.text('Accepted window 2:30–5:30'), findsOneWidget);
      },
    );
  });

  group('Pending Moderation & Rejected State Integrity', () {
    testWidgets(
      'Pending Moderation remains on hold indefinitely beyond 2200 ms',
      (tester) async {
        final router = await pumpAuratioApp(tester);
        await openAuratioRoute(
          tester,
          router,
          AppRoutePaths.evaluationStatusPendingModeration,
          settle: false,
        );
        await tester.pump();

        expect(
          router.state.uri.path,
          AppRoutePaths.evaluationStatusPendingModeration,
        );

        // Pumping for 5 seconds does NOT trigger navigation
        await tester.pump(const Duration(seconds: 5));
        expect(
          router.state.uri.path,
          AppRoutePaths.evaluationStatusPendingModeration,
        );

        // Return to Home works
        await tester.tap(
          find.byKey(EvaluationPendingModerationScreen.returnHomeButtonKey),
        );
        await tester.pumpAndSettle();
        expect(router.state.uri.path, AppRoutePaths.home);
      },
    );

    testWidgets(
      'Evaluation Rejected retry CTA navigates to Tracks and releases gate',
      (tester) async {
        final router = await pumpAuratioApp(tester);
        await openAuratioRoute(
          tester,
          router,
          AppRoutePaths.evaluationStatusRejected,
          settle: false,
        );
        await tester.pumpAndSettle();

        expect(router.state.uri.path, AppRoutePaths.evaluationStatusRejected);

        final retryBtn = find.widgetWithText(
          AuratioButton,
          'Start a New Evaluation',
        );
        expect(retryBtn, findsOneWidget);

        await tester.tap(retryBtn);
        await tester.pumpAndSettle();

        expect(router.state.uri.path, AppRoutePaths.tracks);
      },
    );
  });
}
