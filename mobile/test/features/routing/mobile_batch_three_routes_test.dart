import 'package:auratio_mobile/app/router/app_route_paths.dart';
import 'package:auratio_mobile/features/authentication/presentation/screens/sign_in_screen.dart';
import 'package:auratio_mobile/features/onboarding/application/path_selection_controller.dart';
import 'package:auratio_mobile/features/onboarding/domain/auratio_path.dart';
import 'package:auratio_mobile/features/onboarding/presentation/onboarding_keys.dart';
import 'package:auratio_mobile/features/submissions/presentation/screens/submission_requirements_screen.dart';
import 'package:auratio_mobile/features/tracks/domain/track_catalog.dart';
import 'package:auratio_mobile/features/tracks/presentation/screens/track_details_screen.dart';
import 'package:auratio_mobile/features/tracks/presentation/screens/tracks_screen.dart';
import 'package:auratio_mobile/foundation/design_system/auratio_design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/auratio_test_harness.dart';

void main() {
  const screens = <_BatchScreenCase>[
    _BatchScreenCase(
      name: 'Home',
      path: AppRoutePaths.home,
      identifyingCopy: 'Hello, Alex',
    ),
    _BatchScreenCase(
      name: 'Tracks',
      path: AppRoutePaths.tracks,
      identifyingCopy: 'Tracks',
    ),
    _BatchScreenCase(
      name: 'Track Details',
      path: AppRoutePaths.trackDetails,
      identifyingCopy: 'Business Pitch / Sales Pitch',
      ctaLabel: 'Start Evaluation',
    ),
    _BatchScreenCase(
      name: 'Submission Requirements',
      path: AppRoutePaths.submissionRequirements,
      identifyingCopy: 'Before you upload',
      ctaLabel: 'Choose Video',
    ),
  ];

  for (final screen in screens) {
    testWidgets('${screen.name} route renders without overflow at 390 x 844', (
      tester,
    ) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(tester, router, screen.path, settle: false);
      await tester.pump(const Duration(milliseconds: 100));

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

  testWidgets('returning Sign In navigates to Home', (tester) async {
    final router = await pumpAuratioApp(tester);
    await openAuratioRoute(tester, router, AppRoutePaths.signIn, settle: false);
    await tester.pump(const Duration(milliseconds: 100));

    expect(router.state.uri.path, AppRoutePaths.signIn);

    await tester.tap(find.byKey(SignInScreen.signInActionKey));
    await tester.pumpAndSettle();

    expect(router.state.uri.path, AppRoutePaths.home);
    expect(find.text('Hello, Alex'), findsOneWidget);
  });

  testWidgets(
    'Choose Paths Continue navigates to Home when selection is valid',
    (tester) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.choosePaths,
        settle: false,
      );
      await tester.pump(const Duration(milliseconds: 100));

      expect(router.state.uri.path, AppRoutePaths.choosePaths);

      final continueBtn = find.byKey(OnboardingKeys.continueButton);
      expect(continueBtn, findsOneWidget);
      await tester.tap(continueBtn);
      await tester.pumpAndSettle();

      expect(router.state.uri.path, AppRoutePaths.home);
      expect(find.text('Hello, Alex'), findsOneWidget);
    },
  );

  testWidgets('Home renders signed-in mock state', (tester) async {
    final router = await pumpAuratioApp(tester);
    await openAuratioRoute(tester, router, AppRoutePaths.home, settle: false);
    await tester.pump(const Duration(milliseconds: 100));

    expect(find.text('Hello, Alex'), findsOneWidget);
    expect(
      find.text('You have an active evaluation awaiting a final decision.'),
      findsOneWidget,
    );
    expect(find.text('View Active Evaluation'), findsOneWidget);
    expect(find.text('RECENT EVALUATION'), findsOneWidget);
    expect(find.text('Business Pitch / Sales Pitch'), findsOneWidget);
    expect(find.text('Human Evaluation'), findsOneWidget);
    expect(find.text('Pending Moderation'), findsOneWidget);
    expect(find.text('PRIVATE PROGRESS'), findsOneWidget);
    expect(find.text('Overall Auratio Mastery'), findsOneWidget);
    expect(
      find.text('84.2 / 100 • Approved track masteries averaged equally.'),
      findsOneWidget,
    );
    expect(find.text('Leaderboards'), findsOneWidget);
    expect(find.text('Events'), findsOneWidget);
    expect(find.text('YOUR PATHS'), findsOneWidget);
  });

  testWidgets('Home reflects local selected Paths', (tester) async {
    final container = ProviderContainer();
    addTearDown(container.dispose);

    // Initial state has publicSpeaking and professionalPresenting
    final initialPaths = container.read(selectedPathsProvider);
    expect(initialPaths.contains(AuratioPath.professionalPresenting), isTrue);
    expect(initialPaths.contains(AuratioPath.publicSpeaking), isTrue);

    final router = await pumpAuratioApp(tester);
    await openAuratioRoute(tester, router, AppRoutePaths.home, settle: false);
    await tester.pump(const Duration(milliseconds: 100));

    expect(find.text('Professional Presenting'), findsOneWidget);
    expect(find.text('Public Speaking'), findsOneWidget);
  });

  testWidgets('all 13 tracks remain visible regardless of selected Paths', (
    tester,
  ) async {
    final router = await pumpAuratioApp(tester);
    await openAuratioRoute(tester, router, AppRoutePaths.tracks, settle: false);
    await tester.pump(const Duration(milliseconds: 100));

    expect(find.text('PUBLIC SPEAKING'), findsOneWidget);
    expect(find.text('PROFESSIONAL PRESENTING'), findsOneWidget);
    expect(find.text('CONTENT CREATION'), findsOneWidget);

    for (final track in AuratioTrackCatalog.allTracks) {
      expect(find.text(track.name), findsOneWidget);
    }
  });

  testWidgets('Home -> Tracks navigation via bottom navigation bar', (
    tester,
  ) async {
    final router = await pumpAuratioApp(tester);
    await openAuratioRoute(tester, router, AppRoutePaths.home, settle: false);
    await tester.pump(const Duration(milliseconds: 100));

    expect(router.state.uri.path, AppRoutePaths.home);

    await tester.tap(find.text('Tracks'));
    await tester.pumpAndSettle();

    expect(router.state.uri.path, AppRoutePaths.tracks);
  });

  testWidgets('Tracks -> Home navigation via bottom navigation bar', (
    tester,
  ) async {
    final router = await pumpAuratioApp(tester);
    await openAuratioRoute(tester, router, AppRoutePaths.tracks, settle: false);
    await tester.pump(const Duration(milliseconds: 100));

    expect(router.state.uri.path, AppRoutePaths.tracks);

    await tester.tap(find.text('Home'));
    await tester.pumpAndSettle();

    expect(router.state.uri.path, AppRoutePaths.home);
  });

  testWidgets(
    'Business Pitch / Sales Pitch -> Track Details -> Submission Requirements -> Back flows',
    (tester) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.tracks,
        settle: false,
      );
      await tester.pump(const Duration(milliseconds: 100));

      // Tap on Business Pitch / Sales Pitch
      await tester.tap(find.byKey(TracksScreen.businessPitchTrackKey));
      await tester.pumpAndSettle();

      expect(router.state.uri.path, AppRoutePaths.trackDetails);
      expect(find.text('Track Details'), findsOneWidget);
      expect(
        find.textContaining('Target 3:00–5:00'),
        findsOneWidget,
      );

      // Tap Start Evaluation -> Submission Requirements
      await tester.tap(find.byKey(TrackDetailsScreen.startEvaluationButtonKey));
      await tester.pumpAndSettle();

      expect(router.state.uri.path, AppRoutePaths.submissionRequirements);
      expect(find.text('Before you upload'), findsOneWidget);
      expect(find.text('.mp4 only'), findsOneWidget);
      expect(find.text('Keep the speaker visible'), findsOneWidget);
      expect(find.text('Not supported in the MVP'), findsOneWidget);

      // Tap Back -> Track Details
      await tester.tap(find.bySemanticsLabel('Back'));
      await tester.pumpAndSettle();

      expect(router.state.uri.path, AppRoutePaths.trackDetails);

      // Tap Back -> Tracks
      await tester.tap(find.bySemanticsLabel('Back'));
      await tester.pumpAndSettle();

      expect(router.state.uri.path, AppRoutePaths.tracks);
    },
  );

  testWidgets(
    'Choose Video button at Submission Requirements boundary does not throw',
    (tester) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.submissionRequirements,
        settle: false,
      );
      await tester.pump(const Duration(milliseconds: 100));

      final chooseVideoBtn = find.byKey(
        SubmissionRequirementsScreen.chooseVideoButtonKey,
      );
      expect(chooseVideoBtn, findsOneWidget);

      await tester.tap(chooseVideoBtn);
      await tester.pump();

      // Confirm we stay on the same screen (no navigation to unapproved upload screen)
      expect(router.state.uri.path, AppRoutePaths.submissionRequirements);
      expect(tester.takeException(), isNull);
    },
  );
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
