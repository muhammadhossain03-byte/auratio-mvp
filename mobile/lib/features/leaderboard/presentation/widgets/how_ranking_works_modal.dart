import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../../../foundation/design_system/auratio_design_system.dart';
import '../../../shared/presentation/widgets/auratio_screen_header.dart';

class HowRankingWorksModal extends StatelessWidget {
  const HowRankingWorksModal({super.key});

  static const modalKey = Key('how-ranking-works-modal');
  static const titleKey = Key('how-ranking-works-title');
  static const qualificationCardKey = Key(
    'how-ranking-works-qualification-card',
  );
  static const alrCardKey = Key('how-ranking-works-alr-card');
  static const rankingDetailsCardKey = Key(
    'how-ranking-works-ranking-details-card',
  );
  static const backToLeaderboardButtonKey = Key(
    'how-ranking-works-back-to-leaderboard-button',
  );

  static const _overlayStyle = SystemUiOverlayStyle(
    statusBarColor: AuratioColors.backgroundBrand,
    statusBarIconBrightness: Brightness.light,
    statusBarBrightness: Brightness.dark,
    systemNavigationBarColor: AuratioColors.surfaceDefault,
    systemNavigationBarIconBrightness: Brightness.dark,
  );

  @override
  Widget build(BuildContext context) {
    return Dialog.fullscreen(
      key: modalKey,
      child: AnnotatedRegion<SystemUiOverlayStyle>(
        value: _overlayStyle,
        child: Scaffold(
          backgroundColor: AuratioColors.backgroundApp,
          body: SafeArea(
            top: false,
            child: Column(
              children: [
                AuratioScreenHeader(
                  title: 'How Ranking Works',
                  showBack: true,
                  onBack: () => Navigator.of(context).pop(),
                ),
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 28),

                        // Section Title: Qualification & ALR (y=120)
                        Text(
                          'Qualification & ALR',
                          key: titleKey,
                          style: AuratioTypography.headingMedium.copyWith(
                            color: AuratioColors.textPrimary,
                            fontSize: 24,
                            height: 32 / 24,
                            fontWeight: FontWeight.w700,
                          ),
                        ),

                        const SizedBox(height: 18),

                        // Card 1: Qualification (y=172, h=118)
                        Container(
                          key: qualificationCardKey,
                          width: double.infinity,
                          padding: const EdgeInsets.fromLTRB(14, 16, 14, 16),
                          decoration: BoxDecoration(
                            color: AuratioColors.surfaceDefault,
                            border: Border.all(
                              color: AuratioColors.borderDefault,
                            ),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Qualification',
                                style: AuratioTypography.labelLarge.copyWith(
                                  color: AuratioColors.textPrimary,
                                  fontSize: 14,
                                  height: 20 / 14,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(height: 10),
                              Text(
                                '3 Approved evaluations are required in the same track, evaluation mode, and period. A mixed 2 AI + 1 Human set qualifies neither.',
                                style: AuratioTypography.bodySmall.copyWith(
                                  color: AuratioColors.textSecondary,
                                  fontSize: 12,
                                  height: 18 / 12,
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(height: 18),

                        // Card 2: Auratio Leaderboard Rating (y=308, h=196)
                        Container(
                          key: alrCardKey,
                          width: double.infinity,
                          padding: const EdgeInsets.fromLTRB(14, 16, 14, 16),
                          decoration: BoxDecoration(
                            color: AuratioColors.brandBlue50,
                            border: Border.all(
                              color: AuratioColors.borderDefault,
                            ),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Auratio Leaderboard Rating',
                                style: AuratioTypography.labelLarge.copyWith(
                                  color: AuratioColors.backgroundBrand,
                                  fontSize: 14,
                                  height: 20 / 14,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(height: 10),
                              Text(
                                'ALR = Sform × D',
                                style: AuratioTypography.headingMedium.copyWith(
                                  color: AuratioColors.backgroundBrand,
                                  fontSize: 20,
                                  height: 28 / 20,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                              const SizedBox(height: 10),
                              Text(
                                '3 Approved: average all 3\n4 Approved: average all 4\n5+: five most recent, discard the lowest, average remaining 4',
                                style: AuratioTypography.bodySmall.copyWith(
                                  color: AuratioColors.textSecondary,
                                  fontSize: 12,
                                  height: 22 / 12,
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                              const SizedBox(height: 12),
                              Text(
                                'All-Time applies activity decay. Monthly uses D = 1.00.',
                                style: AuratioTypography.caption.copyWith(
                                  color: AuratioColors.neutral500,
                                  fontSize: 11,
                                  height: 16 / 11,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(height: 18),

                        // Card 3: Ranking details (y=522, h=128)
                        Container(
                          key: rankingDetailsCardKey,
                          width: double.infinity,
                          padding: const EdgeInsets.fromLTRB(14, 16, 14, 16),
                          decoration: BoxDecoration(
                            color: AuratioColors.surfaceDefault,
                            border: Border.all(
                              color: AuratioColors.borderDefault,
                            ),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Ranking details',
                                style: AuratioTypography.labelLarge.copyWith(
                                  color: AuratioColors.textPrimary,
                                  fontSize: 14,
                                  height: 20 / 14,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(height: 10),
                              Text(
                                'Participation is informational only. Ordering uses unrounded ALR. Tie-break: full-window average → best Approved score → earlier qualification date.',
                                style: AuratioTypography.bodySmall.copyWith(
                                  color: AuratioColors.textSecondary,
                                  fontSize: 12,
                                  height: 18 / 12,
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(height: 24),

                        // Back to Leaderboard Button (y=750, h=48)
                        Semantics(
                          button: true,
                          enabled: true,
                          label: 'Back to Leaderboard',
                          excludeSemantics: true,
                          child: GestureDetector(
                            key: backToLeaderboardButtonKey,
                            behavior: HitTestBehavior.opaque,
                            onTap: () => Navigator.of(context).pop(),
                            child: Container(
                              width: double.infinity,
                              height: 48,
                              alignment: Alignment.center,
                              decoration: BoxDecoration(
                                color: AuratioColors.surfaceDefault,
                                border: Border.all(
                                  color: AuratioColors.borderStrong,
                                ),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                'Back to Leaderboard',
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
      ),
    );
  }
}
