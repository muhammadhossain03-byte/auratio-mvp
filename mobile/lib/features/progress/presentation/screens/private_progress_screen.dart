import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router/app_route_paths.dart';
import '../../../../foundation/design_system/auratio_design_system.dart';
import '../../../../foundation/navigation/auratio_mobile_navigation.dart';
import '../../../shared/presentation/widgets/auratio_screen_header.dart';

class PrivateProgressScreen extends StatelessWidget {
  const PrivateProgressScreen({super.key});

  static const screenKey = Key('private-progress-screen');
  static const headingKey = Key('private-progress-heading');
  static const introKey = Key('private-progress-intro');
  static const overallMasteryCardKey = Key(
    'private-progress-overall-mastery-card',
  );
  static const trackMasteryCardKey = Key('private-progress-track-mastery-card');
  static const viewApprovedHistoryLinkKey = Key(
    'private-progress-view-approved-history-link',
  );
  static const recentSectionLabelKey = Key(
    'private-progress-recent-section-label',
  );
  static const aiRecentCardKey = Key('private-progress-ai-recent-card');
  static const humanRecentCardKey = Key('private-progress-human-recent-card');

  static const _overlayStyle = SystemUiOverlayStyle(
    statusBarColor: AuratioColors.backgroundBrand,
    statusBarIconBrightness: Brightness.light,
    statusBarBrightness: Brightness.dark,
    systemNavigationBarColor: AuratioColors.surfaceDefault,
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
              const AuratioScreenHeader(title: 'Progress', showBack: false),
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 26),

                      // Heading (y=118, w=350, h=32)
                      Text(
                        'Your Private Progress',
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

                      // Intro (y=160, w=350, h=38)
                      Text(
                        'Approved AI and Human evaluations appear in one private experience while their mode labels remain visible.',
                        key: introKey,
                        style: AuratioTypography.bodyMedium.copyWith(
                          color: AuratioColors.textSecondary,
                          fontSize: 12.8,
                          height: 19 / 12.8,
                          fontWeight: FontWeight.w400,
                          letterSpacing: -0.2,
                        ),
                      ),

                      const SizedBox(height: 24),

                      // Overall Auratio Mastery Card (y=222, w=350, h=122)
                      SizedBox(
                        key: overallMasteryCardKey,
                        width: double.infinity,
                        height: 122,
                        child: Container(
                          padding: const EdgeInsets.fromLTRB(14, 16, 14, 14),
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
                                'Overall Auratio Mastery',
                                style: AuratioTypography.labelLarge.copyWith(
                                  color: AuratioColors.backgroundBrand,
                                  fontSize: 14,
                                  height: 20 / 14,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              Text(
                                '84.2 / 100',
                                style: AuratioTypography.headingLarge.copyWith(
                                  color: AuratioColors.backgroundBrand,
                                  fontSize: 26,
                                  height: 32 / 26,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                              Text(
                                'Average of track mastery scores with at least one Approved evaluation.',
                                style: AuratioTypography.caption.copyWith(
                                  color: AuratioColors.textSecondary,
                                  fontSize: 11,
                                  height: 16 / 11,
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(height: 16),

                      // Track Mastery Card (y=360, w=350, h=128)
                      SizedBox(
                        key: trackMasteryCardKey,
                        width: double.infinity,
                        height: 128,
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
                                'Business Pitch / Sales Pitch',
                                style: AuratioTypography.bodyLarge.copyWith(
                                  color: AuratioColors.textPrimary,
                                  fontSize: 15,
                                  height: 22 / 15,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              Text(
                                'Track Mastery 86.4 / 100',
                                style: AuratioTypography.bodyMedium.copyWith(
                                  color: AuratioColors.backgroundBrand,
                                  fontSize: 13,
                                  height: 18 / 13,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              Text(
                                '5 Approved • 3 AI + 2 Human',
                                style: AuratioTypography.bodySmall.copyWith(
                                  color: AuratioColors.textSecondary,
                                  fontSize: 12,
                                  height: 18 / 12,
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                              GestureDetector(
                                key: viewApprovedHistoryLinkKey,
                                behavior: HitTestBehavior.opaque,
                                onTap: () => context.push(
                                  AppRoutePaths.approvedEvaluationHistory,
                                ),
                                child: Text(
                                  'View Approved History  →',
                                  style: AuratioTypography.bodySmall.copyWith(
                                    color: AuratioColors.backgroundBrand,
                                    fontSize: 12,
                                    height: 18 / 12,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(height: 26),

                      // Section Label: RECENT APPROVED EVALUATIONS (y=514, w=350, h=20)
                      SizedBox(
                        key: recentSectionLabelKey,
                        width: double.infinity,
                        height: 20,
                        child: Text(
                          'RECENT APPROVED EVALUATIONS',
                          style: AuratioTypography.caption.copyWith(
                            color: AuratioColors.neutral500,
                            fontSize: 11,
                            height: 16 / 11,
                            fontWeight: FontWeight.w500,
                            letterSpacing: 0.2,
                          ),
                        ),
                      ),

                      const SizedBox(height: 8),

                      // AI Recent Card (y=542, w=350, h=72)
                      SizedBox(
                        key: aiRecentCardKey,
                        width: double.infinity,
                        height: 72,
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
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    'AI Evaluation • Approved',
                                    style: AuratioTypography.bodySmall.copyWith(
                                      color: AuratioColors.textPrimary,
                                      fontSize: 12,
                                      height: 18 / 12,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  Text(
                                    '88 / 100',
                                    style: AuratioTypography.bodyMedium
                                        .copyWith(
                                          color: AuratioColors.backgroundBrand,
                                          fontSize: 13,
                                          height: 18 / 13,
                                          fontWeight: FontWeight.w700,
                                        ),
                                  ),
                                ],
                              ),
                              Text(
                                'Business Pitch / Sales Pitch',
                                style: AuratioTypography.caption.copyWith(
                                  color: AuratioColors.neutral500,
                                  fontSize: 11,
                                  height: 16 / 11,
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(height: 14),

                      // Human Recent Card (y=628, w=350, h=72)
                      SizedBox(
                        key: humanRecentCardKey,
                        width: double.infinity,
                        height: 72,
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
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    'Human Evaluation • Approved',
                                    style: AuratioTypography.bodySmall.copyWith(
                                      color: AuratioColors.textPrimary,
                                      fontSize: 12,
                                      height: 18 / 12,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  Text(
                                    '84 / 100',
                                    style: AuratioTypography.bodyMedium
                                        .copyWith(
                                          color: AuratioColors.backgroundBrand,
                                          fontSize: 13,
                                          height: 18 / 13,
                                          fontWeight: FontWeight.w700,
                                        ),
                                  ),
                                ],
                              ),
                              Text(
                                'Business Pitch / Sales Pitch',
                                style: AuratioTypography.caption.copyWith(
                                  color: AuratioColors.neutral500,
                                  fontSize: 11,
                                  height: 16 / 11,
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(height: 20),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
        bottomNavigationBar: AuratioMobileNavigationBar(
          destinations: canonicalMobileDestinations,
          currentIndex: 2,
          interactiveIndices: const {1},
          onDestinationSelected: (index) {
            if (index == 1) {
              context.go(AppRoutePaths.tracks);
            }
          },
        ),
      ),
    );
  }
}
