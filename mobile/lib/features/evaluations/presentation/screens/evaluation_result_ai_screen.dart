import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router/app_route_paths.dart';
import '../../../../foundation/design_system/auratio_design_system.dart';
import '../../../shared/presentation/widgets/auratio_screen_header.dart';

class EvaluationResultAiScreen extends StatelessWidget {
  const EvaluationResultAiScreen({super.key});

  static const screenKey = Key('evaluation-result-ai-screen');
  static const badgeKey = Key('evaluation-result-ai-badge');
  static const headingKey = Key('evaluation-result-ai-heading');
  static const methodKey = Key('evaluation-result-ai-method');
  static const scoreCardKey = Key('evaluation-result-ai-score-card');
  static const scoreTextKey = Key('evaluation-result-ai-score-text');
  static const feedbackCardKey = Key('evaluation-result-ai-feedback-card');
  static const openReportButtonKey = Key(
    'evaluation-result-ai-open-report-button',
  );
  static const backHomeButtonKey = Key('evaluation-result-ai-back-home-button');

  static const _overlayStyle = SystemUiOverlayStyle(
    statusBarColor: AuratioColors.backgroundBrand,
    statusBarIconBrightness: Brightness.light,
    statusBarBrightness: Brightness.dark,
    systemNavigationBarColor: AuratioColors.backgroundApp,
    systemNavigationBarIconBrightness: Brightness.dark,
  );

  @override
  Widget build(BuildContext context) {
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

                      // Track Heading (y=164, w=350)
                      Text(
                        'Business Pitch / Sales Pitch',
                        key: headingKey,
                        style: AuratioTypography.headingMedium.copyWith(
                          color: AuratioColors.textPrimary,
                          fontSize: 21,
                          height: 29 / 21,
                          fontWeight: FontWeight.w700,
                          letterSpacing: -0.3,
                        ),
                      ),

                      const SizedBox(height: 5),

                      // Method Label (y=198, w=350)
                      Text(
                        'AI Evaluation',
                        key: methodKey,
                        style: AuratioTypography.bodySmall.copyWith(
                          color: AuratioColors.neutral500,
                          fontSize: 12,
                          height: 18 / 12,
                          fontWeight: FontWeight.w500,
                        ),
                      ),

                      const SizedBox(height: 20),

                      // Total Score Card (y=236, w=350, h=164)
                      SizedBox(
                        key: scoreCardKey,
                        width: double.infinity,
                        height: 164,
                        child: Container(
                          padding: const EdgeInsets.fromLTRB(16, 14, 16, 8),
                          decoration: BoxDecoration(
                            color: AuratioColors.backgroundBrand,
                            border: Border.all(
                              color: AuratioColors.borderDefault,
                            ),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'TOTAL SCORE',
                                style: AuratioTypography.caption.copyWith(
                                  color: AuratioColors.neutral500,
                                  fontSize: 11,
                                  height: 16 / 11,
                                  fontWeight: FontWeight.w500,
                                  letterSpacing: 0.2,
                                ),
                              ),
                              const SizedBox(height: 10),
                              Text(
                                '88 / 100',
                                key: scoreTextKey,
                                style: AuratioTypography.headingLarge.copyWith(
                                  color: AuratioColors.textOnBrand,
                                  fontSize: 34,
                                  height: 38 / 34,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'Universal Delivery  35 / 40',
                                style: AuratioTypography.bodySmall.copyWith(
                                  color: AuratioColors.brandBlue200,
                                  fontSize: 12,
                                  height: 16 / 12,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Structural Flow  18 / 20',
                                style: AuratioTypography.bodySmall.copyWith(
                                  color: AuratioColors.brandBlue200,
                                  fontSize: 12,
                                  height: 16 / 12,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Track Specialisation  35 / 40',
                                style: AuratioTypography.bodySmall.copyWith(
                                  color: AuratioColors.brandBlue200,
                                  fontSize: 12,
                                  height: 16 / 12,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(height: 18),

                      // Feedback Evidence Card (y=418, w=350, h=134)
                      SizedBox(
                        key: feedbackCardKey,
                        width: double.infinity,
                        height: 134,
                        child: Container(
                          padding: const EdgeInsets.fromLTRB(14, 14, 14, 10),
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
                                'Feedback evidence',
                                style: AuratioTypography.labelLarge.copyWith(
                                  color: AuratioColors.textPrimary,
                                  fontSize: 14,
                                  height: 20 / 14,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'Criterion-level feedback includes timestamped evidence, strength, weakness, and actionable improvement advice. Open the official .docx report for the complete Approved evaluation.',
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
                      ),

                      const SizedBox(height: 136),

                      // Primary CTA: Open Evaluation Report (y=688, w=350, h=48) - Batch 7 boundary
                      SizedBox(
                        height: 48,
                        width: double.infinity,
                        child: AuratioButton(
                          key: openReportButtonKey,
                          label: 'Open Evaluation Report',
                          variant: AuratioButtonVariant.primary,
                          expand: true,
                          onPressed: _openReportAtBatchSevenBoundary,
                        ),
                      ),

                      const SizedBox(height: 14),

                      // Secondary CTA: Back to Home (y=750, w=350, h=48)
                      SizedBox(
                        height: 48,
                        width: double.infinity,
                        child: AuratioButton(
                          key: backHomeButtonKey,
                          label: 'Back to Home',
                          variant: AuratioButtonVariant.secondary,
                          expand: true,
                          onPressed: () => context.go(AppRoutePaths.home),
                        ),
                      ),

                      const SizedBox(height: 46),
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

  static void _openReportAtBatchSevenBoundary() {
    // 282:446 — P — Evaluation Report belongs to Batch 8.
    // Kept presentation-only/no-op at the Batch 7 boundary.
  }
}
