import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router/app_route_paths.dart';
import '../../../../foundation/design_system/auratio_design_system.dart';
import '../../../shared/presentation/widgets/auratio_screen_header.dart';
import '../../../tracks/application/selected_track_provider.dart';

class RecordingAcceptedScreen extends ConsumerWidget {
  const RecordingAcceptedScreen({super.key});

  static const recordingAcceptedScreenKey = Key(
    'mobile-recording-accepted-screen',
  );
  static const eligibleBadgeKey = Key('recording-accepted-eligible-badge');
  static const measuredDurationCardKey = Key(
    'recording-accepted-measured-duration-card',
  );
  static const eligibilityPassedCardKey = Key(
    'recording-accepted-eligibility-passed-card',
  );
  static const continueButtonKey = Key('recording-accepted-continue-button');

  static const _overlayStyle = SystemUiOverlayStyle(
    statusBarColor: AuratioColors.backgroundBrand,
    statusBarIconBrightness: Brightness.light,
    statusBarBrightness: Brightness.dark,
    systemNavigationBarColor: AuratioColors.backgroundApp,
    systemNavigationBarIconBrightness: Brightness.dark,
  );

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final track = ref.watch(selectedTrackProvider);
    return AnnotatedRegion<SystemUiOverlayStyle>(
      key: recordingAcceptedScreenKey,
      value: _overlayStyle,
      child: Scaffold(
        backgroundColor: AuratioColors.backgroundApp,
        body: SafeArea(
          top: false,
          child: Column(
            children: [
              AuratioScreenHeader(
                title: 'Recording Accepted',
                showBack: true,
                onBack: () => context.go(AppRoutePaths.uploadRecording),
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

                      // Status Badge: Eligible (y=116, w=80, h=30)
                      Container(
                        key: eligibleBadgeKey,
                        width: 80,
                        height: 30,
                        decoration: BoxDecoration(
                          color: AuratioColors.statusApprovedBackground,
                          borderRadius: BorderRadius.circular(
                            AuratioRadii.pill,
                          ),
                        ),
                        child: Center(
                          child: Text(
                            'Eligible',
                            style: AuratioTypography.labelMedium.copyWith(
                              color: AuratioColors.statusApprovedForeground,
                              fontSize: 11,
                              height: 16 / 11,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ),

                      const SizedBox(height: 18),

                      // Heading: Recording is eligible (y=164)
                      Text(
                        'Recording is eligible',
                        style: AuratioTypography.headingMedium.copyWith(
                          color: AuratioColors.textPrimary,
                          fontSize: 24,
                          height: 32 / 24,
                          fontWeight: FontWeight.w700,
                        ),
                      ),

                      const SizedBox(height: 10),

                      // Subheading (y=206, h=38)
                      Text(
                        'The server-measured duration falls within the accepted window for this track.',
                        style: AuratioTypography.bodySmall.copyWith(
                          color: AuratioColors.textSecondary,
                          fontSize: 13,
                          height: 19 / 13,
                        ),
                      ),

                      const SizedBox(height: 30),

                      // Measured Duration card (y=274, w=350, h=126)
                      SizedBox(
                        key: measuredDurationCardKey,
                        width: double.infinity,
                        height: 126,
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
                            borderRadius: BorderRadius.circular(
                              AuratioRadii.lg,
                            ),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'MEASURED DURATION',
                                style: AuratioTypography.caption.copyWith(
                                  color: AuratioColors.textTertiary,
                                  fontSize: 11,
                                  height: 16 / 11,
                                  fontWeight: FontWeight.w500,
                                  letterSpacing: 0.2,
                                ),
                              ),
                              Text(
                                track.sampleValidDuration,
                                style: AuratioTypography.headingLarge.copyWith(
                                  color: AuratioColors.backgroundBrand,
                                  fontSize: 30,
                                  height: 38 / 30,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                              Text(
                                'Accepted window ${track.acceptedDuration}',
                                style: AuratioTypography.bodySmall.copyWith(
                                  color: AuratioColors.textSecondary,
                                  fontSize: 12,
                                  height: 18 / 12,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(height: 18),

                      // Eligibility passed card (y=418, w=350, h=104)
                      SizedBox(
                        key: eligibilityPassedCardKey,
                        width: double.infinity,
                        height: 104,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 14,
                            vertical: 16,
                          ),
                          decoration: BoxDecoration(
                            color: AuratioColors.surfaceBrandSoft,
                            border: Border.all(
                              color: AuratioColors.borderDefault,
                            ),
                            borderRadius: BorderRadius.circular(
                              AuratioRadii.lg,
                            ),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Eligibility passed',
                                style: AuratioTypography.labelLarge.copyWith(
                                  color: AuratioColors.backgroundBrand,
                                  fontSize: 14,
                                  height: 20 / 14,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              Text(
                                'You can now choose how this performance will be evaluated.',
                                style: AuratioTypography.bodySmall.copyWith(
                                  color: AuratioColors.textSecondary,
                                  fontSize: 12,
                                  height: 18 / 12,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(height: 30),

                      // Hint: Next: AI Evaluation or Human Evaluation (y=552)
                      Text(
                        'Next: AI Evaluation or Human Evaluation',
                        style: AuratioTypography.bodySmall.copyWith(
                          color: AuratioColors.textTertiary,
                          fontSize: 12,
                          height: 18 / 12,
                          fontWeight: FontWeight.w500,
                        ),
                      ),

                      const SizedBox(height: 180),

                      // Continue CTA (y=750, h=48)
                      SizedBox(
                        height: 48,
                        width: double.infinity,
                        child: AuratioButton(
                          key: continueButtonKey,
                          label: 'Continue',
                          variant: AuratioButtonVariant.primary,
                          expand: true,
                          onPressed: () =>
                              context.go(AppRoutePaths.chooseEvaluationMethod),
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
