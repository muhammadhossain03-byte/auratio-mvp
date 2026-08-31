import 'package:auratio_mobile/app/router/app_route_paths.dart';
import 'package:auratio_mobile/features/submissions/presentation/screens/checking_recording_screen.dart';
import 'package:auratio_mobile/features/submissions/presentation/screens/recording_accepted_screen.dart';
import 'package:auratio_mobile/features/submissions/presentation/screens/submission_requirements_screen.dart';
import 'package:auratio_mobile/features/submissions/presentation/screens/upload_recording_screen.dart';
import 'package:auratio_mobile/foundation/design_system/auratio_design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/auratio_test_harness.dart';

void main() {
  const screens = <_BatchScreenCase>[
    _BatchScreenCase(
      name: 'Upload Recording',
      path: AppRoutePaths.uploadRecording,
      identifyingCopy: 'Upload Recording',
      ctaLabel: 'Upload & Check',
    ),
    _BatchScreenCase(
      name: 'Checking Recording',
      path: AppRoutePaths.checkingRecording,
      identifyingCopy: 'Checking eligibility',
      ctaLabel: null,
    ),
    _BatchScreenCase(
      name: 'Recording Accepted',
      path: AppRoutePaths.recordingAccepted,
      identifyingCopy: 'Recording is eligible',
      ctaLabel: 'Continue',
    ),
  ];

  for (final screen in screens) {
    testWidgets('${screen.name} route renders without overflow at 390 x 844', (
      tester,
    ) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(tester, router, screen.path, settle: false);
      if (screen.path == AppRoutePaths.checkingRecording) {
        await tester.pump(const Duration(milliseconds: 200));
      } else {
        await tester.pumpAndSettle();
      }

      expect(router.state.uri.path, screen.path);
      expect(find.text(screen.identifyingCopy), findsWidgets);
      expectInsideTestCanvas(tester, find.byType(Scaffold));
      if (screen.ctaLabel != null) {
        expectInsideTestCanvas(
          tester,
          find.widgetWithText(AuratioButton, screen.ctaLabel!),
        );
      }
      expect(tester.takeException(), isNull);
    });
  }

  testWidgets(
    'Submission Requirements -> Upload Recording -> Checking Recording -> Recording Accepted complete flow',
    (tester) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.submissionRequirements,
        settle: false,
      );
      await tester.pumpAndSettle();

      // 1. On Submission Requirements
      expect(router.state.uri.path, AppRoutePaths.submissionRequirements);

      // Tap Choose Video -> navigates to Upload Recording
      final chooseVideoBtn = find.byKey(
        SubmissionRequirementsScreen.chooseVideoButtonKey,
      );
      expect(chooseVideoBtn, findsOneWidget);
      await tester.tap(chooseVideoBtn);
      await tester.pumpAndSettle();

      // 2. On Upload Recording
      expect(router.state.uri.path, AppRoutePaths.uploadRecording);
      expect(find.text('Upload Recording'), findsOneWidget);
      expect(find.text('business-pitch.mp4'), findsOneWidget);
      expect(find.text('Accepted upload window 2:30–5:30'), findsOneWidget);
      expect(find.text('.mp4 only'), findsOneWidget);
      expect(find.text('Speaker-visible recording'), findsOneWidget);
      expect(
        find.text('Duration will be measured on the server'),
        findsOneWidget,
      );

      // Tap Upload & Check -> navigates to Checking Recording
      final uploadCheckBtn = find.byKey(
        UploadRecordingScreen.uploadAndCheckButtonKey,
      );
      expect(uploadCheckBtn, findsOneWidget);
      await tester.tap(uploadCheckBtn);
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 200));

      // 3. On Checking Recording
      expect(router.state.uri.path, AppRoutePaths.checkingRecording);
      expect(find.text('Checking Recording'), findsOneWidget);
      expect(find.text('Checking eligibility'), findsOneWidget);
      expect(
        find.text(
          'Uploading the recording and measuring duration on the server.',
        ),
        findsOneWidget,
      );
      expect(find.text('Accepted duration: 2:30–5:30'), findsOneWidget);
      expect(
        find.text('Evaluation will not begin until this check passes.'),
        findsOneWidget,
      );
      expect(find.text('Checking…'), findsOneWidget);

      // Wait for authoritative 1200ms timeout -> navigates to Recording Accepted
      await tester.pump(const Duration(milliseconds: 1050));
      await tester.pumpAndSettle();

      // 4. On Recording Accepted
      expect(router.state.uri.path, AppRoutePaths.recordingAccepted);
      expect(find.text('Recording Accepted'), findsOneWidget);
      expect(find.text('Eligible'), findsOneWidget);
      expect(find.text('Recording is eligible'), findsOneWidget);
      expect(
        find.text(
          'The server-measured duration falls within the accepted window for this track.',
        ),
        findsOneWidget,
      );
      expect(find.text('MEASURED DURATION'), findsOneWidget);
      expect(find.text('4:12'), findsOneWidget);
      expect(find.text('Accepted window 2:30–5:30'), findsOneWidget);
      expect(find.text('Eligibility passed'), findsOneWidget);
      expect(
        find.text('You can now choose how this performance will be evaluated.'),
        findsOneWidget,
      );
      expect(
        find.text('Next: AI Evaluation or Human Evaluation'),
        findsOneWidget,
      );
    },
  );

  testWidgets(
    'Checking Recording auto-transitions to Recording Accepted after authoritative 1200ms timeout',
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

      // Advance by 800ms (total 1000ms from start): still on Checking Recording
      await tester.pump(const Duration(milliseconds: 800));
      expect(router.state.uri.path, AppRoutePaths.checkingRecording);

      // Advance remaining 300ms (total >1200ms): navigates to Recording Accepted
      await tester.pump(const Duration(milliseconds: 300));
      await tester.pumpAndSettle();

      expect(router.state.uri.path, AppRoutePaths.recordingAccepted);
    },
  );

  testWidgets(
    'Checking Recording bottom control is non-interactive and tapping it does not advance early',
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

      final checkingControl = find.byKey(
        CheckingRecordingScreen.checkingButtonKey,
      );
      expect(checkingControl, findsOneWidget);

      // Tap on Checking control before timeout
      await tester.tap(checkingControl);
      await tester.pump(const Duration(milliseconds: 100));

      // Remains on Checking Recording (no early advancement)
      expect(router.state.uri.path, AppRoutePaths.checkingRecording);
    },
  );

  testWidgets('Back navigation from all three Batch 4 screens', (tester) async {
    final router = await pumpAuratioApp(tester);

    // 1. Back from Upload Recording -> Submission Requirements
    await openAuratioRoute(
      tester,
      router,
      AppRoutePaths.uploadRecording,
      settle: false,
    );
    await tester.pumpAndSettle();
    expect(router.state.uri.path, AppRoutePaths.uploadRecording);

    await tester.tap(find.bySemanticsLabel('Back'));
    await tester.pumpAndSettle();
    expect(router.state.uri.path, AppRoutePaths.submissionRequirements);

    // 2. Back from Checking Recording -> Upload Recording
    await openAuratioRoute(
      tester,
      router,
      AppRoutePaths.checkingRecording,
      settle: false,
    );
    await tester.pump(const Duration(milliseconds: 200));
    expect(router.state.uri.path, AppRoutePaths.checkingRecording);

    await tester.tap(find.bySemanticsLabel('Back'));
    await tester.pumpAndSettle();
    expect(router.state.uri.path, AppRoutePaths.uploadRecording);

    // 3. Back from Recording Accepted -> Upload Recording
    await openAuratioRoute(
      tester,
      router,
      AppRoutePaths.recordingAccepted,
      settle: false,
    );
    await tester.pumpAndSettle();
    expect(router.state.uri.path, AppRoutePaths.recordingAccepted);

    await tester.tap(find.bySemanticsLabel('Back'));
    await tester.pumpAndSettle();
    expect(router.state.uri.path, AppRoutePaths.uploadRecording);
  });

  testWidgets(
    'Recording Accepted Continue button stays at Batch 5 boundary without throw',
    (tester) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.recordingAccepted,
        settle: false,
      );
      await tester.pumpAndSettle();

      final continueBtn = find.byKey(RecordingAcceptedScreen.continueButtonKey);
      expect(continueBtn, findsOneWidget);

      await tester.tap(continueBtn);
      await tester.pump();

      // Confirms we stay on Recording Accepted and do not enter unimplemented 282:331
      expect(router.state.uri.path, AppRoutePaths.recordingAccepted);
      expect(tester.takeException(), isNull);
    },
  );

  testWidgets('Locked copy assertions across Batch 4 screens', (tester) async {
    final router = await pumpAuratioApp(tester);

    // Upload Recording copy
    await openAuratioRoute(
      tester,
      router,
      AppRoutePaths.uploadRecording,
      settle: false,
    );
    await tester.pumpAndSettle();
    expect(find.text('Upload Recording'), findsOneWidget);
    expect(find.text('Business Pitch / Sales Pitch'), findsOneWidget);
    expect(find.text('Accepted upload window 2:30–5:30'), findsOneWidget);
    expect(find.text('Choose an .mp4 recording'), findsOneWidget);
    expect(
      find.text('Speaker must remain visible throughout the performance.'),
      findsOneWidget,
    );
    expect(find.text('business-pitch.mp4'), findsOneWidget);
    expect(
      find.text(
        'Selected file • upload is not evaluated until eligibility passes.',
      ),
      findsOneWidget,
    );
    expect(find.text('BEFORE CONTINUING'), findsOneWidget);
    expect(find.text('.mp4 only'), findsOneWidget);
    expect(find.text('Speaker-visible recording'), findsOneWidget);
    expect(
      find.text('Duration will be measured on the server'),
      findsOneWidget,
    );
    expect(find.text('Upload & Check'), findsOneWidget);
    expect(
      find.text(
        'No AI evaluation or Human assignment starts before eligibility passes.',
      ),
      findsOneWidget,
    );

    // Checking Recording copy
    await openAuratioRoute(
      tester,
      router,
      AppRoutePaths.checkingRecording,
      settle: false,
    );
    await tester.pump(const Duration(milliseconds: 200));
    expect(find.text('Checking Recording'), findsOneWidget);
    expect(find.text('Checking eligibility'), findsOneWidget);
    expect(
      find.text(
        'Uploading the recording and measuring duration on the server.',
      ),
      findsOneWidget,
    );
    expect(find.text('Business Pitch / Sales Pitch'), findsOneWidget);
    expect(find.text('Accepted duration: 2:30–5:30'), findsOneWidget);
    expect(
      find.text('Evaluation will not begin until this check passes.'),
      findsOneWidget,
    );
    expect(find.text('Checking…'), findsOneWidget);

    // Recording Accepted copy
    await openAuratioRoute(
      tester,
      router,
      AppRoutePaths.recordingAccepted,
      settle: false,
    );
    await tester.pumpAndSettle();
    expect(find.text('Recording Accepted'), findsOneWidget);
    expect(find.text('Eligible'), findsOneWidget);
    expect(find.text('Recording is eligible'), findsOneWidget);
    expect(
      find.text(
        'The server-measured duration falls within the accepted window for this track.',
      ),
      findsOneWidget,
    );
    expect(find.text('MEASURED DURATION'), findsOneWidget);
    expect(find.text('4:12'), findsOneWidget);
    expect(find.text('Accepted window 2:30–5:30'), findsOneWidget);
    expect(find.text('Eligibility passed'), findsOneWidget);
    expect(
      find.text('You can now choose how this performance will be evaluated.'),
      findsOneWidget,
    );
    expect(
      find.text('Next: AI Evaluation or Human Evaluation'),
      findsOneWidget,
    );
    expect(find.text('Continue'), findsOneWidget);
  });
}

class _BatchScreenCase {
  const _BatchScreenCase({
    required this.name,
    required this.path,
    required this.identifyingCopy,
    this.ctaLabel,
  });

  final String name;
  final String path;
  final String identifyingCopy;
  final String? ctaLabel;
}
