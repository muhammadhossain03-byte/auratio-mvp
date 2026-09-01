import 'package:auratio_mobile/app/router/app_route_paths.dart';
import 'package:auratio_mobile/features/leaderboard/presentation/screens/leaderboard_ai_all_time_screen.dart';
import 'package:auratio_mobile/features/leaderboard/presentation/screens/leaderboard_human_all_time_screen.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/auratio_test_harness.dart';

void main() {
  group('Batch 11 Visual QA Verification', () {
    testWidgets(
      'visual QA: Leaderboard AI All-Time (282:509) layout and card states',
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

        // Header
        expect(find.text('Leaderboard'), findsOneWidget);
        expect(find.text('‹'), findsOneWidget);

        // Track & Path
        expect(find.text('Business Pitch / Sales Pitch'), findsOneWidget);
        expect(find.text('Professional Presenting'), findsOneWidget);

        // Mode & Period Pills
        expect(find.text('AI'), findsOneWidget);
        expect(find.text('Human'), findsOneWidget);
        expect(find.text('All-Time'), findsOneWidget);
        expect(find.text('Monthly'), findsOneWidget);

        // Qualification Card
        expect(
          find.byKey(LeaderboardAiAllTimeScreen.qualificationCardKey),
          findsOneWidget,
        );
        expect(find.text('Qualified'), findsOneWidget);
        expect(
          find.text('3 Approved AI evaluations in this scope.'),
          findsOneWidget,
        );

        // Ranking Section Label & 3 Cards
        expect(find.text('ALL-TIME AI RANKING'), findsOneWidget);
        expect(find.text('Speaker A'), findsOneWidget);
        expect(find.text('ALR 92.4'), findsOneWidget);
        expect(find.text('Participation 7'), findsOneWidget);

        expect(find.text('Speaker B'), findsOneWidget);
        expect(find.text('ALR 90.9'), findsOneWidget);
        expect(find.text('Participation 5'), findsOneWidget);

        expect(find.text('Speaker C'), findsOneWidget);
        expect(find.text('ALR 89.7'), findsOneWidget);
        expect(find.text('Participation 9'), findsOneWidget);

        // Your Position Card
        expect(
          find.byKey(LeaderboardAiAllTimeScreen.yourPositionCardKey),
          findsOneWidget,
        );
        expect(find.text('Your position  #12'), findsOneWidget);
        expect(find.text('ALR 86.4  •  Participation 3'), findsOneWidget);

        // How Ranking Works
        expect(
          find.byKey(LeaderboardAiAllTimeScreen.howRankingWorksKey),
          findsOneWidget,
        );
        expect(find.text('How Ranking Works'), findsOneWidget);
      },
    );

    testWidgets(
      'visual QA: Leaderboard Human All-Time (282:609) layout and card states',
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

        // Header
        expect(find.text('Leaderboard'), findsOneWidget);
        expect(find.text('‹'), findsOneWidget);

        // Track & Path
        expect(find.text('Business Pitch / Sales Pitch'), findsOneWidget);
        expect(find.text('Professional Presenting'), findsOneWidget);

        // Mode & Period Pills
        expect(find.text('AI'), findsOneWidget);
        expect(find.text('Human'), findsOneWidget);
        expect(find.text('All-Time'), findsOneWidget);
        expect(find.text('Monthly'), findsOneWidget);

        // Qualification Card
        expect(
          find.byKey(LeaderboardHumanAllTimeScreen.qualificationCardKey),
          findsOneWidget,
        );
        expect(find.text('Not ranked yet'), findsOneWidget);
        expect(
          find.text('2 of 3 Approved Human evaluations in this scope.'),
          findsOneWidget,
        );
        expect(
          find.text('AI approvals cannot qualify the Human leaderboard.'),
          findsOneWidget,
        );

        // Ranking Section Label & 3 Cards
        expect(find.text('ALL-TIME HUMAN RANKING'), findsOneWidget);
        expect(find.text('Speaker A'), findsOneWidget);
        expect(find.text('ALR 92.4'), findsOneWidget);
        expect(find.text('Participation 7'), findsOneWidget);

        expect(find.text('Speaker B'), findsOneWidget);
        expect(find.text('ALR 90.9'), findsOneWidget);
        expect(find.text('Participation 5'), findsOneWidget);

        expect(find.text('Speaker C'), findsOneWidget);
        expect(find.text('ALR 89.7'), findsOneWidget);
        expect(find.text('Participation 9'), findsOneWidget);

        // Your Qualification Card
        expect(
          find.byKey(LeaderboardHumanAllTimeScreen.yourQualificationCardKey),
          findsOneWidget,
        );
        expect(find.text('Your qualification'), findsOneWidget);
        expect(
          find.text('1 more Approved Human evaluation required'),
          findsOneWidget,
        );

        // How Ranking Works
        expect(
          find.byKey(LeaderboardHumanAllTimeScreen.howRankingWorksKey),
          findsOneWidget,
        );
        expect(find.text('How Ranking Works'), findsOneWidget);
      },
    );
  });
}
