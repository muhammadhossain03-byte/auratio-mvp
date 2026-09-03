import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router/app_route_paths.dart';
import '../../../../foundation/design_system/auratio_design_system.dart';
import '../../../shared/presentation/widgets/auratio_screen_header.dart';
import '../../../tracks/application/selected_track_provider.dart';
import '../../domain/evaluation_method.dart';

class EvaluationProcessingScreen extends ConsumerWidget {
  const EvaluationProcessingScreen({required this.method, super.key});

  final EvaluationMethod method;

  static const aiScreenKey = Key('evaluation-processing-ai-screen');
  static const humanScreenKey = Key('evaluation-processing-human-screen');
  static const badgeKey = Key('evaluation-processing-badge');
  static const headingKey = Key('evaluation-processing-heading');
  static const subtitleKey = Key('evaluation-processing-subtitle');
  static const evaluationCardKey = Key('evaluation-processing-evaluation-card');
  static const publicationStatusCardKey = Key(
    'evaluation-processing-publication-status-card',
  );
  static const videoNoteKey = Key('evaluation-processing-video-note');
  static const returnHomeButtonKey = Key(
    'evaluation-processing-return-home-button',
  );

  static const _overlayStyle = SystemUiOverlayStyle(
    statusBarColor: AuratioColors.backgroundBrand,
    statusBarIconBrightness: Brightness.light,
    statusBarBrightness: Brightness.dark,
    systemNavigationBarColor: AuratioColors.backgroundApp,
    systemNavigationBarIconBrightness: Brightness.dark,
  );

  bool get _isAi => method == EvaluationMethod.ai;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final track = ref.watch(selectedTrackProvider);

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
                title: 'Evaluation Status',
                showBack: true,
                onBack: () => context.go(
                  _isAi
                      ? AppRoutePaths.routingAssignedAi
                      : AppRoutePaths.routingAssignedHuman,
                ),
              ),
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 24),

                      // Processing Badge (y=116, w=94, h=30)
                      SizedBox(
                        key: badgeKey,
                        width: 94,
                        height: 30,
                        child: Container(
                          alignment: Alignment.center,
                          decoration: BoxDecoration(
                            color: AuratioColors.surfaceBrandSoft,
                            borderRadius: BorderRadius.circular(999),
                          ),
                          child: Text(
                            'Processing',
                            textAlign: TextAlign.center,
                            style: AuratioTypography.caption.copyWith(
                              color: AuratioColors.brandNavy900,
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
                        'Your evaluation is in progress',
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

                      // Subtitle (y=206, w=350, h=20)
                      Text(
                        'The evaluation is being generated or reviewed.',
                        key: subtitleKey,
                        style: AuratioTypography.bodyMedium.copyWith(
                          color: AuratioColors.textSecondary,
                          fontSize: 13,
                          height: 19 / 13,
                          fontWeight: FontWeight.w400,
                        ),
                      ),

                      const SizedBox(height: 39),

                      // Evaluation Card (y=264, w=350, h=104)
                      SizedBox(
                        key: evaluationCardKey,
                        width: double.infinity,
                        height: 104,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 14,
                            vertical: 14,
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
                                'EVALUATION',
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
                                track.name,
                                style: AuratioTypography.labelLarge.copyWith(
                                  color: AuratioColors.textPrimary,
                                  fontSize: 14,
                                  height: 20 / 14,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                _isAi
                                    ? 'Method: AI Evaluation'
                                    : 'Method: Human Evaluation',
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

                      const SizedBox(height: 18),

                      // Publication Status Card (y=386, w=350, h=126)
                      SizedBox(
                        key: publicationStatusCardKey,
                        width: double.infinity,
                        height: 126,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 14,
                            vertical: 14,
                          ),
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
                                'PUBLICATION STATUS',
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
                                'Processing',
                                style: AuratioTypography.titleMedium.copyWith(
                                  color: AuratioColors.brandNavy900,
                                  fontSize: 15,
                                  height: 22 / 15,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'No score, progress, rating-window, qualification, or leaderboard effect yet.',
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

                      const SizedBox(height: 26),

                      // Temporary Video Note (y=538, w=350, h=36)
                      Text(
                        'The temporary video remains available while evaluation or required moderation is in progress.',
                        key: videoNoteKey,
                        style: AuratioTypography.bodySmall.copyWith(
                          color: AuratioColors.textSecondary,
                          fontSize: 12,
                          height: 18 / 12,
                          fontWeight: FontWeight.w400,
                        ),
                      ),

                      const SizedBox(height: 176),

                      // Return to Home CTA (y=750, w=350, h=48)
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
