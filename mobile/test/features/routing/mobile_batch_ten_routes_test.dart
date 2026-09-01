import 'package:auratio_mobile/app/router/app_route_paths.dart';
import 'package:auratio_mobile/features/evaluations/presentation/screens/evaluation_report_download_simulated_screen.dart';
import 'package:auratio_mobile/features/evaluations/presentation/screens/evaluation_result_ai_screen.dart';
import 'package:auratio_mobile/features/evaluations/presentation/screens/evaluation_result_human_screen.dart';
import 'package:auratio_mobile/features/progress/presentation/screens/approved_evaluation_history_screen.dart';
import 'package:auratio_mobile/features/progress/presentation/screens/private_progress_screen.dart';
import 'package:auratio_mobile/foundation/navigation/auratio_mobile_navigation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/auratio_test_harness.dart';

void main() {
  const screens = <_BatchScreenCase>[
    _BatchScreenCase(
      name: 'Private Progress',
      path: AppRoutePaths.progress,
      identifyingCopy: 'Your Private Progress',
    ),
    _BatchScreenCase(
      name: 'Approved Evaluation History',
      path: AppRoutePaths.approvedEvaluationHistory,
      identifyingCopy: 'Approved results remain in your private history even after they leave a public rating window.',
    ),
  ];

  for (final screen in screens) {
    testWidgets('${screen.name} route renders without overflow at 390 x 844', (
      tester,
    ) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(tester, router, screen.path, settle: false);
      await tester.pumpAndSettle();

      expect(router.state.uri.path, screen.path);
      expect(find.text(screen.identifyingCopy), findsWidgets);
      expectInsideTestCanvas(tester, find.byType(Scaffold));
      expect(tester.takeException(), isNull);
    });
  }

  group('Upstream Progress Navigation', () {
    testWidgets('Home bottom nav Progress item navigates to Private Progress', (
      tester,
    ) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(tester, router, AppRoutePaths.home, settle: false);
      await tester.pumpAndSettle();

      expect(router.state.uri.path, AppRoutePaths.home);

      // Tap Progress item in bottom nav
      final progressNavFinder = find.widgetWithText(
        AuratioMobileNavigationItem,
        'Progress',
      );
      expect(progressNavFinder, findsOneWidget);
      await tester.tap(progressNavFinder);
      await tester.pumpAndSettle();

      expect(router.state.uri.path, AppRoutePaths.progress);
      expect(find.byKey(PrivateProgressScreen.screenKey), findsOneWidget);
    });

    testWidgets(
      'Tracks bottom nav Progress item navigates to Private Progress',
      (tester) async {
        final router = await pumpAuratioApp(tester);
        await openAuratioRoute(
          tester,
          router,
          AppRoutePaths.tracks,
          settle: false,
        );
        await tester.pumpAndSettle();

        expect(router.state.uri.path, AppRoutePaths.tracks);

        // Tap Progress item in bottom nav
        final progressNavFinder = find.widgetWithText(
          AuratioMobileNavigationItem,
          'Progress',
        );
        expect(progressNavFinder, findsOneWidget);
        await tester.tap(progressNavFinder);
        await tester.pumpAndSettle();

        expect(router.state.uri.path, AppRoutePaths.progress);
        expect(find.byKey(PrivateProgressScreen.screenKey), findsOneWidget);
      },
    );
  });

  group('Private Progress (282:475)', () {
    testWidgets(
      'View Approved History link pushes Approved Evaluation History',
      (tester) async {
        final router = await pumpAuratioApp(tester);
        await openAuratioRoute(
          tester,
          router,
          AppRoutePaths.progress,
          settle: false,
        );
        await tester.pumpAndSettle();

        expect(router.state.uri.path, AppRoutePaths.progress);

        final viewHistoryFinder = find.byKey(
          PrivateProgressScreen.viewApprovedHistoryLinkKey,
        );
        expect(viewHistoryFinder, findsOneWidget);
        await tester.tap(viewHistoryFinder);
        await tester.pumpAndSettle();

        expect(router.state.uri.path, AppRoutePaths.approvedEvaluationHistory);
        expect(
          find.byKey(ApprovedEvaluationHistoryScreen.screenKey),
          findsOneWidget,
        );
      },
    );

    testWidgets(
      'Bottom nav: Tracks is interactive; Home, Progress, and Profile are non-interactive presentation-only items',
      (tester) async {
        final router = await pumpAuratioApp(tester);
        await openAuratioRoute(
          tester,
          router,
          AppRoutePaths.progress,
          settle: false,
        );
        await tester.pumpAndSettle();

        expect(router.state.uri.path, AppRoutePaths.progress);

        // Home (index 0) - non-interactive (no InkResponse, isInteractive == false)
        final homeItem = tester.widget<AuratioMobileNavigationItem>(
          find.widgetWithText(AuratioMobileNavigationItem, 'Home'),
        );
        expect(homeItem.isInteractive, isFalse);
        expect(homeItem.onTap, isNull);

        // Progress (index 2) - visually active, but non-interactive
        final progressItem = tester.widget<AuratioMobileNavigationItem>(
          find.widgetWithText(AuratioMobileNavigationItem, 'Progress'),
        );
        expect(progressItem.active, isTrue);
        expect(progressItem.isInteractive, isFalse);
        expect(progressItem.onTap, isNull);

        // Profile (index 3) - non-interactive
        final profileItem = tester.widget<AuratioMobileNavigationItem>(
          find.widgetWithText(AuratioMobileNavigationItem, 'Profile'),
        );
        expect(profileItem.isInteractive, isFalse);
        expect(profileItem.onTap, isNull);

        // Tracks (index 1) - interactive with active button semantics & onTap
        final tracksItem = tester.widget<AuratioMobileNavigationItem>(
          find.widgetWithText(AuratioMobileNavigationItem, 'Tracks'),
        );
        expect(tracksItem.isInteractive, isTrue);
        expect(tracksItem.onTap, isNotNull);

        // Tap Tracks to verify navigation works
        final tracksNavFinder = find.widgetWithText(
          AuratioMobileNavigationItem,
          'Tracks',
        );
        await tester.tap(tracksNavFinder);
        await tester.pumpAndSettle();
        expect(router.state.uri.path, AppRoutePaths.tracks);
      },
    );
  });

  group('Approved Evaluation History (308:65)', () {
    testWidgets('Header back navigates to Private Progress', (tester) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.approvedEvaluationHistory,
        settle: false,
      );
      await tester.pumpAndSettle();

      expect(router.state.uri.path, AppRoutePaths.approvedEvaluationHistory);

      final backFinder = find.text('‹');
      expect(backFinder, findsOneWidget);
      await tester.tap(backFinder);
      await tester.pumpAndSettle();

      expect(router.state.uri.path, AppRoutePaths.progress);
    });

    testWidgets('Filter pills are non-interactive presentation elements', (
      tester,
    ) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.approvedEvaluationHistory,
        settle: false,
      );
      await tester.pumpAndSettle();

      expect(router.state.uri.path, AppRoutePaths.approvedEvaluationHistory);

      // Tap AI pill
      final aiPill = find.byKey(
        ApprovedEvaluationHistoryScreen.filterAiPillKey,
      );
      expect(aiPill, findsOneWidget);
      await tester.tap(aiPill);
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.approvedEvaluationHistory);

      // Tap Human pill
      final humanPill = find.byKey(
        ApprovedEvaluationHistoryScreen.filterHumanPillKey,
      );
      expect(humanPill, findsOneWidget);
      await tester.tap(humanPill);
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.approvedEvaluationHistory);
    });

    testWidgets('AI View Result navigates to AI Approved Result', (
      tester,
    ) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.approvedEvaluationHistory,
        settle: false,
      );
      await tester.pumpAndSettle();

      final aiViewResult = find.byKey(
        ApprovedEvaluationHistoryScreen.aiViewResultLinkKey,
      );
      expect(aiViewResult, findsOneWidget);
      await tester.tap(aiViewResult);
      await tester.pumpAndSettle();

      expect(router.state.uri.path, AppRoutePaths.evaluationResultAi);
      expect(find.byKey(EvaluationResultAiScreen.screenKey), findsOneWidget);
    });

    testWidgets('Human View Result navigates to Human Approved Result', (
      tester,
    ) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.approvedEvaluationHistory,
        settle: false,
      );
      await tester.pumpAndSettle();

      final humanViewResult = find.byKey(
        ApprovedEvaluationHistoryScreen.humanViewResultLinkKey,
      );
      expect(humanViewResult, findsOneWidget);
      await tester.tap(humanViewResult);
      await tester.pumpAndSettle();

      expect(router.state.uri.path, AppRoutePaths.evaluationResultHuman);
      expect(find.byKey(EvaluationResultHumanScreen.screenKey), findsOneWidget);
    });

    testWidgets(
      'AI and Human Download .docx navigate to Download Simulated, and back returns to Approved History',
      (tester) async {
        final router = await pumpAuratioApp(tester);
        await openAuratioRoute(
          tester,
          router,
          AppRoutePaths.approvedEvaluationHistory,
          settle: false,
        );
        await tester.pumpAndSettle();

        // 1. AI Download .docx
        final aiDownload = find.byKey(
          ApprovedEvaluationHistoryScreen.aiDownloadDocxLinkKey,
        );
        expect(aiDownload, findsOneWidget);
        await tester.tap(aiDownload);
        await tester.pumpAndSettle();

        expect(
          router.state.uri.path,
          AppRoutePaths.evaluationReportDownloadSimulated,
        );

        // Pop back to Approved History
        final backBtn1 = find.byKey(
          EvaluationReportDownloadSimulatedScreen.backButtonKey,
        );
        expect(backBtn1, findsOneWidget);
        await tester.tap(backBtn1);
        await tester.pumpAndSettle();
        expect(router.state.uri.path, AppRoutePaths.approvedEvaluationHistory);

        // 2. Human Download .docx
        final humanDownload = find.byKey(
          ApprovedEvaluationHistoryScreen.humanDownloadDocxLinkKey,
        );
        expect(humanDownload, findsOneWidget);
        await tester.tap(humanDownload);
        await tester.pumpAndSettle();

        expect(
          router.state.uri.path,
          AppRoutePaths.evaluationReportDownloadSimulated,
        );

        // Pop back to Approved History via header chevron
        final headerBack = find.text('‹');
        expect(headerBack, findsOneWidget);
        await tester.tap(headerBack);
        await tester.pumpAndSettle();
        expect(router.state.uri.path, AppRoutePaths.approvedEvaluationHistory);
      },
    );

    testWidgets(
      'Bottom navigation: all four items are presentation-only non-interactive items with Progress visually active',
      (tester) async {
        final router = await pumpAuratioApp(tester);
        await openAuratioRoute(
          tester,
          router,
          AppRoutePaths.approvedEvaluationHistory,
          settle: false,
        );
        await tester.pumpAndSettle();

        expect(router.state.uri.path, AppRoutePaths.approvedEvaluationHistory);

        for (final label in ['Home', 'Tracks', 'Progress', 'Profile']) {
          final item = tester.widget<AuratioMobileNavigationItem>(
            find.widgetWithText(AuratioMobileNavigationItem, label),
          );
          expect(item.isInteractive, isFalse);
          expect(item.onTap, isNull);
          if (label == 'Progress') {
            expect(item.active, isTrue);
          } else {
            expect(item.active, isFalse);
          }
        }
      },
    );
  });
}

class _BatchScreenCase {
  const _BatchScreenCase({
    required this.name,
    required this.path,
    required this.identifyingCopy,
  });

  final String name;
  final String path;
  final String identifyingCopy;
}
