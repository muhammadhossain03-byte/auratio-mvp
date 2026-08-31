import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router/app_route_paths.dart';
import '../../../../foundation/design_system/auratio_design_system.dart';
import '../../../shared/presentation/widgets/auratio_screen_header.dart';

class TrackDetailsScreen extends StatelessWidget {
  const TrackDetailsScreen({super.key});

  static const trackDetailsScreenKey = Key('mobile-track-details-screen');
  static const startEvaluationButtonKey = Key('track-details-start-evaluation');

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
      key: trackDetailsScreenKey,
      value: _overlayStyle,
      child: Scaffold(
        backgroundColor: AuratioColors.backgroundApp,
        body: SafeArea(
          top: false,
          child: Column(
            children: [
              AuratioScreenHeader(
                title: 'Track Details',
                showBack: true,
                onBack: () => context.go(AppRoutePaths.tracks),
              ),
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AuratioSpacing.xl,
                    vertical: AuratioSpacing.lg,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Path Badge
                      AuratioChipTab(
                        label: 'Professional Presenting',
                        selected: true,
                        onPressed: () {},
                      ),

                      const SizedBox(height: 16),

                      // Track Title & Description
                      Text(
                        'Business Pitch / Sales Pitch',
                        style: AuratioTypography.headingMedium.copyWith(
                          color: AuratioColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Deliver a speaker-visible pitch for structured communication evaluation.',
                        style: AuratioTypography.bodyMedium.copyWith(
                          color: AuratioColors.textSecondary,
                        ),
                      ),

                      const SizedBox(height: 22),

                      // Card 1: Duration
                      const AuratioCard(
                        tone: AuratioCardTone.defaultTone,
                        elevation: AuratioCardElevation.flat,
                        padding: EdgeInsets.all(AuratioSpacing.xl),
                        title: 'Duration',
                        body: 'Target 3:00–5:00  •  Accepted upload window 2:30–5:30',
                      ),

                      const SizedBox(height: 14),

                      // Card 2: Recording Requirement
                      const AuratioCard(
                        tone: AuratioCardTone.brandSoft,
                        elevation: AuratioCardElevation.flat,
                        padding: EdgeInsets.all(AuratioSpacing.xl),
                        title: 'Recording requirement',
                        body: 'Speaker-visible .mp4 • face/gaze, posture, gestures, framing and movement should remain observable.',
                      ),

                      const SizedBox(height: 24),

                      // Section: Evaluation Structure
                      Text(
                        'EVALUATION STRUCTURE',
                        style: AuratioTypography.caption.copyWith(
                          color: AuratioColors.textSecondary,
                          letterSpacing: 0.2,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 8),
                      _buildStructureRow('Universal Delivery', '40 pts'),
                      _buildStructureRow('Structural Flow', '20 pts'),
                      _buildStructureRow('Track Specialisation', '40 pts'),

                      const SizedBox(height: 12),

                      // Notice Banner
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.symmetric(
                          horizontal: 14,
                          vertical: 13,
                        ),
                        decoration: BoxDecoration(
                          color: AuratioColors.surfaceBrandSoft,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          'Server-measured duration determines eligibility before evaluation begins.',
                          style: AuratioTypography.caption.copyWith(
                            color: AuratioColors.textSecondary,
                          ),
                        ),
                      ),

                      const SizedBox(height: 16),

                      // Start Evaluation CTA
                      AuratioButton(
                        key: startEvaluationButtonKey,
                        label: 'Start Evaluation',
                        variant: AuratioButtonVariant.primary,
                        expand: true,
                        onPressed: () =>
                            context.go(AppRoutePaths.submissionRequirements),
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

  static Widget _buildStructureRow(String title, String points) {
    return SizedBox(
      height: 38,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            title,
            style: AuratioTypography.bodyMedium.copyWith(
              color: AuratioColors.textPrimary,
            ),
          ),
          Text(
            points,
            style: AuratioTypography.labelMedium.copyWith(
              color: AuratioColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}
