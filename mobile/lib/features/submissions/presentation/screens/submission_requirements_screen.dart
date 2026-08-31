import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router/app_route_paths.dart';
import '../../../../foundation/design_system/auratio_design_system.dart';
import '../../../shared/presentation/widgets/auratio_screen_header.dart';

class SubmissionRequirementsScreen extends StatelessWidget {
  const SubmissionRequirementsScreen({super.key});

  static const submissionRequirementsScreenKey = Key(
    'mobile-submission-requirements-screen',
  );
  static const chooseVideoButtonKey = Key('submission-choose-video-button');

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
      key: submissionRequirementsScreenKey,
      value: _overlayStyle,
      child: Scaffold(
        backgroundColor: AuratioColors.backgroundApp,
        body: SafeArea(
          top: false,
          child: Column(
            children: [
              AuratioScreenHeader(
                title: 'Submission Requirements',
                showBack: true,
                onBack: () => context.go(AppRoutePaths.trackDetails),
              ),
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AuratioSpacing.xl,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 28),

                      // Heading
                      Text(
                        'Before you upload',
                        style: AuratioTypography.headingMedium.copyWith(
                          color: AuratioColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'Use a recording that lets Auratio evaluate the speaker — not only audio or slides.',
                        style: AuratioTypography.bodySmall.copyWith(
                          color: AuratioColors.textSecondary,
                          fontSize: 13,
                          height: 19 / 13,
                        ),
                      ),

                      const SizedBox(height: 24),

                      // Card 1: File format
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: AuratioColors.surfaceDefault,
                          border: Border.all(
                            color: AuratioColors.borderDefault,
                          ),
                          borderRadius: BorderRadius.circular(AuratioRadii.lg),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'FILE FORMAT',
                              style: AuratioTypography.caption.copyWith(
                                color: AuratioColors.textSecondary,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '.mp4 only',
                              style: AuratioTypography.titleMedium.copyWith(
                                color: AuratioColors.textPrimary,
                                fontSize: 16,
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 18),

                      // Card 2: Keep the speaker visible
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: AuratioColors.surfaceBrandSoft,
                          border: Border.all(
                            color: AuratioColors.borderDefault,
                          ),
                          borderRadius: BorderRadius.circular(AuratioRadii.lg),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Keep the speaker visible',
                              style: AuratioTypography.titleMedium.copyWith(
                                color: AuratioColors.backgroundBrand,
                                fontSize: 15,
                              ),
                            ),
                            const SizedBox(height: 12),
                            _buildCheckRow(
                              'Face and gaze should be observable.',
                            ),
                            const SizedBox(height: 8),
                            _buildCheckRow(
                              'Posture and gestures should be visible.',
                            ),
                            const SizedBox(height: 8),
                            _buildCheckRow(
                              'Framing and movement should remain assessable.',
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 18),

                      // Card 3: Not supported in the MVP
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: AuratioColors.statusRejectedBackground,
                          border: Border.all(
                            color: AuratioColors.borderDefault,
                          ),
                          borderRadius: BorderRadius.circular(AuratioRadii.lg),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Not supported in the MVP',
                              style: AuratioTypography.titleMedium.copyWith(
                                color: AuratioColors.statusRejectedForeground,
                                fontSize: 13,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Voice-only or screen-only submissions.',
                              style: AuratioTypography.bodySmall.copyWith(
                                color: AuratioColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 26),

                      // Explanatory video lifecycle copy
                      Text(
                        'Video remains temporary through evaluation/moderation and is deleted after the final Approved or Rejected decision.',
                        style: AuratioTypography.bodySmall.copyWith(
                          color: AuratioColors.textSecondary,
                        ),
                      ),

                      const SizedBox(height: 26),

                      // Choose Video Button
                      AuratioButton(
                        key: chooseVideoButtonKey,
                        label: 'Choose Video',
                        variant: AuratioButtonVariant.primary,
                        expand: true,
                        onPressed: _chooseVideoAtLaterBatchBoundary,
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

  static Widget _buildCheckRow(String text) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          '✓',
          style: TextStyle(
            color: AuratioColors.actionAccentBackground,
            fontWeight: FontWeight.w700,
            fontSize: 13,
            height: 18 / 13,
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            text,
            style: AuratioTypography.bodySmall.copyWith(
              color: AuratioColors.textSecondary,
            ),
          ),
        ),
      ],
    );
  }

  static void _chooseVideoAtLaterBatchBoundary() {
    // 282:270 — P — Upload Recording belongs to a later batch.
  }
}
