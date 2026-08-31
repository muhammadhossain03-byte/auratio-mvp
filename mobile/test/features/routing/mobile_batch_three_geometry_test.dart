import 'package:auratio_mobile/app/router/app_route_paths.dart';
import 'package:auratio_mobile/features/home/presentation/screens/home_screen.dart';
import 'package:auratio_mobile/features/shared/presentation/widgets/auratio_screen_header.dart';
import 'package:auratio_mobile/features/submissions/presentation/screens/submission_requirements_screen.dart';
import 'package:auratio_mobile/features/tracks/presentation/screens/track_details_screen.dart';
import 'package:auratio_mobile/features/tracks/presentation/screens/tracks_screen.dart';
import 'package:auratio_mobile/foundation/design_system/auratio_design_system.dart';
import 'package:auratio_mobile/foundation/navigation/auratio_navigation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/auratio_test_harness.dart';

void main() {
  group('Batch 3 Exact Figma Geometry Verification at 390 × 844', () {
    testWidgets('Home (282:136) rendered rectangles match Figma metadata', (
      tester,
    ) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(tester, router, AppRoutePaths.home, settle: false);
      await tester.pumpAndSettle();

      // Recent Evaluation label starts at y=244
      final recentLabelFinder = find.text('RECENT EVALUATION');
      expect(recentLabelFinder, findsOneWidget);
      final recentLabelRect = tester.getRect(recentLabelFinder);
      expect(recentLabelRect.top, 244.0);
      expect(recentLabelRect.left, 20.0);

      // Recent Evaluation card: Rect(20, 270, 350, 120)
      final recentCardFinder = find.byKey(HomeScreen.recentEvaluationCardKey);
      expect(recentCardFinder, findsOneWidget);
      final recentCardRect = tester.getRect(recentCardFinder);
      expect(recentCardRect.left, 20.0);
      expect(recentCardRect.top, 270.0);
      expect(recentCardRect.width, 350.0);
      expect(recentCardRect.height, 120.0);

      // Status badge starts at y=344
      final statusBadgeFinder = find.text('Pending Moderation');
      expect(statusBadgeFinder, findsOneWidget);
      final statusBadgeRect = tester.getRect(statusBadgeFinder);
      expect(statusBadgeRect.top, greaterThanOrEqualTo(340.0));
      expect(statusBadgeRect.top, lessThanOrEqualTo(350.0));

      // Private Progress label starts at y=408
      final progressLabelFinder = find.text('PRIVATE PROGRESS');
      expect(progressLabelFinder, findsOneWidget);
      final progressLabelRect = tester.getRect(progressLabelFinder);
      expect(progressLabelRect.top, 408.0);
      expect(progressLabelRect.left, 20.0);

      // Private Progress card: Rect(20, 434, 350, 114)
      final progressCardFinder = find.byKey(HomeScreen.privateProgressCardKey);
      expect(progressCardFinder, findsOneWidget);
      final progressCardRect = tester.getRect(progressCardFinder);
      expect(progressCardRect.left, 20.0);
      expect(progressCardRect.top, 434.0);
      expect(progressCardRect.width, 350.0);
      expect(progressCardRect.height, 114.0);

      // Leaderboards button: Rect(20, 550, 170, 40)
      final lbFinder = find.byKey(HomeScreen.leaderboardsButtonKey);
      expect(lbFinder, findsOneWidget);
      final lbRect = tester.getRect(lbFinder);
      expect(lbRect.left, 20.0);
      expect(lbRect.top, 550.0);
      expect(lbRect.width, 170.0);
      expect(lbRect.height, 40.0);

      // Events button: Rect(200, 550, 170, 40)
      final evFinder = find.byKey(HomeScreen.eventsButtonKey);
      expect(evFinder, findsOneWidget);
      final evRect = tester.getRect(evFinder);
      expect(evRect.left, 200.0);
      expect(evRect.top, 550.0);
      expect(evRect.width, 170.0);
      expect(evRect.height, 40.0);

      // Your Paths label starts at y=654
      final pathsLabelFinder = find.text('YOUR PATHS');
      expect(pathsLabelFinder, findsOneWidget);
      final pathsLabelRect = tester.getRect(pathsLabelFinder);
      expect(pathsLabelRect.top, 654.0);
      expect(pathsLabelRect.left, 20.0);

      // Visible path pills start at y=678, height=34
      final chipFinder = find.byType(AuratioChipTab);
      expect(chipFinder, findsWidgets);
      final firstChipRect = tester.getRect(chipFinder.first);
      expect(firstChipRect.top, 678.0);
      expect(firstChipRect.height, 34.0);

      // Bottom nav bar: Rect(0, 770, 390, 74)
      final navFinder = find.byType(AuratioMobileNavigationBar);
      expect(navFinder, findsOneWidget);
      final navRect = tester.getRect(navFinder);
      expect(navRect.left, 0.0);
      expect(navRect.top, 770.0);
      expect(navRect.width, 390.0);
      expect(navRect.height, 74.0);
    });

    testWidgets('Tracks (288:55) rendered rectangles match Figma metadata', (
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

      // Header: Rect(0, 0, 390, 92)
      final headerFinder = find.byType(AuratioScreenHeader);
      expect(headerFinder, findsOneWidget);
      final headerRect = tester.getRect(headerFinder);
      expect(headerRect.top, 0.0);
      expect(headerRect.height, 92.0);

      // Filter pills at y=110, h=32
      final allChipFinder = find.widgetWithText(AuratioChipTab, 'All');
      expect(allChipFinder, findsOneWidget);
      final allChipRect = tester.getRect(allChipFinder);
      expect(allChipRect.top, 110.0);
      expect(allChipRect.height, 32.0);

      // PUBLIC SPEAKING label: y=164
      final psLabelFinder = find.text('PUBLIC SPEAKING');
      expect(psLabelFinder, findsOneWidget);
      final psLabelRect = tester.getRect(psLabelFinder);
      expect(psLabelRect.top, 164.0);

      // Business Pitch / Sales Pitch row at y=462
      final bpFinder = find.byKey(TracksScreen.businessPitchTrackKey);
      expect(bpFinder, findsOneWidget);
      final bpRect = tester.getRect(bpFinder);
      expect(bpRect.left, 20.0);
      expect(bpRect.width, 350.0);
      expect(bpRect.height, 34.0);

      // Bottom navigation: Rect(0, 770, 390, 74)
      final navFinder = find.byType(AuratioMobileNavigationBar);
      expect(navFinder, findsOneWidget);
      final navRect = tester.getRect(navFinder);
      expect(navRect.left, 0.0);
      expect(navRect.top, 770.0);
      expect(navRect.width, 390.0);
      expect(navRect.height, 74.0);
    });

    testWidgets(
      'Track Details (282:221) rendered rectangles match Figma metadata',
      (tester) async {
        final router = await pumpAuratioApp(tester);
        await openAuratioRoute(
          tester,
          router,
          AppRoutePaths.trackDetails,
          settle: false,
        );
        await tester.pumpAndSettle();

        // Path badge at y=112, h=34
        final badgeFinder = find.widgetWithText(
          AuratioChipTab,
          'Professional Presenting',
        );
        expect(badgeFinder, findsOneWidget);
        final badgeRect = tester.getRect(badgeFinder);
        expect(badgeRect.top, 112.0);
        expect(badgeRect.height, 34.0);

        // Title at y=162
        final titleFinder = find.text('Business Pitch / Sales Pitch');
        expect(titleFinder, findsOneWidget);
        final titleRect = tester.getRect(titleFinder);
        expect(titleRect.top, 162.0);

        // Duration card at y=264, h=104, w=350
        final durationCardFinder = find.ancestor(
          of: find.text('Duration'),
          matching: find.byType(SizedBox),
        );
        expect(durationCardFinder, findsWidgets);
        final durationCardRect = tester.getRect(durationCardFinder.first);
        expect(durationCardRect.left, 20.0);
        expect(durationCardRect.top, 264.0);
        expect(durationCardRect.width, 350.0);
        expect(durationCardRect.height, 104.0);

        // Recording card at y=382, h=126, w=350
        final recordingCardFinder = find.ancestor(
          of: find.text('Recording requirement'),
          matching: find.byType(SizedBox),
        );
        expect(recordingCardFinder, findsWidgets);
        final recordingCardRect = tester.getRect(recordingCardFinder.first);
        expect(recordingCardRect.left, 20.0);
        expect(recordingCardRect.top, 382.0);
        expect(recordingCardRect.width, 350.0);
        expect(recordingCardRect.height, 126.0);

        // EVALUATION STRUCTURE at y=532
        final structLabelFinder = find.text('EVALUATION STRUCTURE');
        expect(structLabelFinder, findsOneWidget);
        final structLabelRect = tester.getRect(structLabelFinder);
        expect(structLabelRect.top, 532.0);

        // Start Evaluation CTA at y=754, h=48, w=350
        final startBtnFinder = find.byKey(
          TrackDetailsScreen.startEvaluationButtonKey,
        );
        expect(startBtnFinder, findsOneWidget);
        final startBtnRect = tester.getRect(startBtnFinder);
        expect(startBtnRect.left, 20.0);
        expect(startBtnRect.top, 754.0);
        expect(startBtnRect.width, 350.0);
        expect(startBtnRect.height, 48.0);
      },
    );

    testWidgets(
      'Submission Requirements (282:245) rendered rectangles match Figma metadata',
      (tester) async {
        final router = await pumpAuratioApp(tester);
        await openAuratioRoute(
          tester,
          router,
          AppRoutePaths.submissionRequirements,
          settle: false,
        );
        await tester.pumpAndSettle();

        // Heading at y=120
        final headingFinder = find.text('Before you upload');
        expect(headingFinder, findsOneWidget);
        final headingRect = tester.getRect(headingFinder);
        expect(headingRect.top, 120.0);

        // File format card at y=216, h=76, w=350
        final formatFinder = find.ancestor(
          of: find.text('.mp4 only'),
          matching: find.byType(SizedBox),
        );
        expect(formatFinder, findsWidgets);
        final formatRect = tester.getRect(formatFinder.first);
        expect(formatRect.left, 20.0);
        expect(formatRect.top, 216.0);
        expect(formatRect.width, 350.0);
        expect(formatRect.height, 76.0);

        // Speaker visible card at y=310, h=168, w=350
        final speakerFinder = find.ancestor(
          of: find.text('Keep the speaker visible'),
          matching: find.byType(SizedBox),
        );
        expect(speakerFinder, findsWidgets);
        final speakerRect = tester.getRect(speakerFinder.first);
        expect(speakerRect.left, 20.0);
        expect(speakerRect.top, 310.0);
        expect(speakerRect.width, 350.0);
        expect(speakerRect.height, 168.0);

        // Unsupported card at y=496, h=82, w=350
        final unsupportedFinder = find.ancestor(
          of: find.text('Not supported in the MVP'),
          matching: find.byType(SizedBox),
        );
        expect(unsupportedFinder, findsWidgets);
        final unsupportedRect = tester.getRect(unsupportedFinder.first);
        expect(unsupportedRect.left, 20.0);
        expect(unsupportedRect.top, 496.0);
        expect(unsupportedRect.width, 350.0);
        expect(unsupportedRect.height, 82.0);

        // Choose Video CTA at y=750, h=48, w=350
        final chooseBtnFinder = find.byKey(
          SubmissionRequirementsScreen.chooseVideoButtonKey,
        );
        expect(chooseBtnFinder, findsOneWidget);
        final chooseBtnRect = tester.getRect(chooseBtnFinder);
        expect(chooseBtnRect.left, 20.0);
        expect(chooseBtnRect.top, 750.0);
        expect(chooseBtnRect.width, 350.0);
        expect(chooseBtnRect.height, 48.0);
      },
    );
  });
}
