import 'package:auratio_mobile/app/router/app_route_paths.dart';
import 'package:auratio_mobile/features/evaluations/presentation/screens/evaluation_pending_moderation_screen.dart';
import 'package:auratio_mobile/features/evaluations/presentation/screens/evaluation_rejected_screen.dart';
import 'package:auratio_mobile/foundation/design_system/auratio_design_system.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/auratio_test_harness.dart';

void main() {
  const screens = <_BatchScreenCase>[
    _BatchScreenCase(
      name: 'Pending Moderation',
      path: AppRoutePaths.evaluationStatusPendingModeration,
      identifyingCopy: 'Review is required before publication',
      ctaLabel: 'Return to Home',
    ),
    _BatchScreenCase(
      name: 'Evaluation Rejected',
      path: AppRoutePaths.evaluationStatusRejected,
      identifyingCopy: 'Evaluation rejected',
      ctaLabel: 'Return to Home',
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
      if (screen.ctaLabel != null) {
        expectInsideTestCanvas(
          tester,
          find.widgetWithText(AuratioButton, screen.ctaLabel!),
        );
      }
      expect(tester.takeException(), isNull);
    });
  }

  group('Pending Moderation (282:568)', () {
    testWidgets(
      'Header back chevron is non-interactive in Pending Moderation',
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

        // Back chevron is displayed
        final backAffordance = find.text('‹');
        expect(backAffordance, findsOneWidget);

        // Tapping back chevron does NOT navigate away
        await tester.tap(backAffordance);
        await tester.pump();
        expect(
          router.state.uri.path,
          AppRoutePaths.evaluationStatusPendingModeration,
        );
      },
    );

    testWidgets('Pending Moderation remains on hold without auto-transition', (
      tester,
    ) async {
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

      // Advance by 3000 ms; screen must remain on Pending Moderation
      await tester.pump(const Duration(milliseconds: 3000));
      expect(
        router.state.uri.path,
        AppRoutePaths.evaluationStatusPendingModeration,
      );
    });

    testWidgets('Return to Home navigates to Home', (tester) async {
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

      final returnHomeBtn = find.byKey(
        EvaluationPendingModerationScreen.returnHomeButtonKey,
      );
      expect(returnHomeBtn, findsOneWidget);
      await tester.tap(returnHomeBtn);
      await tester.pumpAndSettle();

      expect(router.state.uri.path, AppRoutePaths.home);
    });
  });

  group('Evaluation Rejected (282:588)', () {
    testWidgets('Header chevron and Return to Home navigate to Home', (
      tester,
    ) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.evaluationStatusRejected,
        settle: false,
      );
      await tester.pumpAndSettle();

      expect(router.state.uri.path, AppRoutePaths.evaluationStatusRejected);

      // Header chevron navigates to Home
      final headerBack = find.text('‹');
      expect(headerBack, findsOneWidget);
      await tester.tap(headerBack);
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.home);

      // Re-enter Rejected screen and test Return to Home button
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.evaluationStatusRejected,
        settle: false,
      );
      await tester.pumpAndSettle();

      final returnHomeBtn = find.byKey(
        EvaluationRejectedScreen.returnHomeButtonKey,
      );
      expect(returnHomeBtn, findsOneWidget);
      await tester.tap(returnHomeBtn);
      await tester.pumpAndSettle();
      expect(router.state.uri.path, AppRoutePaths.home);
    });

    testWidgets(
      'Start a New Evaluation is non-interactive presentation state',
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
        expect(find.text('Start a New Evaluation'), findsOneWidget);
        expect(
          find.widgetWithText(AuratioButton, 'Start a New Evaluation'),
          findsOneWidget,
        );

        // Tapping Start a New Evaluation navigates to Tracks
        await tester.tap(
          find.widgetWithText(AuratioButton, 'Start a New Evaluation'),
        );
        await tester.pumpAndSettle();
        expect(router.state.uri.path, AppRoutePaths.tracks);
        expect(tester.takeException(), isNull);
      },
    );
  });
}

class _BatchScreenCase {
  const _BatchScreenCase({
    required this.name,
    required this.path,
    required this.identifyingCopy,
    required this.ctaLabel,
  });

  final String name;
  final String path;
  final String identifyingCopy;
  final String? ctaLabel;
}
