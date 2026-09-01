import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router/app_route_paths.dart';
import '../../../../foundation/design_system/auratio_design_system.dart';
import '../../../shared/presentation/widgets/auratio_screen_header.dart';

class EvaluationReportScreen extends StatelessWidget {
  const EvaluationReportScreen({super.key});

  static const screenKey = Key('evaluation-report-screen');
  static const headingKey = Key('evaluation-report-heading');
  static const subtitleKey = Key('evaluation-report-subtitle');
  static const formatCardKey = Key('evaluation-report-format-card');
  static const contentsCardKey = Key('evaluation-report-contents-card');
  static const lifecycleCardKey = Key('evaluation-report-lifecycle-card');
  static const downloadButtonKey = Key('evaluation-report-download-button');
  static const backButtonKey = Key('evaluation-report-back-button');

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
                title: 'Evaluation Report',
                showBack: true,
                onBack: () => context.pop(),
              ),
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 28),

                      // Heading (y=120, w=350, h=33.6)
                      Text(
                        'Final Evaluation Report',
                        key: headingKey,
                        style: AuratioTypography.headingMedium.copyWith(
                          color: AuratioColors.textPrimary,
                          fontSize: 24,
                          height: 32 / 24,
                          fontWeight: FontWeight.w700,
                          letterSpacing: -0.3,
                        ),
                      ),

                      const SizedBox(height: 10),

                      // Subtitle (y=162, w=350, h=20)
                      Text(
                        'Downloadable Microsoft Word report for this evaluation.',
                        key: subtitleKey,
                        maxLines: 1,
                        style: AuratioTypography.bodyMedium.copyWith(
                          color: AuratioColors.textSecondary,
                          fontSize: 13,
                          height: 19 / 13,
                          fontWeight: FontWeight.w400,
                          letterSpacing: -0.2,
                        ),
                      ),

                      const SizedBox(height: 43),

                      // Card 1: REPORT FORMAT (y=224, w=350, h=108)
                      SizedBox(
                        key: formatCardKey,
                        width: double.infinity,
                        height: 108,
                        child: Container(
                          padding: const EdgeInsets.fromLTRB(14, 10, 14, 10),
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
                                'REPORT FORMAT',
                                style: AuratioTypography.caption.copyWith(
                                  color: AuratioColors.neutral500,
                                  fontSize: 11,
                                  height: 14 / 11,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              Text(
                                '.docx',
                                style: AuratioTypography.headingMedium.copyWith(
                                  color: AuratioColors.backgroundBrand,
                                  fontSize: 24,
                                  height: 28 / 24,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                              Text(
                                'The report remains accessible after the temporary video is deleted.',
                                style: AuratioTypography.bodySmall.copyWith(
                                  color: AuratioColors.textSecondary,
                                  fontSize: 12,
                                  height: 16 / 12,
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(height: 18),

                      // Card 2: Report contents (y=350, w=350, h=176)
                      SizedBox(
                        key: contentsCardKey,
                        width: double.infinity,
                        height: 176,
                        child: Container(
                          padding: const EdgeInsets.fromLTRB(14, 16, 14, 14),
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
                                'Report contents',
                                style: AuratioTypography.labelLarge.copyWith(
                                  color: AuratioColors.textPrimary,
                                  fontSize: 14,
                                  height: 20 / 14,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(height: 14),
                              const _ReportContentRow(
                                text: 'Overall and criterion-level scoring',
                              ),
                              const SizedBox(height: 10),
                              const _ReportContentRow(
                                text: 'Track-specific feedback',
                              ),
                              const SizedBox(height: 10),
                              const _ReportContentRow(
                                text: 'Timestamped evidence / justification',
                              ),
                              const SizedBox(height: 10),
                              const _ReportContentRow(
                                text: 'Evaluation-mode metadata',
                              ),
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(height: 20),

                      // Card 3: Video lifecycle (y=546, w=350, h=92)
                      SizedBox(
                        key: lifecycleCardKey,
                        width: double.infinity,
                        height: 92,
                        child: Container(
                          padding: const EdgeInsets.fromLTRB(14, 14, 14, 14),
                          decoration: BoxDecoration(
                            color: AuratioColors.surfaceSubtle,
                            border: Border.all(
                              color: AuratioColors.borderDefault,
                            ),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Video lifecycle',
                                style: AuratioTypography.bodyMedium.copyWith(
                                  color: AuratioColors.backgroundBrand,
                                  fontSize: 13,
                                  height: 19 / 13,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(height: 7),
                              Text(
                                'Final decision: Approved • Official .docx generated • Temporary-video deletion process started',
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

                      const SizedBox(height: 50),

                      // Primary CTA: Download .docx (y=688, w=350, h=48)
                      SizedBox(
                        height: 48,
                        width: double.infinity,
                        child: AuratioButton(
                          key: downloadButtonKey,
                          label: 'Download .docx',
                          variant: AuratioButtonVariant.primary,
                          expand: true,
                          onPressed: () => context.push(
                            AppRoutePaths.evaluationReportDownloadSimulated,
                          ),
                        ),
                      ),

                      const SizedBox(height: 14),

                      // Secondary CTA: Back to Result (y=750, w=350, h=48)
                      SizedBox(
                        height: 48,
                        width: double.infinity,
                        child: AuratioButton(
                          key: backButtonKey,
                          label: 'Back to Result',
                          variant: AuratioButtonVariant.secondary,
                          expand: true,
                          onPressed: () => context.pop(),
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
}

class _ReportContentRow extends StatelessWidget {
  const _ReportContentRow({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 18,
          child: Text(
            '✓',
            style: AuratioTypography.caption.copyWith(
              color: AuratioColors.brandBlue500,
              fontSize: 12,
              height: 18 / 12,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
        const SizedBox(width: 6),
        Expanded(
          child: Text(
            text,
            style: AuratioTypography.bodySmall.copyWith(
              color: AuratioColors.textSecondary,
              fontSize: 12,
              height: 18 / 12,
              fontWeight: FontWeight.w400,
            ),
          ),
        ),
      ],
    );
  }
}
