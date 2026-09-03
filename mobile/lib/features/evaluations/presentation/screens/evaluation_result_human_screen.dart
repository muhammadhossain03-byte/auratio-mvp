import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router/app_route_paths.dart';
import '../../../../foundation/design_system/auratio_design_system.dart';
import '../../../shared/presentation/widgets/auratio_screen_header.dart';
import '../../../tracks/application/selected_track_provider.dart';
import '../../../tracks/domain/track_catalog.dart';

class EvaluationResultHumanScreen extends ConsumerWidget {
  const EvaluationResultHumanScreen({this.trackSlug, super.key});

  final String? trackSlug;

  static const screenKey = Key('evaluation-result-human-screen');
  static const badgeKey = Key('evaluation-result-human-badge');
  static const headingKey = Key('evaluation-result-human-heading');
  static const methodKey = Key('evaluation-result-human-method');
  static const scoreCardKey = Key('evaluation-result-human-score-card');
  static const scoreTextKey = Key('evaluation-result-human-score-text');
  static const breakdownUniversalKey = Key(
    'evaluation-result-human-breakdown-universal',
  );
  static const breakdownStructuralKey = Key(
    'evaluation-result-human-breakdown-structural',
  );
  static const breakdownTrackKey = Key(
    'evaluation-result-human-breakdown-track',
  );
  static const reportCardKey = Key('evaluation-result-human-report-card');
  static const viewReportButtonKey = Key(
    'evaluation-result-human-view-report-button',
  );
  static const footerKey = Key('evaluation-result-human-footer');

  static const _overlayStyle = SystemUiOverlayStyle(
    statusBarColor: AuratioColors.backgroundBrand,
    statusBarIconBrightness: Brightness.light,
    statusBarBrightness: Brightness.dark,
    systemNavigationBarColor: AuratioColors.backgroundApp,
    systemNavigationBarIconBrightness: Brightness.dark,
  );

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final activeTrack = ref.watch(selectedTrackProvider);
    final track =
        (trackSlug != null
            ? AuratioTrackCatalog.findBySlug(trackSlug!)
            : null) ??
        activeTrack;

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
                title: 'Evaluation Result',
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

