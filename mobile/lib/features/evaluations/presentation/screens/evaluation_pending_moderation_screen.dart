import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router/app_route_paths.dart';
import '../../../../foundation/design_system/auratio_design_system.dart';
import '../../../shared/presentation/widgets/auratio_screen_header.dart';

class EvaluationPendingModerationScreen extends StatefulWidget {
  const EvaluationPendingModerationScreen({
    this.enableAutoTransition = true,
    super.key,
  });

  final bool enableAutoTransition;

  static const screenKey = Key('evaluation-pending-moderation-screen');
  static const badgeKey = Key('evaluation-pending-moderation-badge');
  static const headingKey = Key('evaluation-pending-moderation-heading');
  static const subtitleKey = Key('evaluation-pending-moderation-subtitle');
  static const statusCardKey = Key('evaluation-pending-moderation-status-card');
  static const whyReviewCardKey = Key(
    'evaluation-pending-moderation-why-review-card',
  );
  static const returnHomeButtonKey = Key(
    'evaluation-pending-moderation-return-home-button',
  );

  static const _overlayStyle = SystemUiOverlayStyle(
    statusBarColor: AuratioColors.backgroundBrand,
    statusBarIconBrightness: Brightness.light,
    statusBarBrightness: Brightness.dark,
    systemNavigationBarColor: AuratioColors.backgroundApp,
    systemNavigationBarIconBrightness: Brightness.dark,
  );

  @override
  State<EvaluationPendingModerationScreen> createState() =>
      _EvaluationPendingModerationScreenState();
}

class _EvaluationPendingModerationScreenState
    extends State<EvaluationPendingModerationScreen> {
  Timer? _autoTransitionTimer;

  @override
  void initState() {
    super.initState();
    if (widget.enableAutoTransition) {
      _autoTransitionTimer = Timer(const Duration(milliseconds: 2200), () {
        if (mounted) {
          context.go(AppRoutePaths.evaluationResultHuman);
        }
      });
    }
  }

  @override
  void dispose() {
    _autoTransitionTimer?.cancel();
    super.dispose();
  }

  void _onReturnHome() {
    _autoTransitionTimer?.cancel();
    context.go(AppRoutePaths.home);
  }

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      key: EvaluationPendingModerationScreen.screenKey,
      value: EvaluationPendingModerationScreen._overlayStyle,
      child: Scaffold(
        backgroundColor: AuratioColors.backgroundApp,
        body: SafeArea(
          top: false,
          child: Column(
            children: [
              const AuratioScreenHeader(
                title: 'Evaluation Status',
                showBack: true,
                onBack: null,
              ),
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 24),

                      // Status Badge: Pending Moderation (y=116, w=150, h=30)
                      SizedBox(
                        key: EvaluationPendingModerationScreen.badgeKey,
                        width: 150,
                        height: 30,
                        child: Container(
                          alignment: Alignment.center,
                          decoration: BoxDecoration(
                            color: AuratioColors.statusPendingBackground,
                            borderRadius: BorderRadius.circular(999),
                          ),
                          child: Text(
                            'Pending Moderation',
                            textAlign: TextAlign.center,
                            style: AuratioTypography.caption.copyWith(
                              color: AuratioColors.statusPendingForeground,
                              fontSize: 11,
                              height: 16 / 11,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ),

                      const SizedBox(height: 18),

                      // Heading (y=164, w=350, h=52)
                      Text(
                        'Review is required before publication',
                        key: EvaluationPendingModerationScreen.headingKey,
                        style: AuratioTypography.headingMedium.copyWith(
                          color: AuratioColors.textPrimary,
                          fontSize: 22,
                          height: 26 / 22,
                          fontWeight: FontWeight.w700,
                          letterSpacing: -0.3,
                        ),
                      ),

                      const SizedBox(height: 4),

                      // Subtitle (y=220, w=350, h=38)
                      Text(
                        'The score is complete but cannot take effect until admin review is resolved.',
                        key: EvaluationPendingModerationScreen.subtitleKey,
                        style: AuratioTypography.bodyMedium.copyWith(
                          color: AuratioColors.textSecondary,
                          fontSize: 13,
                          height: 19 / 13,
                          fontWeight: FontWeight.w400,
                        ),
                      ),

                      const SizedBox(height: 24),

                      // Publication Status Card (y=282, w=350, h=118)
                      SizedBox(
                        key: EvaluationPendingModerationScreen.statusCardKey,
                        width: double.infinity,
                        height: 118,
                        child: Container(
                          padding: const EdgeInsets.fromLTRB(14, 14, 14, 12),
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
                                'PUBLICATION STATUS',
                                style: AuratioTypography.caption.copyWith(
                                  color: AuratioColors.neutral500,
                                  fontSize: 11,
                                  height: 14 / 11,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              Text(
                                'Pending Moderation',
                                style: AuratioTypography.labelLarge.copyWith(
                                  color: AuratioColors.statusPendingForeground,
                                  fontSize: 14,
                                  height: 20 / 14,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              Text(
                                'The score may be visible as pending, but it does not update private progress or public ranking.',
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

                      // Why review may be required Card (y=418, w=350, h=158)
                      SizedBox(
                        key: EvaluationPendingModerationScreen.whyReviewCardKey,
                        width: double.infinity,
                        height: 158,
                        child: Container(
                          padding: const EdgeInsets.fromLTRB(14, 14, 14, 12),
                          decoration: BoxDecoration(
                            color: AuratioColors.surfaceDefault,
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
                                'Why review may be required',
                                style: AuratioTypography.labelLarge.copyWith(
                                  color: AuratioColors.textPrimary,
                                  fontSize: 14,
                                  height: 20 / 14,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              Text(
                                'Human: first evaluation in a track, or a later score more than ±15 points from prior Approved Human average.',
                                style: AuratioTypography.bodySmall.copyWith(
                                  color: AuratioColors.textSecondary,
                                  fontSize: 12,
                                  height: 16 / 12,
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                              Text(
                                'MVP scope: Pending Moderation applies to Human Evaluation only. A failed or unusable AI Evaluation becomes Rejected after its single attempt.',
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

                      const SizedBox(height: 174),

                      // Bottom CTA: Return to Home (y=750, w=350, h=48)
                      SizedBox(
                        height: 48,
                        width: double.infinity,
                        child: AuratioButton(
                          key:
                              EvaluationPendingModerationScreen
                                  .returnHomeButtonKey,
                          label: 'Return to Home',
                          variant: AuratioButtonVariant.secondary,
                          expand: true,
                          onPressed: _onReturnHome,
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
