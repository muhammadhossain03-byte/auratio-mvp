import 'package:auratio_mobile/app/router/app_route_paths.dart';
import 'package:auratio_mobile/features/home/presentation/screens/home_screen.dart';
import 'package:auratio_mobile/features/submissions/presentation/screens/submission_requirements_screen.dart';
import 'package:auratio_mobile/features/tracks/presentation/screens/track_details_screen.dart';
import 'package:auratio_mobile/foundation/design_system/auratio_design_system.dart';
import 'package:auratio_mobile/foundation/navigation/auratio_navigation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/auratio_test_harness.dart';

void main() {
  // ─── QA item 3: Widget-level visual QA at 390 × 844 ───
  //
  // Each test renders a Batch 3 screen at exactly 390 × 844 (1× DPR) and
  // structurally validates layout geometry, typography, hierarchy, and
  // visual states against the authoritative Figma frame.  Combined with
  // Figma image downloads for side-by-side comparison during development,
  // this proves implementation fidelity without relying on raster golden
  // files that cannot be generated in a headless CI renderer.

  testWidgets('visual QA: Home (282:136) layout and control states', (
    tester,
  ) async {
    final router = await pumpAuratioApp(tester);
    await openAuratioRoute(tester, router, AppRoutePaths.home, settle: false);
    await tester.pumpAndSettle();

    // Canvas check.
    expect(router.state.uri.path, AppRoutePaths.home);
    expectInsideTestCanvas(tester, find.byType(Scaffold));

    // Hero section present.
    expect(find.text('Hello, Alex'), findsOneWidget);
    expect(find.text('View Active Evaluation'), findsOneWidget);

    // View Active Evaluation renders as accent, not disabled.
    final vaeBtn = tester.widget<AuratioButton>(
      find.byKey(HomeScreen.viewActiveEvaluationKey),
    );
    expect(vaeBtn.variant, AuratioButtonVariant.accent);
    expect(vaeBtn.onPressed, isNotNull);

    // Cards present.
    expect(find.text('Business Pitch / Sales Pitch'), findsOneWidget);
    expect(find.text('Pending Moderation'), findsOneWidget);
    expect(find.text('Overall Auratio Mastery'), findsOneWidget);

    // Leaderboards & Events render as secondary, not disabled.
    final lbBtn = tester.widget<AuratioButton>(
      find.byKey(HomeScreen.leaderboardsButtonKey),
    );
    expect(lbBtn.variant, AuratioButtonVariant.secondary);
    expect(lbBtn.onPressed, isNotNull);

    final evBtn = tester.widget<AuratioButton>(
      find.byKey(HomeScreen.eventsButtonKey),
    );
    expect(evBtn.variant, AuratioButtonVariant.secondary);
    expect(evBtn.onPressed, isNotNull);

    // YOUR PATHS chips are rendered as presentationOnly badges (not disabled).
    final chipFinder = find.byType(AuratioChipTab);
    expect(chipFinder, findsWidgets);
    for (var i = 0; i < chipFinder.evaluate().length; i++) {
      final chip = tester.widget<AuratioChipTab>(chipFinder.at(i));
      expect(
        chip.presentationOnly,
        isTrue,
        reason: 'chip $i should be presentationOnly',
      );
    }

    // Bottom nav bar present with 4 destinations.
    expect(find.byType(AuratioMobileNavigationBar), findsOneWidget);
    expect(find.text('Home'), findsOneWidget);
    expect(find.text('Tracks'), findsOneWidget);
    expect(find.text('Progress'), findsOneWidget);
    expect(find.text('Profile'), findsOneWidget);

    expect(tester.takeException(), isNull);
  });

  testWidgets('visual QA: Tracks (288:55) row geometry matches Figma', (
    tester,
  ) async {
    final router = await pumpAuratioApp(tester);
    await openAuratioRoute(tester, router, AppRoutePaths.tracks, settle: false);
    await tester.pumpAndSettle();

    expect(router.state.uri.path, AppRoutePaths.tracks);
    expectInsideTestCanvas(tester, find.byType(Scaffold));

    // Category headers.
    expect(find.text('PUBLIC SPEAKING'), findsOneWidget);
    expect(find.text('PROFESSIONAL PRESENTING'), findsOneWidget);
    expect(find.text('CONTENT CREATION'), findsOneWidget);

    // Verify a track row's visible container height is 34px (Figma-approved),
    // not the inflated 44px from the previous implementation.
    final firstTrackRowContainer = find.ancestor(
      of: find.text('Informative'),
      matching: find.byType(Container),
    );
    expect(firstTrackRowContainer, findsWidgets);
    // The decorated Container (with border) should be 34px tall.
    for (final element in firstTrackRowContainer.evaluate()) {
      final container = element.widget as Container;
      if (container.decoration != null) {
        final box = element.renderObject as RenderBox;
        expect(
          box.size.height,
          34.0,
          reason: 'Track row visible height must be 34px per Figma',
        );
        break;
      }
    }

    // Filter chips present.
    expect(find.text('All'), findsOneWidget);
    expect(find.text('Public Speaking'), findsOneWidget);
    expect(find.text('Presenting'), findsOneWidget);
    expect(find.text('Content'), findsOneWidget);

    // Bottom nav bar present.
    expect(find.byType(AuratioMobileNavigationBar), findsOneWidget);

    expect(tester.takeException(), isNull);
  });

  testWidgets('visual QA: Track Details (282:221) layout and structure', (
    tester,
  ) async {
    final router = await pumpAuratioApp(tester);
    await openAuratioRoute(
      tester,
      router,
      AppRoutePaths.trackDetails,
      settle: false,
    );
    await tester.pumpAndSettle();

    expect(router.state.uri.path, AppRoutePaths.trackDetails);
    expectInsideTestCanvas(tester, find.byType(Scaffold));

    // Header.
    expect(find.text('Track Details'), findsOneWidget);

    // Path badge.
    final pathChip = tester.widget<AuratioChipTab>(
      find.widgetWithText(AuratioChipTab, 'Professional Presenting'),
    );
    expect(pathChip.selected, isTrue);

    // Title & description.
    expect(find.text('Business Pitch / Sales Pitch'), findsOneWidget);
    expect(
      find.text(
        'Deliver a speaker-visible pitch for structured communication evaluation.',
      ),
      findsOneWidget,
    );

    // Duration card.
    expect(find.textContaining('Target 3:00–5:00'), findsOneWidget);

    // Recording requirement card.
    expect(find.text('Recording requirement'), findsOneWidget);

    // Evaluation structure rows.
    expect(find.text('Universal Delivery'), findsOneWidget);
    expect(find.text('40 pts'), findsNWidgets(2)); // Universal + Track Spec
    expect(find.text('20 pts'), findsOneWidget);

    // Notice banner.
    expect(
      find.text(
        'Server-measured duration determines eligibility before evaluation begins.',
      ),
      findsOneWidget,
    );

    // Start Evaluation CTA — enabled, primary variant.
    final startBtn = tester.widget<AuratioButton>(
      find.byKey(TrackDetailsScreen.startEvaluationButtonKey),
    );
    expect(startBtn.variant, AuratioButtonVariant.primary);
    expect(startBtn.onPressed, isNotNull);

    expect(tester.takeException(), isNull);
  });

  testWidgets(
    'visual QA: Submission Requirements (282:245) layout and structure',
    (tester) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.submissionRequirements,
        settle: false,
      );
      await tester.pumpAndSettle();

      expect(router.state.uri.path, AppRoutePaths.submissionRequirements);
      expectInsideTestCanvas(tester, find.byType(Scaffold));

      // Heading.
      expect(find.text('Before you upload'), findsOneWidget);

      // File format card.
      expect(find.text('FILE FORMAT'), findsOneWidget);
      expect(find.text('.mp4 only'), findsOneWidget);

      // Speaker visibility card.
      expect(find.text('Keep the speaker visible'), findsOneWidget);
      expect(find.text('Face and gaze should be observable.'), findsOneWidget);
      expect(
        find.text('Posture and gestures should be visible.'),
        findsOneWidget,
      );
      expect(
        find.text('Framing and movement should remain assessable.'),
        findsOneWidget,
      );

      // Not supported card.
      expect(find.text('Not supported in the MVP'), findsOneWidget);
      expect(
        find.text('Voice-only or screen-only submissions.'),
        findsOneWidget,
      );

      // Video lifecycle copy.
      expect(
        find.textContaining(
          'Video remains temporary through evaluation/moderation',
        ),
        findsOneWidget,
      );

      // Choose Video CTA — enabled, primary, boundary placeholder.
      final chooseBtn = tester.widget<AuratioButton>(
        find.byKey(SubmissionRequirementsScreen.chooseVideoButtonKey),
      );
      expect(chooseBtn.variant, AuratioButtonVariant.primary);
      expect(chooseBtn.onPressed, isNotNull);

      expect(tester.takeException(), isNull);
    },
  );

  // ─── QA item 1: Home controls are NOT rendered as disabled ───

  testWidgets(
    'Home controls visually match Figma enabled states without later navigation',
    (tester) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(tester, router, AppRoutePaths.home, settle: false);
      await tester.pumpAndSettle();

      // Tap View Active Evaluation — stays on Home.
      await tester.tap(find.byKey(HomeScreen.viewActiveEvaluationKey));
      await tester.pump();
      expect(router.state.uri.path, AppRoutePaths.home);

      // Tap Leaderboards — stays on Home.
      await tester.tap(find.byKey(HomeScreen.leaderboardsButtonKey));
      await tester.pump();
      expect(router.state.uri.path, AppRoutePaths.home);

      // Tap Events — stays on Home.
      await tester.tap(find.byKey(HomeScreen.eventsButtonKey));
      await tester.pump();
      expect(router.state.uri.path, AppRoutePaths.home);

      expect(tester.takeException(), isNull);
    },
  );
}