                      // Status Badge: Approved (y=116, w=80, h=30)
                      SizedBox(
                        key: badgeKey,
                        width: 80,
                        height: 30,
                        child: Container(
                          alignment: Alignment.center,
                          decoration: BoxDecoration(
                            color: AuratioColors.statusApprovedBackground,
                            borderRadius: BorderRadius.circular(999),
                          ),
                          child: Text(
                            'Approved',
                            textAlign: TextAlign.center,
                            style: AuratioTypography.caption.copyWith(
                              color: AuratioColors.statusApprovedForeground,
                              fontSize: 11,
                              height: 16 / 11,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ),

                      const SizedBox(height: 18),

                      // Track Heading (y=164, w=350, h=32)
                      Text(
                        track.name,
                        key: headingKey,
                        style: AuratioTypography.headingMedium.copyWith(
                          color: AuratioColors.textPrimary,
                          fontSize: 24,
                          height: 32 / 24,
                          fontWeight: FontWeight.w700,
                          letterSpacing: -0.3,
                        ),
                      ),

                      const SizedBox(height: 8),

                      // Method Label (y=204, w=350, h=18)
                      Text(
                        'Human Evaluation',
                        key: methodKey,
                        style: AuratioTypography.bodySmall.copyWith(
                          color: AuratioColors.textSecondary,
                          fontSize: 12,
                          height: 18 / 12,
                          fontWeight: FontWeight.w400,
                        ),
                      ),

                      const SizedBox(height: 22),

                      // Total Score Card (y=244, w=350, h=148)
                      SizedBox(
                        key: scoreCardKey,
                        width: double.infinity,
                        height: 148,
                        child: Container(
                          padding: const EdgeInsets.fromLTRB(20, 20, 20, 18),
                          decoration: BoxDecoration(
                            color: AuratioColors.backgroundBrand,
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'TOTAL SCORE',
                                style: AuratioTypography.caption.copyWith(
                                  color: AuratioColors.brandBlue200,
                                  fontSize: 11,
                                  height: 16 / 11,
                                  fontWeight: FontWeight.w500,
                                  letterSpacing: 0.2,
                                ),
                              ),
                              const SizedBox(height: 12),
                              Text(
                                'XX / 100',
                                key: scoreTextKey,
                                style: AuratioTypography.displayExtraLarge
                                    .copyWith(
                                      color: AuratioColors.textOnBrand,
                                      fontSize: 40,
                                      height: 48 / 40,
                                      fontWeight: FontWeight.w800,
                                      letterSpacing: -0.3,
                                    ),
                              ),
                              const SizedBox(height: 14),
                              Text(
                                'Approved • score is now effective',
                                style: AuratioTypography.bodySmall.copyWith(
                                  color: AuratioColors.brandBlue200,
                                  fontSize: 12,
                                  height: 18 / 12,
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(height: 26),

                      // Section Caption (y=418, w=350, h=16)
                      Text(
                        'SCORE BREAKDOWN',
                        style: AuratioTypography.caption.copyWith(
                          color: AuratioColors.neutral500,
                          fontSize: 11,
                          height: 16 / 11,
                          fontWeight: FontWeight.w500,
                          letterSpacing: 0.2,
                        ),
                      ),

                      const SizedBox(height: 10),

                      // Breakdown Card 1: Universal Delivery (y=444, w=350, h=56)
                      _ScoreBreakdownCard(
                        key: breakdownUniversalKey,
                        label: 'Universal Delivery',
                        score: 'XX / 40',
                      ),

                      const SizedBox(height: 12),

                      // Breakdown Card 2: Structural Flow (y=512, w=350, h=56)
                      _ScoreBreakdownCard(
                        key: breakdownStructuralKey,
                        label: 'Structural Flow',
                        score: 'XX / 20',
                      ),

                      const SizedBox(height: 12),

                      // Breakdown Card 3: Track Specialisation (y=580, w=350, h=56)
                      _ScoreBreakdownCard(
                        key: breakdownTrackKey,
                        label: 'Track Specialisation',
                        score: 'XX / 40',
                      ),

                      const SizedBox(height: 24),

                      // Report Info Card (y=660, w=350, h=72)
                      SizedBox(
                        key: reportCardKey,
                        width: double.infinity,
                        height: 72,
                        child: Container(
                          padding: const EdgeInsets.fromLTRB(14, 8, 14, 4),
                          decoration: BoxDecoration(
                            color: AuratioColors.surfaceBrandSoft,
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                '.docx evaluation report',
                                style: AuratioTypography.labelLarge.copyWith(
                                  color: AuratioColors.textPrimary,
                                  fontSize: 14,
                                  height: 20 / 14,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'The report remains available after the temporary video is deleted.',
                                style: AuratioTypography.caption.copyWith(
                                  color: AuratioColors.textSecondary,
                                  fontSize: 11,
                                  height: 16 / 11,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(height: 16),

                      // Primary CTA: View Evaluation Report (y=748, w=350, h=48)
                      SizedBox(
                        height: 48,
                        width: double.infinity,
                        child: AuratioButton(
                          key: viewReportButtonKey,
                          label: 'View Evaluation Report',
                          variant: AuratioButtonVariant.primary,
                          expand: true,
                          onPressed: () =>
                              context.push(AppRoutePaths.evaluationReport),
                        ),
                      ),

                      const SizedBox(height: 10),

                      // Footer (y=806, w=350, h=32)
                      Text(
                        'Final decision published • temporary video deletion follows the defined lifecycle.',
                        key: footerKey,
                        style: AuratioTypography.caption.copyWith(
                          color: AuratioColors.neutral500,
                          fontSize: 11,
                          height: 16 / 11,
                          fontWeight: FontWeight.w500,
                          letterSpacing: 0.2,
                        ),
                      ),

                      const SizedBox(height: 6),
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

class _ScoreBreakdownCard extends StatelessWidget {
  const _ScoreBreakdownCard({
    required this.label,
    required this.score,
    super.key,
  });

  final String label;
  final String score;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 56,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 18),
        decoration: BoxDecoration(
          color: AuratioColors.surfaceDefault,
          border: Border.all(color: AuratioColors.borderDefault),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              label,
              style: AuratioTypography.bodyMedium.copyWith(
                color: AuratioColors.textPrimary,
                fontSize: 14,
                height: 20 / 14,
                fontWeight: FontWeight.w400,
              ),
            ),
            Text(
              score,
              style: AuratioTypography.labelLarge.copyWith(
                color: AuratioColors.textPrimary,
                fontSize: 14,
                height: 20 / 14,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
