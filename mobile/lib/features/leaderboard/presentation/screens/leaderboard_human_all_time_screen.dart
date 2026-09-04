import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router/app_route_paths.dart';
import '../../../../foundation/design_system/auratio_design_system.dart';
import '../../../shared/presentation/widgets/auratio_screen_header.dart';
import '../../application/leaderboard_period_provider.dart';
import '../widgets/how_ranking_works_modal.dart';
import '../widgets/leaderboard_rank_card.dart';

class LeaderboardHumanAllTimeScreen extends ConsumerWidget {
  const LeaderboardHumanAllTimeScreen({super.key});

  static const screenKey = Key('leaderboard-human-all-time-screen');
  static const trackTitleKey = Key('leaderboard-human-track-title');
  static const pathLabelKey = Key('leaderboard-human-path-label');
  static const modePillsRowKey = Key('leaderboard-human-mode-pills-row');
  static const modeAiPillKey = Key('leaderboard-human-mode-ai-pill');
  static const modeHumanPillKey = Key('leaderboard-human-mode-human-pill');
  static const periodPillsRowKey = Key('leaderboard-human-period-pills-row');
  static const periodAllTimePillKey = Key(
    'leaderboard-human-period-all-time-pill',
  );
  static const periodMonthlyPillKey = Key(
    'leaderboard-human-period-monthly-pill',
  );
  static const qualificationCardKey = Key(
    'leaderboard-human-qualification-card',
  );
  static const rankingSectionLabelKey = Key(
    'leaderboard-human-ranking-section-label',
  );
  static const rankCard1Key = Key('leaderboard-human-rank-card-1');
  static const rankCard2Key = Key('leaderboard-human-rank-card-2');
  static const rankCard3Key = Key('leaderboard-human-rank-card-3');
  static const yourQualificationCardKey = Key(
    'leaderboard-human-your-qualification-card',
  );
  static const howRankingWorksKey = Key('leaderboard-human-how-ranking-works');

