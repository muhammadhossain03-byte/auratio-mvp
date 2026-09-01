import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router/app_route_paths.dart';
import '../../../../foundation/design_system/auratio_design_system.dart';
import '../../../shared/presentation/widgets/auratio_screen_header.dart';

class EvaluationRejectedScreen extends StatelessWidget {
  const EvaluationRejectedScreen({super.key});

  static const screenKey = Key('evaluation-rejected-screen');
  static const badgeKey = Key('evaluation-rejected-badge');
  static const headingKey = Key('evaluation-rejected-heading');
  static const subtitleKey = Key('evaluation-rejected-subtitle');
  static const statusCardKey = Key('evaluation-rejected-status-card');
  static const whatNextCardKey = Key('evaluation-rejected-what-next-card');
  static const startNewVisualKey = Key('evaluation-rejected-start-new-visual');
  static const returnHomeButtonKey = Key(
    'evaluation-rejected-return-home-button',
  );

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
                title: 'Evaluation Status',
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

                      // Status Badge: Rejected (y=116, w=80, h=30)
                      SizedBox(
                        key: badgeKey,
                        width: 80,
                        height: 30,
                        child: Container(
                          alignment: Alignment.center,
                          decoration: BoxDecoration(
                            color: AuratioColors.statusRejectedBackground,
                            borderRadius: BorderRadius.circular(999),
                          ),
                          child: Text(
                            'Rejected',
                            textAlign: TextAlign.center,
                            style: AuratioTypography.caption.copyWith(
                              color: AuratioColors.statusRejectedForeground,
                              fontSize: 11,
                              height: 16 / 11,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ),

                      const SizedBox(height: 18),

                      // Heading (y=164, w=350, h=32)
                      Text(
                        'Evaluation rejected',
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

                      // Subtitle (y=206, w=350, h=38)
                      Text(
                        'The completed evaluation was not accepted for publication.',
                        key: subtitleKey,
                        style: AuratioTypography.bodyMedium.copyWith(
                          color: AuratioColors.textSecondary,
                          fontSize: 13,
                          height: 19 / 13,
                          fontWeight: FontWeight.w400,
                        ),
                      ),

                      const SizedBox(height: 22),

                      // Publication Status Card (y=266, w=350, h=120)
                      SizedBox(
                        key: statusCardKey,
                        width: double.infinity,
                        height: 120,
                        child: Container(
                          padding: const EdgeInsets.fromLTRB(14, 14, 14, 12),
                          decoration: BoxDecoration(
                            color: AuratioColors.statusRejectedBackground,
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
                                'Rejected',
                                style: AuratioTypography.labelLarge.copyWith(
                                  color: AuratioColors.statusRejectedForeground,
                                  fontSize: 15,
                                  height: 22 / 15,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              Text(
                                'No progress, rating-window, qualification, or leaderboard effect is created.',
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

                      // What happens next Card (y=404, w=350, h=120)
                      SizedBox(
                        key: whatNextCardKey,
                        width: double.infinity,
                        height: 120,
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
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'What happens next',
                                style: AuratioTypography.labelLarge.copyWith(
                                  color: AuratioColors.textPrimary,
                                  fontSize: 14,
                                  height: 20 / 14,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              Text(
                                'You may resubmit where permitted. The temporary video can be deleted after this final publication decision.',
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

                      const SizedBox(height: 164),

                      // Primary Visual: Start a New Evaluation (y=688, w=350, h=48) - non-interactive
                      SizedBox(
                        key: startNewVisualKey,
                        height: 48,
                        width: double.infinity,
                        child: Container(
                          alignment: Alignment.center,
                          decoration: BoxDecoration(
                            color: AuratioColors.actionPrimaryBackground,
                            borderRadius: BorderRadius.circular(
                              AuratioRadii.md,
                            ),
                          ),
                          child: Text(
                            'Start a New Evaluation',
                            style: AuratioTypography.labelLarge.copyWith(
                              color: AuratioColors.actionPrimaryForeground,
                              fontSize: 14,
                              height: 20 / 14,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ),

                      const SizedBox(height: 14),

                      // Secondary CTA: Return to Home (y=750, w=350, h=48)
                      SizedBox(
                        height: 48,
                        width: double.infinity,
                        child: AuratioButton(
                          key: returnHomeButtonKey,
                          label: 'Return to Home',
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
}
