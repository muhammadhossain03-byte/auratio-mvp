import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router/app_route_paths.dart';
import '../../../../foundation/design_system/auratio_design_system.dart';
import '../../../shared/presentation/widgets/auratio_screen_header.dart';
import '../../domain/evaluation_method.dart';

class EvaluationRoutingScreen extends StatelessWidget {
  const EvaluationRoutingScreen({required this.method, super.key});

  final EvaluationMethod method;

  static const aiScreenKey = Key('routing-assigned-ai-screen');
  static const humanScreenKey = Key('routing-assigned-human-screen');
  static const badgeKey = Key('routing-assigned-badge');
  static const headingKey = Key('routing-assigned-heading');
  static const statusCardKey = Key('routing-assigned-status-card');
  static const infoCardKey = Key('routing-assigned-info-card');
  static const continueButtonKey = Key('routing-assigned-continue-button');

  static const _overlayStyle = SystemUiOverlayStyle(
    statusBarColor: AuratioColors.backgroundBrand,
    statusBarIconBrightness: Brightness.light,
    statusBarBrightness: Brightness.dark,
    systemNavigationBarColor: AuratioColors.backgroundApp,
    systemNavigationBarIconBrightness: Brightness.dark,
  );

  bool get _isAi => method == EvaluationMethod.ai;

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      key: _isAi ? aiScreenKey : humanScreenKey,
      value: _overlayStyle,
      child: Scaffold(
        backgroundColor: AuratioColors.backgroundApp,
        body: SafeArea(
          top: false,
          child: Column(
            children: [
              AuratioScreenHeader(
                title: 'Evaluation Routing',
                showBack: true,
                onBack: () => context.go(AppRoutePaths.chooseEvaluationMethod),
              ),
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AuratioSpacing.xl,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 24),

                      // Assigned pill badge (y=116, h=30)
                      Container(
                        key: badgeKey,
                        width: _isAi ? 122 : 143,
                        height: 30,
                        decoration: BoxDecoration(
                          color: AuratioColors.surfaceBrandSoft,
                          borderRadius: BorderRadius.circular(
                            AuratioRadii.pill,
                          ),
                        ),
                        child: Center(
                          child: Text(
                            method.badgeLabel,
                            style: AuratioTypography.caption.copyWith(
                              color: AuratioColors.backgroundBrand,
                              fontSize: 11,
                              height: 16 / 11,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ),

                      const SizedBox(height: 18),

                      // Heading (y=164)
                      Text(
                        method.assignedTitle,
                        key: headingKey,
                        style: AuratioTypography.headingMedium.copyWith(
                          color: AuratioColors.textPrimary,
                          fontSize: 24,
                          height: 32 / 24,
                          fontWeight: FontWeight.w700,
                          letterSpacing: -0.3,
                        ),
                      ),

                      const SizedBox(height: 24),

                      // Routing status card (h=116, w=350)
                      SizedBox(
                        key: statusCardKey,
                        width: double.infinity,
                        height: 116,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 14,
                            vertical: 16,
                          ),
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
                                'ROUTING STATUS',
                                style: AuratioTypography.caption.copyWith(
                                  color: AuratioColors.neutral500,
                                  fontSize: 11,
                                  height: 16 / 11,
                                  fontWeight: FontWeight.w500,
                                  letterSpacing: 0.2,
                                ),
                              ),
                              const SizedBox(height: 12),
                              Text(
                                'Requested method: ${method.displayName}',
                                style: AuratioTypography.bodyMedium.copyWith(
                                  color: AuratioColors.textPrimary,
                                  fontSize: 13,
                                  height: 19 / 13,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              const SizedBox(height: 7),
                              Text(
                                'Current routing: ${method.badgeLabel}',
                                style: AuratioTypography.bodyMedium.copyWith(
                                  color: AuratioColors.textPrimary,
                                  fontSize: 13,
                                  height: 19 / 13,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(height: 18),

                      // Info card (w=350, h=144 for AI, h=218 for Human)
                      SizedBox(
                        key: infoCardKey,
                        width: double.infinity,
                        height: _isAi ? 144 : 218,
                        child: Container(
                          padding: const EdgeInsets.fromLTRB(14, 14, 14, 12),
                          decoration: BoxDecoration(
                            color: AuratioColors.surfaceBrandSoft,
                            border: Border.all(
                              color: AuratioColors.borderDefault,
                            ),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                _isAi ? 'What this means' : 'Human evaluation',
                                style: AuratioTypography.labelLarge.copyWith(
                                  color: AuratioColors.backgroundBrand,
                                  fontSize: 14,
                                  height: 20 / 14,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(height: 8),
                              if (_isAi) ...[
                                Text(
                                  'Auratio will process this recording using the configured AI evaluator.',
                                  style: AuratioTypography.bodySmall.copyWith(
                                    color: AuratioColors.textSecondary,
                                    fontSize: 12,
                                    height: 18 / 12,
                                    fontWeight: FontWeight.w400,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  'Routing decides who evaluates. Publication/moderation is a separate later stage.',
                                  style: AuratioTypography.bodySmall.copyWith(
                                    color: AuratioColors.textSecondary,
                                    fontSize: 12,
                                    height: 18 / 12,
                                    fontWeight: FontWeight.w400,
                                  ),
                                ),
                              ] else ...[
                                Text(
                                  'An authorized evaluator completes the standardized rubric, criterion-specific anchor assessment, exact scores, and required structured feedback. The official .docx report is generated automatically only after publication approval.',
                                  style: AuratioTypography.bodySmall.copyWith(
                                    color: AuratioColors.textSecondary,
                                    fontSize: 12,
                                    height: 18 / 12,
                                    fontWeight: FontWeight.w400,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  'If this is your first Human Evaluation in this track, manual admin review is required before the score can take effect.',
                                  style: AuratioTypography.bodySmall.copyWith(
                                    color: AuratioColors.textSecondary,
                                    fontSize: 12,
                                    height: 18 / 12,
                                    fontWeight: FontWeight.w400,
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                      ),

                      SizedBox(height: _isAi ? 252 : 178),

                      // Continue CTA (y=750, h=48) - Batch 5 boundary
                      SizedBox(
                        height: 48,
                        width: double.infinity,
                        child: AuratioButton(
                          key: continueButtonKey,
                          label: 'Continue to Status',
                          variant: AuratioButtonVariant.primary,
                          expand: true,
                          onPressed: _continueAtBatchFiveBoundary,
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

  static void _continueAtBatchFiveBoundary() {
    // 282:374 — Evaluation Status • Processing belongs to a future batch.
    // Kept presentation-only/no-op at the Batch 5 boundary.
  }
}
