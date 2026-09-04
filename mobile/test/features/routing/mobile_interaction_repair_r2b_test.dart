import 'package:auratio_mobile/app/router/app_route_paths.dart';
import 'package:auratio_mobile/features/evaluations/presentation/screens/evaluation_result_ai_screen.dart';
import 'package:auratio_mobile/features/events/presentation/screens/events_discovery_screen.dart';
import 'package:auratio_mobile/features/leaderboard/presentation/screens/leaderboard_ai_all_time_screen.dart';
import 'package:auratio_mobile/features/leaderboard/presentation/screens/leaderboard_human_all_time_screen.dart';
import 'package:auratio_mobile/features/leaderboard/presentation/widgets/how_ranking_works_modal.dart';
import 'package:auratio_mobile/features/progress/presentation/screens/approved_evaluation_history_screen.dart';
import 'package:auratio_mobile/features/tracks/presentation/screens/tracks_screen.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/auratio_test_harness.dart';

void main() {
  group('AURATIO STEP IV — MOBILE INTERACTION REPAIR R2B', () {
    group('1. Tracks Category Filters', () {
      testWidgets('Filters tracks by category chip selection', (tester) async {
        final router = await pumpAuratioApp(tester);
        await openAuratioRoute(tester, router, AppRoutePaths.tracks);

        expect(router.state.uri.path, AppRoutePaths.tracks);

        // Initially 'All' is selected: all 3 sections are displayed
        expect(find.text('PUBLIC SPEAKING'), findsOneWidget);
        expect(find.text('PROFESSIONAL PRESENTING'), findsOneWidget);
        expect(find.text('CONTENT CREATION'), findsOneWidget);

        // Select Public Speaking chip
        await tester.tap(find.byKey(TracksScreen.filterPublicSpeakingChipKey));
        await tester.pumpAndSettle();

        expect(find.text('PUBLIC SPEAKING'), findsOneWidget);
        expect(find.text('PROFESSIONAL PRESENTING'), findsNothing);
        expect(find.text('CONTENT CREATION'), findsNothing);
        expect(find.text('Informative'), findsOneWidget);
        expect(find.text('Business Pitch / Sales Pitch'), findsNothing);
        expect(find.text('Audio-Visual Content'), findsNothing);

        // Select Presenting chip
        await tester.tap(find.byKey(TracksScreen.filterPresentingChipKey));
        await tester.pumpAndSettle();

        expect(find.text('PUBLIC SPEAKING'), findsNothing);
        expect(find.text('PROFESSIONAL PRESENTING'), findsOneWidget);
        expect(find.text('CONTENT CREATION'), findsNothing);
        expect(find.text('Business Pitch / Sales Pitch'), findsOneWidget);
        expect(find.text('Informative'), findsNothing);
        expect(find.text('Audio-Visual Content'), findsNothing);

        // Select Content chip
        await tester.tap(find.byKey(TracksScreen.filterContentChipKey));
        await tester.pumpAndSettle();

        expect(find.text('PUBLIC SPEAKING'), findsNothing);
        expect(find.text('PROFESSIONAL PRESENTING'), findsNothing);
        expect(find.text('CONTENT CREATION'), findsOneWidget);
        expect(find.text('Infotainment-Oriented'), findsOneWidget);
        expect(find.text('Business Pitch / Sales Pitch'), findsNothing);
        expect(find.text('Informative'), findsNothing);

        // Select All chip
        await tester.tap(find.byKey(TracksScreen.filterAllChipKey));
        await tester.pumpAndSettle();

        expect(find.text('PUBLIC SPEAKING'), findsOneWidget);
        expect(find.text('PROFESSIONAL PRESENTING'), findsOneWidget);
        expect(find.text('CONTENT CREATION'), findsOneWidget);
      });
    });

    group('2. Events Discovery Local Filters', () {
      testWidgets(
        'Filters events by division, path, and date with empty state',
        (tester) async {
          final router = await pumpAuratioApp(tester);
          await openAuratioRoute(tester, router, AppRoutePaths.events);

          expect(router.state.uri.path, AppRoutePaths.events);

          // Default: 2 events shown (Dhaka Division + user's selected paths)
          expect(
            find.byKey(EventsDiscoveryScreen.eventCard1Key),
            findsOneWidget,
          );
          expect(
            find.byKey(EventsDiscoveryScreen.eventCard2Key),
            findsOneWidget,
          );
          expect(find.byKey(EventsDiscoveryScreen.emptyStateKey), findsNothing);

          // Tap Division filter pill
          await tester.tap(find.byKey(EventsDiscoveryScreen.filterDivisionKey));
          await tester.pumpAndSettle();

          // Select Chattogram Division (has no events in mock catalog)
          await tester.tap(find.text('Chattogram Division'));
          await tester.pumpAndSettle();

          // Empty state is shown
          expect(
            find.byKey(EventsDiscoveryScreen.emptyStateKey),
            findsOneWidget,
          );
          expect(find.text('No matching events'), findsOneWidget);
          expect(find.byKey(EventsDiscoveryScreen.eventCard1Key), findsNothing);
          expect(find.byKey(EventsDiscoveryScreen.eventCard2Key), findsNothing);

          // Reset division to Dhaka Division
          await tester.tap(find.byKey(EventsDiscoveryScreen.filterDivisionKey));
          await tester.pumpAndSettle();
          await tester.tap(find.text('Dhaka Division'));
          await tester.pumpAndSettle();

          expect(
            find.byKey(EventsDiscoveryScreen.eventCard1Key),
            findsOneWidget,
          );
          expect(
            find.byKey(EventsDiscoveryScreen.eventCard2Key),
            findsOneWidget,
          );

          // Filter by Path: Public Speaking only
          await tester.tap(find.byKey(EventsDiscoveryScreen.filterPathKey));
          await tester.pumpAndSettle();
          await tester.tap(find.text('Public Speaking'));
          await tester.pumpAndSettle();

          expect(
            find.byKey(EventsDiscoveryScreen.eventCard1Key),
            findsOneWidget,
          );
          expect(find.byKey(EventsDiscoveryScreen.eventCard2Key), findsNothing);

          // Filter by Path: Professional Presenting only
          await tester.tap(find.byKey(EventsDiscoveryScreen.filterPathKey));
          await tester.pumpAndSettle();
          await tester.tap(find.text('Professional Presenting'));
          await tester.pumpAndSettle();

          expect(find.byKey(EventsDiscoveryScreen.eventCard1Key), findsNothing);
          expect(
            find.byKey(EventsDiscoveryScreen.eventCard2Key),
            findsOneWidget,
          );

          // Filter by Path: All Paths
          await tester.tap(find.byKey(EventsDiscoveryScreen.filterPathKey));
          await tester.pumpAndSettle();
          await tester.tap(find.text('All Paths'));
          await tester.pumpAndSettle();

          expect(
            find.byKey(EventsDiscoveryScreen.eventCard1Key),
            findsOneWidget,
          );
          expect(
            find.byKey(EventsDiscoveryScreen.eventCard2Key),
            findsOneWidget,
          );
        },
      );
    });

    group('3. Approved History Filters', () {
      testWidgets('Toggles AI, Human, and All approved history records', (
        tester,
      ) async {
        final router = await pumpAuratioApp(tester);
        await openAuratioRoute(
          tester,
          router,
          AppRoutePaths.approvedEvaluationHistory,
        );

        expect(router.state.uri.path, AppRoutePaths.approvedEvaluationHistory);

        // Initially 'All': both records are visible
        expect(
          find.byKey(ApprovedEvaluationHistoryScreen.aiRecordCardKey),
          findsOneWidget,
        );
        expect(
          find.byKey(ApprovedEvaluationHistoryScreen.humanRecordCardKey),
          findsOneWidget,
        );

        // Tap AI pill
        await tester.tap(
          find.byKey(ApprovedEvaluationHistoryScreen.filterAiPillKey),
        );
        await tester.pumpAndSettle();

        expect(
          find.byKey(ApprovedEvaluationHistoryScreen.aiRecordCardKey),
          findsOneWidget,
        );
        expect(
          find.byKey(ApprovedEvaluationHistoryScreen.humanRecordCardKey),
          findsNothing,
        );

        // Tap Human pill
        await tester.tap(
          find.byKey(ApprovedEvaluationHistoryScreen.filterHumanPillKey),
        );
        await tester.pumpAndSettle();

        expect(
          find.byKey(ApprovedEvaluationHistoryScreen.aiRecordCardKey),
          findsNothing,
        );
        expect(
          find.byKey(ApprovedEvaluationHistoryScreen.humanRecordCardKey),
          findsOneWidget,
        );

        // Tap All pill
        await tester.tap(
          find.byKey(ApprovedEvaluationHistoryScreen.filterAllPillKey),
        );
        await tester.pumpAndSettle();

        expect(
          find.byKey(ApprovedEvaluationHistoryScreen.aiRecordCardKey),
          findsOneWidget,
        );
        expect(
          find.byKey(ApprovedEvaluationHistoryScreen.humanRecordCardKey),
          findsOneWidget,
        );

        // Verify View Result navigation preserves Business Pitch
        await tester.tap(
          find.byKey(ApprovedEvaluationHistoryScreen.aiViewResultLinkKey),
        );
        await tester.pumpAndSettle();

        expect(router.state.uri.path, AppRoutePaths.evaluationResultAi);
        expect(
          router.state.uri.queryParameters['track'],
          'business-pitch-sales-pitch',
        );
        expect(find.byType(EvaluationResultAiScreen), findsOneWidget);
      });
    });

    group('4. Leaderboard Monthly Toggle and Period Persistence', () {
      testWidgets(
        'Toggles between All-Time and Monthly, updates rankings/copy, and persists period across AI <-> Human',
        (tester) async {
          final router = await pumpAuratioApp(tester);
          await openAuratioRoute(tester, router, AppRoutePaths.leaderboard);

          expect(router.state.uri.path, AppRoutePaths.leaderboard);

          // Initially All-Time AI Leaderboard
          expect(find.text('ALL-TIME AI RANKING'), findsOneWidget);
          expect(
            find.text('3 Approved AI evaluations in this scope.'),
            findsOneWidget,
          );
          expect(find.text('ALR 92.4'), findsOneWidget);
          expect(find.text('Your position  #12'), findsOneWidget);
          expect(find.text('ALR 86.4  •  Participation 3'), findsOneWidget);

          // Tap Monthly pill
          await tester.tap(
            find.byKey(LeaderboardAiAllTimeScreen.periodMonthlyPillKey),
          );
          await tester.pumpAndSettle();

          // Monthly AI Leaderboard values
          expect(find.text('MONTHLY AI RANKING'), findsOneWidget);
          expect(
            find.text(
              '3 Approved AI evaluations submitted this calendar month (D = 1.00).',
            ),
            findsOneWidget,
          );
          expect(find.text('ALR 94.0'), findsOneWidget);
          expect(find.text('Your position  #8'), findsOneWidget);
          expect(find.text('ALR 87.5  •  Participation 3'), findsOneWidget);

          // Switch to Human Leaderboard
          await tester.tap(
            find.byKey(LeaderboardAiAllTimeScreen.modeHumanPillKey),
          );
          await tester.pumpAndSettle();

          expect(router.state.uri.path, AppRoutePaths.leaderboardHuman);

          // Must open in Monthly mode because Monthly was selected on AI
          expect(find.text('MONTHLY HUMAN RANKING'), findsOneWidget);
          expect(
            find.text(
              '2 of 3 Approved Human evaluations submitted this calendar month (D = 1.00).',
            ),
            findsOneWidget,
          );
          expect(find.text('ALR 93.0'), findsOneWidget);
          expect(
            find.text('1 more Approved Human evaluation required this month'),
            findsOneWidget,
          );

          // Switch back to All-Time while on Human Leaderboard
          await tester.tap(
            find.byKey(LeaderboardHumanAllTimeScreen.periodAllTimePillKey),
          );
          await tester.pumpAndSettle();

          expect(find.text('ALL-TIME HUMAN RANKING'), findsOneWidget);
          expect(
            find.text('2 of 3 Approved Human evaluations in this scope.'),
            findsOneWidget,
          );
          expect(find.text('ALR 92.4'), findsOneWidget);
          expect(
            find.text('1 more Approved Human evaluation required'),
            findsOneWidget,
          );

          // Switch to AI Leaderboard
          await tester.tap(
            find.byKey(LeaderboardHumanAllTimeScreen.modeAiPillKey),
          );
          await tester.pumpAndSettle();

          expect(router.state.uri.path, AppRoutePaths.leaderboard);

          // Must open in All-Time mode
          expect(find.text('ALL-TIME AI RANKING'), findsOneWidget);
          expect(
            find.text('3 Approved AI evaluations in this scope.'),
            findsOneWidget,
          );
        },
      );
    });

    group('5. How Ranking Works Modal', () {
      testWidgets(
        'Launches modal from AI leaderboard and closes back to leaderboard',
        (tester) async {
          final router = await pumpAuratioApp(tester);
          await openAuratioRoute(tester, router, AppRoutePaths.leaderboard);

          // Tap How Ranking Works button
          await tester.tap(
            find.byKey(LeaderboardAiAllTimeScreen.howRankingWorksKey),
          );
          await tester.pumpAndSettle();

          // Modal is open
          expect(find.byKey(HowRankingWorksModal.modalKey), findsOneWidget);
          expect(
            find.descendant(
              of: find.byKey(HowRankingWorksModal.modalKey),
              matching: find.text('How Ranking Works'),
            ),
            findsOneWidget,
          );
          expect(find.text('Qualification & ALR'), findsOneWidget);
          expect(
            find.byKey(HowRankingWorksModal.qualificationCardKey),
            findsOneWidget,
          );
          expect(find.byKey(HowRankingWorksModal.alrCardKey), findsOneWidget);
          expect(
            find.byKey(HowRankingWorksModal.rankingDetailsCardKey),
            findsOneWidget,
          );
          expect(find.text('ALR = Sform × D'), findsOneWidget);

          // Tap Back to Leaderboard bottom button
          await tester.tap(
            find.byKey(HowRankingWorksModal.backToLeaderboardButtonKey),
          );
          await tester.pumpAndSettle();

          // Modal is dismissed, back to AI leaderboard
          expect(find.byKey(HowRankingWorksModal.modalKey), findsNothing);
          expect(
            find.byKey(LeaderboardAiAllTimeScreen.screenKey),
            findsOneWidget,
          );
        },
      );

      testWidgets(
        'Launches modal from Human leaderboard and closes via header back button',
        (tester) async {
          final router = await pumpAuratioApp(tester);
          await openAuratioRoute(
            tester,
            router,
            AppRoutePaths.leaderboardHuman,
          );

          // Tap How Ranking Works button
          await tester.tap(
            find.byKey(LeaderboardHumanAllTimeScreen.howRankingWorksKey),
          );
          await tester.pumpAndSettle();

          // Modal is open
          expect(find.byKey(HowRankingWorksModal.modalKey), findsOneWidget);

          // Tap Header Back affordance inside the modal
          await tester.tap(
            find.descendant(
              of: find.byKey(HowRankingWorksModal.modalKey),
              matching: find.text('‹'),
            ),
          );
          await tester.pumpAndSettle();

          // Modal is dismissed, back to Human leaderboard
          expect(find.byKey(HowRankingWorksModal.modalKey), findsNothing);
          expect(
            find.byKey(LeaderboardHumanAllTimeScreen.screenKey),
            findsOneWidget,
          );
        },
      );
    });
  });
}
