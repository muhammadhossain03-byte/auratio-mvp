import 'package:auratio_mobile/app/router/app_route_paths.dart';
import 'package:auratio_mobile/features/shared/presentation/widgets/auratio_screen_header.dart';
import 'package:auratio_mobile/features/submissions/presentation/screens/checking_recording_screen.dart';
import 'package:auratio_mobile/features/submissions/presentation/screens/recording_accepted_screen.dart';
import 'package:auratio_mobile/features/submissions/presentation/screens/upload_recording_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/auratio_test_harness.dart';

void main() {
  group('Batch 4 Exact Figma Geometry Verification at 390 × 844', () {
    testWidgets(
      'Upload Recording (282:270) rendered rectangles match Figma metadata',
      (tester) async {
        final router = await pumpAuratioApp(tester);
        await openAuratioRoute(
          tester,
          router,
          AppRoutePaths.uploadRecording,
          settle: false,
        );
        await tester.pumpAndSettle();

        // Header: height 92
        final headerFinder = find.byType(AuratioScreenHeader);
        expect(headerFinder, findsOneWidget);
        final headerRect = tester.getRect(headerFinder);
        expect(headerRect.top, 0.0);
        expect(headerRect.height, 92.0);

        // Track Card: Rect(20, 112, 350, 94)
        final trackCardFinder = find.ancestor(
          of: find.text('Business Pitch / Sales Pitch'),
          matching: find.byType(SizedBox),
        );
        expect(trackCardFinder, findsWidgets);
        final trackCardRect = tester.getRect(trackCardFinder.first);
        expect(trackCardRect.left, 20.0);
        expect(trackCardRect.top, 112.0);
        expect(trackCardRect.width, 350.0);
        expect(trackCardRect.height, 94.0);

        // Upload zone: Rect(20, 228, 350, 220)
        final uploadZoneFinder = find.byKey(
          UploadRecordingScreen.uploadZoneKey,
        );
        expect(uploadZoneFinder, findsOneWidget);
        final uploadZoneRect = tester.getRect(uploadZoneFinder);
        expect(uploadZoneRect.left, 20.0);
        expect(uploadZoneRect.top, 228.0);
        expect(uploadZoneRect.width, 350.0);
        expect(uploadZoneRect.height, 220.0);

        // Selected file card: Rect(20, 468, 350, 104)
        final selectedFileFinder = find.byKey(
          UploadRecordingScreen.selectedFileCardKey,
        );
        expect(selectedFileFinder, findsOneWidget);
        final selectedFileRect = tester.getRect(selectedFileFinder);
        expect(selectedFileRect.left, 20.0);
        expect(selectedFileRect.top, 468.0);
        expect(selectedFileRect.width, 350.0);
        expect(selectedFileRect.height, 104.0);

        // BEFORE CONTINUING label at y=592
        final beforeFinder = find.text('BEFORE CONTINUING');
        expect(beforeFinder, findsOneWidget);
        final beforeRect = tester.getRect(beforeFinder);
        expect(beforeRect.left, 20.0);
        expect(beforeRect.top, 592.0);

        // Check rows at y=620, y=650, y=680
        final check1Finder = find.text('.mp4 only');
        expect(check1Finder, findsOneWidget);
        final check1Rect = tester.getRect(check1Finder);
        expect(check1Rect.top, 620.0);

        final check2Finder = find.text('Speaker-visible recording');
        expect(check2Finder, findsOneWidget);
        final check2Rect = tester.getRect(check2Finder);
        expect(check2Rect.top, 650.0);

        final check3Finder = find.text(
          'Duration will be measured on the server',
        );
        expect(check3Finder, findsOneWidget);
        final check3Rect = tester.getRect(check3Finder);
        expect(check3Rect.top, 680.0);

        // Primary CTA (Upload & Check): Rect(20, 734, 350, 48)
        final ctaFinder = find.byKey(
          UploadRecordingScreen.uploadAndCheckButtonKey,
        );
        expect(ctaFinder, findsOneWidget);
        final ctaRect = tester.getRect(ctaFinder);
        expect(ctaRect.left, 20.0);
        expect(ctaRect.top, 734.0);
        expect(ctaRect.width, 350.0);
        expect(ctaRect.height, 48.0);

        // Footer disclaimer at y=792
        final footerFinder = find.text(
          'No AI evaluation or Human assignment starts before eligibility passes.',
        );
        expect(footerFinder, findsOneWidget);
        final footerRect = tester.getRect(footerFinder);
        expect(footerRect.top, 792.0);
      },
    );

    testWidgets(
      'Checking Recording (282:295) rendered rectangles match Figma metadata',
      (tester) async {
        final router = await pumpAuratioApp(tester);
        await openAuratioRoute(
          tester,
          router,
          AppRoutePaths.checkingRecording,
          settle: false,
        );
        await tester.pump(const Duration(milliseconds: 100));

        // Header: height 92
        final headerFinder = find.byType(AuratioScreenHeader);
        expect(headerFinder, findsOneWidget);
        final headerRect = tester.getRect(headerFinder);
        expect(headerRect.top, 0.0);
        expect(headerRect.height, 92.0);

        // Circle status container: Rect(155, 226, 80, 80)
        final indicatorFinder = find.byKey(
          CheckingRecordingScreen.checkingIndicatorKey,
        );
        expect(indicatorFinder, findsOneWidget);
        final indicatorRect = tester.getRect(indicatorFinder);
        expect(indicatorRect.left, 155.0);
        expect(indicatorRect.top, 226.0);
        expect(indicatorRect.width, 80.0);
        expect(indicatorRect.height, 80.0);

        // Heading "Checking eligibility" at y=330
        final headingFinder = find.text('Checking eligibility');
        expect(headingFinder, findsOneWidget);
        final headingRect = tester.getRect(headingFinder);
        expect(headingRect.top, 330.0);

        // Subtitle at y=378
        final subtitleFinder = find.text(
          'Uploading the recording and measuring duration on the server.',
        );
        expect(subtitleFinder, findsOneWidget);
        final subtitleRect = tester.getRect(subtitleFinder);
        expect(subtitleRect.top, 378.0);

        // Information card: Rect(20, 444, 350, 112)
        final infoCardFinder = find.byKey(
          CheckingRecordingScreen.checkingInfoCardKey,
        );
        expect(infoCardFinder, findsOneWidget);
        final infoCardRect = tester.getRect(infoCardFinder);
        expect(infoCardRect.left, 20.0);
        expect(infoCardRect.top, 444.0);
        expect(infoCardRect.width, 350.0);
        expect(infoCardRect.height, 112.0);

        // Bottom control: Rect(20, 750, 350, 48)
        final bottomBtnFinder = find.byKey(
          CheckingRecordingScreen.checkingButtonKey,
        );
        expect(bottomBtnFinder, findsOneWidget);
        final bottomBtnRect = tester.getRect(bottomBtnFinder);
        expect(bottomBtnRect.left, 20.0);
        expect(bottomBtnRect.top, 750.0);
        expect(bottomBtnRect.width, 350.0);
        expect(bottomBtnRect.height, 48.0);
      },
    );

    testWidgets(
      'Recording Accepted (282:311) rendered rectangles match Figma metadata',
      (tester) async {
        final router = await pumpAuratioApp(tester);
        await openAuratioRoute(
          tester,
          router,
          AppRoutePaths.recordingAccepted,
          settle: false,
        );
        await tester.pump(const Duration(milliseconds: 100));

        // Header: height 92
        final headerFinder = find.byType(AuratioScreenHeader);
        expect(headerFinder, findsOneWidget);
        final headerRect = tester.getRect(headerFinder);
        expect(headerRect.top, 0.0);
        expect(headerRect.height, 92.0);

        // Status badge (Eligible): Rect(20, 116, 80, 30)
        final badgeFinder = find.byKey(
          RecordingAcceptedScreen.eligibleBadgeKey,
        );
        expect(badgeFinder, findsOneWidget);
        final badgeRect = tester.getRect(badgeFinder);
        expect(badgeRect.left, 20.0);
        expect(badgeRect.top, 116.0);
        expect(badgeRect.width, 80.0);
        expect(badgeRect.height, 30.0);

        // Heading "Recording is eligible" at y=164
        final headingFinder = find.text('Recording is eligible');
        expect(headingFinder, findsOneWidget);
        final headingRect = tester.getRect(headingFinder);
        expect(headingRect.left, 20.0);
        expect(headingRect.top, 164.0);

        // Subheading at y=206
        final subFinder = find.text(
          'The server-measured duration falls within the accepted window for this track.',
        );
        expect(subFinder, findsOneWidget);
        final subRect = tester.getRect(subFinder);
        expect(subRect.left, 20.0);
        expect(subRect.top, 206.0);

        // Measured duration card: Rect(20, 274, 350, 126)
        final measuredFinder = find.byKey(
          RecordingAcceptedScreen.measuredDurationCardKey,
        );
        expect(measuredFinder, findsOneWidget);
        final measuredRect = tester.getRect(measuredFinder);
        expect(measuredRect.left, 20.0);
        expect(measuredRect.top, 274.0);
        expect(measuredRect.width, 350.0);
        expect(measuredRect.height, 126.0);

        // Eligibility passed card: Rect(20, 418, 350, 104)
        final passedFinder = find.byKey(
          RecordingAcceptedScreen.eligibilityPassedCardKey,
        );
        expect(passedFinder, findsOneWidget);
        final passedRect = tester.getRect(passedFinder);
        expect(passedRect.left, 20.0);
        expect(passedRect.top, 418.0);
        expect(passedRect.width, 350.0);
        expect(passedRect.height, 104.0);

        // Hint "Next: AI Evaluation or Human Evaluation" at y=552
        final hintFinder = find.text('Next: AI Evaluation or Human Evaluation');
        expect(hintFinder, findsOneWidget);
        final hintRect = tester.getRect(hintFinder);
        expect(hintRect.left, 20.0);
        expect(hintRect.top, 552.0);

        // Continue CTA: Rect(20, 750, 350, 48)
        final continueFinder = find.byKey(
          RecordingAcceptedScreen.continueButtonKey,
        );
        expect(continueFinder, findsOneWidget);
        final continueRect = tester.getRect(continueFinder);
        expect(continueRect.left, 20.0);
        expect(continueRect.top, 750.0);
        expect(continueRect.width, 350.0);
        expect(continueRect.height, 48.0);
      },
    );
  });
}
