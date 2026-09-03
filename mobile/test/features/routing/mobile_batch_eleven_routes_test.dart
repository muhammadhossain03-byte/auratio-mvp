import 'package:auratio_mobile/app/router/app_route_paths.dart';
import 'package:auratio_mobile/features/home/presentation/screens/home_screen.dart';
import 'package:auratio_mobile/features/leaderboard/presentation/screens/leaderboard_ai_all_time_screen.dart';
import 'package:auratio_mobile/features/leaderboard/presentation/screens/leaderboard_human_all_time_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/auratio_test_harness.dart';

void main() {
  const screens = <_BatchScreenCase>[
    _BatchScreenCase(
      name: 'Leaderboard AI All-Time',
      path: AppRoutePaths.leaderboard,
      identifyingCopy: 'ALL-TIME AI RANKING',
    ),
    _BatchScreenCase(
      name: 'Leaderboard Human All-Time',
      path: AppRoutePaths.leaderboardHuman,
      identifyingCopy: 'ALL-TIME HUMAN RANKING',
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

  group('Upstream Home Leaderboard Navigation', () {
    testWidgets('Home Leaderboards button navigates to AI Leaderboard', (
      tester,
    ) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(tester, router, AppRoutePaths.home, settle: false);
      await tester.pumpAndSettle();

      expect(router.state.uri.path, AppRoutePaths.home);

      // Tap Leaderboards button -> navigates to AI Leaderboard
      final leaderboardsBtn = find.byKey(HomeScreen.leaderboardsButtonKey);
      expect(leaderboardsBtn, findsOneWidget);
      await tester.tap(leaderboardsBtn);
      await tester.pumpAndSettle();

      expect(router.state.uri.path, AppRoutePaths.leaderboard);
      expect(find.byKey(LeaderboardAiAllTimeScreen.screenKey), findsOneWidget);
    });
  });

  group('Leaderboard AI All-Time (282:509)', () {
    testWidgets('Header back navigates to Home', (tester) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.leaderboard,
        settle: false,
      );
      await tester.pumpAndSettle();

      expect(router.state.uri.path, AppRoutePaths.leaderboard);

      final backFinder = find.text('‹');
      expect(backFinder, findsOneWidget);
      await tester.tap(backFinder);
      await tester.pumpAndSettle();

      expect(router.state.uri.path, AppRoutePaths.home);
    });

    testWidgets('Human pill navigates to Human Leaderboard', (tester) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.leaderboard,
        settle: false,
      );
      await tester.pumpAndSettle();

      expect(router.state.uri.path, AppRoutePaths.leaderboard);

      final humanPill = find.byKey(LeaderboardAiAllTimeScreen.modeHumanPillKey);
      expect(humanPill, findsOneWidget);
      await tester.tap(humanPill);
      await tester.pumpAndSettle();

      expect(router.state.uri.path, AppRoutePaths.leaderboardHuman);
      expect(
        find.byKey(LeaderboardHumanAllTimeScreen.screenKey),
        findsOneWidget,
      );
    });

    testWidgets(
      'Selected AI pill, Period pills, and How Ranking Works are non-interactive presentation elements',
      (tester) async {
        final router = await pumpAuratioApp(tester);
        await openAuratioRoute(
          tester,
          router,
          AppRoutePaths.leaderboard,
          settle: false,
        );
        await tester.pumpAndSettle();

        expect(router.state.uri.path, AppRoutePaths.leaderboard);

        // Tap selected AI pill -> stays on screen
        final aiPill = find.byKey(LeaderboardAiAllTimeScreen.modeAiPillKey);
        expect(aiPill, findsOneWidget);
        await tester.tap(aiPill);
        await tester.pumpAndSettle();
        expect(router.state.uri.path, AppRoutePaths.leaderboard);

        // Tap All-Time pill -> stays on screen
        final allTimePill = find.byKey(
          LeaderboardAiAllTimeScreen.periodAllTimePillKey,
        );
        expect(allTimePill, findsOneWidget);
        await tester.tap(allTimePill);
        await tester.pumpAndSettle();
        expect(router.state.uri.path, AppRoutePaths.leaderboard);

        // Tap Monthly pill -> stays on screen
        final monthlyPill = find.byKey(
          LeaderboardAiAllTimeScreen.periodMonthlyPillKey,
        );
        expect(monthlyPill, findsOneWidget);
        await tester.tap(monthlyPill);
        await tester.pumpAndSettle();
        expect(router.state.uri.path, AppRoutePaths.leaderboard);

        // Tap How Ranking Works -> stays on screen
        final howRankingWorks = find.byKey(
          LeaderboardAiAllTimeScreen.howRankingWorksKey,
        );
        expect(howRankingWorks, findsOneWidget);
        await tester.tap(howRankingWorks);
        await tester.pumpAndSettle();
        expect(router.state.uri.path, AppRoutePaths.leaderboard);
      },
    );
  });

  group('Leaderboard Human All-Time (282:609)', () {
    testWidgets('Header back navigates to Home', (tester) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.leaderboardHuman,
        settle: false,
      );
      await tester.pumpAndSettle();

      expect(router.state.uri.path, AppRoutePaths.leaderboardHuman);

      final backFinder = find.text('‹');
      expect(backFinder, findsOneWidget);
      await tester.tap(backFinder);
      await tester.pumpAndSettle();

      expect(router.state.uri.path, AppRoutePaths.home);
    });

    testWidgets('AI pill navigates to AI Leaderboard', (tester) async {
      final router = await pumpAuratioApp(tester);
      await openAuratioRoute(
        tester,
        router,
        AppRoutePaths.leaderboardHuman,
        settle: false,
      );
      await tester.pumpAndSettle();

      expect(router.state.uri.path, AppRoutePaths.leaderboardHuman);

      final aiPill = find.byKey(LeaderboardHumanAllTimeScreen.modeAiPillKey);
      expect(aiPill, findsOneWidget);
      await tester.tap(aiPill);
      await tester.pumpAndSettle();

      expect(router.state.uri.path, AppRoutePaths.leaderboard);
      expect(find.byKey(LeaderboardAiAllTimeScreen.screenKey), findsOneWidget);
    });

    testWidgets(
      'Selected Human pill, Period pills, and How Ranking Works are non-interactive presentation elements',
      (tester) async {
        final router = await pumpAuratioApp(tester);
        await openAuratioRoute(
          tester,
          router,
          AppRoutePaths.leaderboardHuman,
          settle: false,
        );
        await tester.pumpAndSettle();

        expect(router.state.uri.path, AppRoutePaths.leaderboardHuman);

        // Tap selected Human pill -> stays on screen
        final humanPill = find.byKey(
          LeaderboardHumanAllTimeScreen.modeHumanPillKey,
        );
        expect(humanPill, findsOneWidget);
        await tester.tap(humanPill);
        await tester.pumpAndSettle();
        expect(router.state.uri.path, AppRoutePaths.leaderboardHuman);

        // Tap All-Time pill -> stays on screen
        final allTimePill = find.byKey(
          LeaderboardHumanAllTimeScreen.periodAllTimePillKey,
        );
        expect(allTimePill, findsOneWidget);
        await tester.tap(allTimePill);
        await tester.pumpAndSettle();
        expect(router.state.uri.path, AppRoutePaths.leaderboardHuman);

        // Tap Monthly pill -> stays on screen
        final monthlyPill = find.byKey(
          LeaderboardHumanAllTimeScreen.periodMonthlyPillKey,
        );
        expect(monthlyPill, findsOneWidget);
        await tester.tap(monthlyPill);
        await tester.pumpAndSettle();
        expect(router.state.uri.path, AppRoutePaths.leaderboardHuman);

        // Tap How Ranking Works -> stays on screen
        final howRankingWorks = find.byKey(
          LeaderboardHumanAllTimeScreen.howRankingWorksKey,
        );
        expect(howRankingWorks, findsOneWidget);
        await tester.tap(howRankingWorks);
        await tester.pumpAndSettle();
        expect(router.state.uri.path, AppRoutePaths.leaderboardHuman);
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
