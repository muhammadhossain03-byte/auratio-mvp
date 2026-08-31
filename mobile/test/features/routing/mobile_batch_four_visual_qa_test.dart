import 'package:auratio_mobile/app/router/app_route_paths.dart';
import 'package:auratio_mobile/features/shared/presentation/widgets/auratio_screen_header.dart';
import 'package:auratio_mobile/features/submissions/presentation/screens/checking_recording_screen.dart';
import 'package:auratio_mobile/features/submissions/presentation/screens/recording_accepted_screen.dart';
import 'package:auratio_mobile/features/submissions/presentation/screens/upload_recording_screen.dart';
import 'package:auratio_mobile/foundation/design_system/auratio_design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/auratio_test_harness.dart';

void main() {
  testWidgets(
    'visual QA: Upload Recording (282:270) layout and control states',
    (tester) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.uploadRecording,
        settle: false,
      );
      await tester.pumpAndSettle();

      expect(router.state.uri.path, AppRoutePaths.uploadRecording);
      expectInsideTestCanvas(tester, find.byType(Scaffold));

      // Header with Back button
      expect(find.byType(AuratioScreenHeader), findsOneWidget);
      expect(find.text('Upload Recording'), findsOneWidget);

      // Track Card
      expect(find.text('Business Pitch / Sales Pitch'), findsOneWidget);
      expect(find.text('Accepted upload window 2:30–5:30'), findsOneWidget);

      // Upload Zone
      expect(find.byKey(UploadRecordingScreen.uploadZoneKey), findsOneWidget);
      expect(find.byIcon(Icons.add), findsOneWidget);
      expect(find.text('Choose an .mp4 recording'), findsOneWidget);
      expect(
        find.text('Speaker must remain visible throughout the performance.'),
        findsOneWidget,
      );

      // Selected file card
      expect(
        find.byKey(UploadRecordingScreen.selectedFileCardKey),
        findsOneWidget,
      );
      expect(find.text('business-pitch.mp4'), findsOneWidget);

      // Checklist
      expect(find.text('BEFORE CONTINUING'), findsOneWidget);
      expect(find.text('.mp4 only'), findsOneWidget);
      expect(find.text('Speaker-visible recording'), findsOneWidget);
      expect(
        find.text('Duration will be measured on the server'),
        findsOneWidget,
      );

      // Primary CTA
      final cta = tester.widget<AuratioButton>(
        find.byKey(UploadRecordingScreen.uploadAndCheckButtonKey),
      );
      expect(cta.variant, AuratioButtonVariant.primary);
      expect(cta.onPressed, isNotNull);

      // Footer
      expect(
        find.text(
          'No AI evaluation or Human assignment starts before eligibility passes.',
        ),
        findsOneWidget,
      );

      expect(tester.takeException(), isNull);
    },
  );

  testWidgets(
    'visual QA: Checking Recording (282:295) layout and control states',
    (tester) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.checkingRecording,
        settle: false,
      );
      await tester.pump(const Duration(milliseconds: 200));

      expect(router.state.uri.path, AppRoutePaths.checkingRecording);
      expectInsideTestCanvas(tester, find.byType(Scaffold));

      // Header with Back button
      expect(find.byType(AuratioScreenHeader), findsOneWidget);
      expect(find.text('Checking Recording'), findsOneWidget);

      // Central indicator & copy
      expect(
        find.byKey(CheckingRecordingScreen.checkingIndicatorKey),
        findsOneWidget,
      );
      expect(find.text('↻'), findsOneWidget);
      expect(find.text('Checking eligibility'), findsOneWidget);
      expect(
        find.text(
          'Uploading the recording and measuring duration on the server.',
        ),
        findsOneWidget,
      );

      // Info card
      expect(
        find.byKey(CheckingRecordingScreen.checkingInfoCardKey),
        findsOneWidget,
      );
      expect(find.text('Accepted duration: 2:30–5:30'), findsOneWidget);
      expect(
        find.text('Evaluation will not begin until this check passes.'),
        findsOneWidget,
      );

      // Checking... bottom control
      expect(
        find.byKey(CheckingRecordingScreen.checkingButtonKey),
        findsOneWidget,
      );
      expect(find.text('Checking…'), findsOneWidget);

      expect(tester.takeException(), isNull);
    },
  );

  testWidgets(
    'visual QA: Recording Accepted (282:311) layout and control states',
    (tester) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.recordingAccepted,
        settle: false,
      );
      await tester.pumpAndSettle();

      expect(router.state.uri.path, AppRoutePaths.recordingAccepted);
      expectInsideTestCanvas(tester, find.byType(Scaffold));

      // Header with Back button
      expect(find.byType(AuratioScreenHeader), findsOneWidget);
      expect(find.text('Recording Accepted'), findsOneWidget);

      // Eligible badge
      expect(
        find.byKey(RecordingAcceptedScreen.eligibleBadgeKey),
        findsOneWidget,
      );
      expect(find.text('Eligible'), findsOneWidget);

      // Heading & Subheading
      expect(find.text('Recording is eligible'), findsOneWidget);
      expect(
        find.text(
          'The server-measured duration falls within the accepted window for this track.',
        ),
        findsOneWidget,
      );

      // Measured Duration Card
      expect(
        find.byKey(RecordingAcceptedScreen.measuredDurationCardKey),
        findsOneWidget,
      );
      expect(find.text('MEASURED DURATION'), findsOneWidget);
      expect(find.text('4:12'), findsOneWidget);
      expect(find.text('Accepted window 2:30–5:30'), findsOneWidget);

      // Eligibility Passed Card
      expect(
        find.byKey(RecordingAcceptedScreen.eligibilityPassedCardKey),
        findsOneWidget,
      );
      expect(find.text('Eligibility passed'), findsOneWidget);
      expect(
        find.text('You can now choose how this performance will be evaluated.'),
        findsOneWidget,
      );

      // Next hint
      expect(
        find.text('Next: AI Evaluation or Human Evaluation'),
        findsOneWidget,
      );

      // Continue CTA
      final continueBtn = tester.widget<AuratioButton>(
        find.byKey(RecordingAcceptedScreen.continueButtonKey),
      );
      expect(continueBtn.variant, AuratioButtonVariant.primary);
      expect(continueBtn.onPressed, isNotNull);

      expect(tester.takeException(), isNull);
    },
  );
}