  static const _overlayStyle = SystemUiOverlayStyle(
    statusBarColor: AuratioColors.backgroundBrand,
    statusBarIconBrightness: Brightness.light,
    statusBarBrightness: Brightness.dark,
    systemNavigationBarColor: AuratioColors.surfaceDefault,
    systemNavigationBarIconBrightness: Brightness.dark,
  );

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final period = ref.watch(leaderboardPeriodProvider);
    final isMonthly = period == LeaderboardPeriod.monthly;
    return AnnotatedRegion<SystemUiOverlayStyle>(
      key: screenKey,
      value: _overlayStyle,
      child: Scaffold(
        backgroundColor: AuratioColors.backgroundApp,
        body: SafeArea(
          top: false,
          child: Column(
            children: [
              AuratioScreenHeader(
                title: 'Leaderboard',
                showBack: true,
                onBack: () => context.go(AppRoutePaths.home),
              ),
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 24),

                      // Track title (y=116, w=350, h=27)
                      Text(
                        'Business Pitch / Sales Pitch',
                        key: trackTitleKey,
                        style: AuratioTypography.headingMedium.copyWith(
                          color: AuratioColors.textPrimary,
                          fontSize: 19,
                          height: 27 / 19,
                          fontWeight: FontWeight.w700,
                        ),
                      ),

                      const SizedBox(height: 3),

                      // Path label (y=146, w=350, h=16)
                      Text(
                        'Professional Presenting',
                        key: pathLabelKey,
                        style: AuratioTypography.caption.copyWith(
                          color: AuratioColors.neutral500,
                          fontSize: 11,
                          height: 16 / 11,
                          fontWeight: FontWeight.w500,
                        ),
                      ),

                      const SizedBox(height: 16),

                      // Mode Pills Row (y=178, h=34)
                      Row(
                        key: modePillsRowKey,
                        children: [
                          // AI (unselected - interactive)
                          Semantics(
                            button: true,
                            enabled: true,
                            label: 'AI Leaderboard',
                            child: GestureDetector(
                              key: modeAiPillKey,
                              behavior: HitTestBehavior.opaque,
                              onTap: () =>
                                  context.go(AppRoutePaths.leaderboard),
                              child: Container(
                                width: 84,
                                height: 34,
                                alignment: Alignment.center,
                                decoration: BoxDecoration(
                                  color: AuratioColors.surfaceDefault,
                                  border: Border.all(
                                    color: AuratioColors.borderStrong,
                                  ),
                                  borderRadius: BorderRadius.circular(999),
                                ),
                                child: Text(
                                  'AI',
                                  style: AuratioTypography.caption.copyWith(
                                    color: AuratioColors.backgroundBrand,
                                    fontSize: 11,
                                    height: 16 / 11,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),

                          // Human (selected - presentation only)
                          Container(
                            key: modeHumanPillKey,
                            width: 84,
                            height: 34,
                            alignment: Alignment.center,
                            decoration: BoxDecoration(
                              color: AuratioColors.backgroundBrand,
                              borderRadius: BorderRadius.circular(999),
                            ),
                            child: Text(
                              'Human',
                              style: AuratioTypography.caption.copyWith(
                                color: AuratioColors.textOnBrand,
                                fontSize: 11,
                                height: 16 / 11,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 12),

                      // Period Pills Row (y=224, h=34)
                      Row(
                        key: periodPillsRowKey,
                        children: [
                          GestureDetector(
                            behavior: HitTestBehavior.opaque,
                            onTap: () => ref
                                .read(leaderboardPeriodProvider.notifier)
                                .setPeriod(LeaderboardPeriod.allTime),
                            child: Container(
                              key: periodAllTimePillKey,
                              width: 100,
                              height: 34,
                              alignment: Alignment.center,
                              decoration: BoxDecoration(
                                color: isMonthly
                                    ? AuratioColors.surfaceDefault
                                    : const Color(0xFF53A6E6),
                                border: isMonthly
                                    ? Border.all(
                                        color: AuratioColors.borderStrong,
                                      )
                                    : null,
                                borderRadius: BorderRadius.circular(999),
                              ),
                              child: Text(
                                'All-Time',
                                style: AuratioTypography.caption.copyWith(
                                  color: AuratioColors.backgroundBrand,
                                  fontSize: 11,
                                  height: 16 / 11,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          GestureDetector(
                            behavior: HitTestBehavior.opaque,
                            onTap: () => ref
                                .read(leaderboardPeriodProvider.notifier)
                                .setPeriod(LeaderboardPeriod.monthly),
                            child: Container(
                              key: periodMonthlyPillKey,
                              width: 100,
                              height: 34,
                              alignment: Alignment.center,
                              decoration: BoxDecoration(
                                color: isMonthly
                                    ? const Color(0xFF53A6E6)
                                    : AuratioColors.surfaceDefault,
                                border: isMonthly
                                    ? null
                                    : Border.all(
                                        color: AuratioColors.borderStrong,
                                      ),
                                borderRadius: BorderRadius.circular(999),
                              ),
                              child: Text(
                                'Monthly',
                                style: AuratioTypography.caption.copyWith(
                                  color: AuratioColors.backgroundBrand,
                                  fontSize: 11,
                                  height: 16 / 11,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 16),

                      // Qualification Card (y=274, w=350, h=98)
                      SizedBox(
                        key: qualificationCardKey,
                        width: double.infinity,
                        height: 98,
                        child: Container(
                          padding: const EdgeInsets.fromLTRB(14, 16, 14, 14),
                          decoration: BoxDecoration(
                            color: AuratioColors.statusPendingBackground,
                            border: Border.all(
                              color: AuratioColors.borderDefault,
                            ),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Not ranked yet',
                                style: AuratioTypography.bodyMedium.copyWith(
                                  color: AuratioColors.statusPendingForeground,
                                  fontSize: 13,
                                  height: 19 / 13,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              Text(
                                isMonthly
                                    ? '2 of 3 Approved Human evaluations submitted this calendar month (D = 1.00).'
                                    : '2 of 3 Approved Human evaluations in this scope.',
                                style: AuratioTypography.bodySmall.copyWith(
                                  color: AuratioColors.textSecondary,
                                  fontSize: isMonthly ? 11 : 12,
                                  height: isMonthly ? 14 / 11 : 18 / 12,
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                              Text(
                                'AI approvals cannot qualify the Human leaderboard.',
                                style: AuratioTypography.caption.copyWith(
                                  color: AuratioColors.neutral500,
                                  fontSize: isMonthly ? 10 : 11,
                                  height: isMonthly ? 13 / 10 : 16 / 11,
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(height: 20),

                      // Ranking Section Label (y=392, w=350, h=20)
                      SizedBox(
                        key: rankingSectionLabelKey,
                        width: double.infinity,
                        height: 20,
                        child: Text(
                          isMonthly
                              ? 'MONTHLY HUMAN RANKING'
                              : 'ALL-TIME HUMAN RANKING',
                          style: AuratioTypography.caption.copyWith(
                            color: AuratioColors.neutral500,
                            fontSize: 11,
                            height: 16 / 11,
                            fontWeight: FontWeight.w500,
                            letterSpacing: 0.2,
                          ),
                        ),
                      ),

                      const SizedBox(height: 10),

                      // Ranking Card 1 (y=422, w=350, h=56)
                      LeaderboardRankCard(
                        key: rankCard1Key,
                        rank: '1',
                        name: isMonthly ? 'Speaker B' : 'Speaker A',
                        alr: isMonthly ? 'ALR 93.0' : 'ALR 92.4',
                        participation: isMonthly
                            ? 'Participation 3'
                            : 'Participation 7',
                      ),

                      const SizedBox(height: 10),

                      // Ranking Card 2 (y=488, w=350, h=56)
                      LeaderboardRankCard(
                        key: rankCard2Key,
                        rank: '2',
                        name: isMonthly ? 'Speaker A' : 'Speaker B',
                        alr: isMonthly ? 'ALR 90.5' : 'ALR 90.9',
                        participation: isMonthly
                            ? 'Participation 2'
                            : 'Participation 5',
                      ),

                      const SizedBox(height: 10),

                      // Ranking Card 3 (y=554, w=350, h=56)
                      LeaderboardRankCard(
                        key: rankCard3Key,
                        rank: '3',
                        name: isMonthly ? 'Speaker D' : 'Speaker C',
                        alr: isMonthly ? 'ALR 88.0' : 'ALR 89.7',
                        participation: isMonthly
                            ? 'Participation 3'
                            : 'Participation 9',
                      ),

                      const SizedBox(height: 22),

                      // Your Qualification Card (y=632, w=350, h=74)
                      SizedBox(
                        key: yourQualificationCardKey,
                        width: double.infinity,
                        height: 74,
                        child: Container(
                          padding: const EdgeInsets.fromLTRB(14, 14, 14, 12),
                          decoration: BoxDecoration(
                            color: AuratioColors.brandBlue50,
                            border: Border.all(
                              color: AuratioColors.borderDefault,
                            ),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Your qualification',
                                style: AuratioTypography.bodySmall.copyWith(
                                  color: AuratioColors.backgroundBrand,
                                  fontSize: 12,
                                  height: 18 / 12,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              Text(
                                isMonthly
                                    ? '1 more Approved Human evaluation required this month'
                                    : '1 more Approved Human evaluation required',
                                style: AuratioTypography.caption.copyWith(
                                  color: AuratioColors.textSecondary,
                                  fontSize: 11,
                                  height: 16 / 11,
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(height: 12),

                      // How Ranking Works (y=718, w=350, h=48)
                      SizedBox(
                        key: howRankingWorksKey,
                        width: double.infinity,
                        height: 48,
                        child: GestureDetector(
                          behavior: HitTestBehavior.opaque,
                          onTap: () {
                            showDialog<void>(
                              context: context,
                              useSafeArea: false,
                              builder: (_) => const HowRankingWorksModal(),
                            );
                          },
                          child: Container(
                            alignment: Alignment.center,
                            decoration: BoxDecoration(
                              color: AuratioColors.surfaceDefault,
                              border: Border.all(
                                color: AuratioColors.borderStrong,
                              ),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              'How Ranking Works',
                              style: AuratioTypography.labelLarge.copyWith(
                                color: AuratioColors.backgroundBrand,
                                fontSize: 14,
                                height: 20 / 14,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ),
                      ),

                      const SizedBox(height: 24),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
