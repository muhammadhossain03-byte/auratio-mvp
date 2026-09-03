import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router/app_route_paths.dart';
import '../../../../foundation/design_system/auratio_design_system.dart';
import '../../../shared/presentation/widgets/auratio_screen_header.dart';
import '../../application/selected_track_provider.dart';
import '../../domain/track_catalog.dart';

class TrackDetailsScreen extends ConsumerWidget {
  const TrackDetailsScreen({this.slug, super.key});

  final String? slug;

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
  Widget build(BuildContext context, WidgetRef ref) {
    final TrackItem track;
    if (slug != null) {
      final trackFromSlug = AuratioTrackCatalog.findBySlug(slug!);
      if (trackFromSlug == null) {
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
                  const Expanded(child: Center(child: Text('Track not found'))),
                ],
              ),
            ),
          ),
        );
      }
      track = trackFromSlug;
    } else {
      track = ref.watch(selectedTrackProvider);
    }

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
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 20),

                      // Path Badge (y=112, h=34)
                      AuratioChipTab(
                        label: track.category.path.label,
                        selected: true,
                        presentationOnly: true,
                      ),

                      const SizedBox(height: 16),

                      // Track Title & Description
                      Text(
                        track.name,
                        style: AuratioTypography.headingMedium.copyWith(
                          color: AuratioColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        track.description,
                        style: AuratioTypography.bodyMedium.copyWith(
                          color: AuratioColors.textSecondary,
                        ),
                      ),

                      const SizedBox(height: 22),

                      // Card 1: Duration (y=264, h=104)
                      SizedBox(
                        height: 104,
                        width: double.infinity,
                        child: AuratioCard(
                          tone: AuratioCardTone.defaultTone,
                          elevation: AuratioCardElevation.flat,
                          padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Duration',
                                style: TextStyle(
                                  fontSize: 17,
                                  fontWeight: FontWeight.w600,
                                  color: AuratioColors.textPrimary,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Target ${track.targetDuration}  •  Accepted upload\nwindow ${track.acceptedDuration}',
                                style: const TextStyle(
                                  fontSize: 13,
                                  color: AuratioColors.textSecondary,
                                  height: 18 / 13,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(height: 14),

                      // Card 2: Recording Requirement (y=382, h=126)
                      const SizedBox(
                        height: 126,
                        width: double.infinity,
                        child: AuratioCard(
                          tone: AuratioCardTone.brandSoft,
                          elevation: AuratioCardElevation.flat,
                          padding: EdgeInsets.fromLTRB(20, 16, 20, 16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Recording requirement',
                                style: TextStyle(
                                  fontSize: 17,
                                  fontWeight: FontWeight.w600,
                                  color: AuratioColors.textPrimary,
                                ),
                              ),
                              SizedBox(height: 4),
                              Text(
                                'Speaker-visible .mp4 • face/gaze, posture,\ngestures, framing and movement should\nremain observable.',
                                style: TextStyle(
                                  fontSize: 13,
                                  color: AuratioColors.textSecondary,
                                  height: 18 / 13,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(height: 24),

                      // Section: Evaluation Structure (y=532)
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
                      const SizedBox(height: 6),
                      _buildStructureRow('Structural Flow', '20 pts'),
                      const SizedBox(height: 6),
                      _buildStructureRow('Track Specialisation', '40 pts'),

                      const SizedBox(height: 6),

                      // Notice Banner (y=688, h=58)
                      SizedBox(
                        height: 58,
                        width: double.infinity,
                        child: Container(
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
                      ),

                      const SizedBox(height: 8),

                      // Start Evaluation CTA (y=754, h=48)
                      SizedBox(
                        height: 48,
                        width: double.infinity,
                        child: AuratioButton(
                          key: startEvaluationButtonKey,
                          label: 'Start Evaluation',
                          variant: AuratioButtonVariant.primary,
                          expand: true,
                          onPressed: () {
                            ref
                                .read(selectedTrackProvider.notifier)
                                .select(track);
                            context.go(AppRoutePaths.submissionRequirements);
                          },
                        ),
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
