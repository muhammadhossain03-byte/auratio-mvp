import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router/app_route_paths.dart';
import '../../../../foundation/design_system/auratio_design_system.dart';
import '../../../../foundation/navigation/auratio_navigation.dart';
import '../../../onboarding/application/path_selection_controller.dart';
import '../../../onboarding/domain/auratio_path.dart';
import '../../../shared/presentation/widgets/auratio_brand_lockup.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  static const homeScreenKey = Key('mobile-home-screen');
  static const viewActiveEvaluationKey = Key('home-view-active-evaluation');
  static const recentEvaluationCardKey = Key('home-recent-evaluation-card');
  static const privateProgressCardKey = Key('home-private-progress-card');
  static const leaderboardsButtonKey = Key('home-leaderboards-button');
  static const eventsButtonKey = Key('home-events-button');

  /// Presentation-only callback for controls that remain non-interactive
  /// per authoritative live Figma prototype specifications (node #282:142 has no reaction).
  /// Keeps the control visually enabled with canonical resting styling.
  static void _presentationOnly() {}

  static const _overlayStyle = SystemUiOverlayStyle(
    statusBarColor: AuratioColors.backgroundBrand,
    statusBarIconBrightness: Brightness.light,
    statusBarBrightness: Brightness.dark,
    systemNavigationBarColor: AuratioColors.surfaceDefault,
    systemNavigationBarIconBrightness: Brightness.dark,
  );

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final selectedPaths = ref.watch(selectedPathsProvider);

    return AnnotatedRegion<SystemUiOverlayStyle>(
      key: homeScreenKey,
      value: _overlayStyle,
      child: Scaffold(
        backgroundColor: AuratioColors.backgroundApp,
        body: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Hero Section
              SizedBox(
                height: 224,
                child: ColoredBox(
                  color: AuratioColors.backgroundBrand,
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(
                      AuratioSpacing.xl,
                      38,
                      AuratioSpacing.xl,
                      12,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            const AuratioBrandLockup(width: 108),
                            Semantics(
                              label: 'User profile avatar for Alex',
                              child: Container(
                                width: 36,
                                height: 36,
                                decoration: const BoxDecoration(
                                  color: AuratioColors.brandBlue200,
                                  shape: BoxShape.circle,
                                ),
                                child: Center(
                                  child: Text(
                                    'AM',
                                    style: AuratioTypography.caption.copyWith(
                                      color: AuratioColors.backgroundBrand,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 18),
                        Text(
                          'Hello, Alex',
                          style: AuratioTypography.headingMedium.copyWith(
                            color: AuratioColors.textOnBrand,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'You have an active evaluation awaiting a final decision.',
                          style: AuratioTypography.bodySmall.copyWith(
                            color: AuratioColors.brandBlue200,
                          ),
                        ),
                        const SizedBox(height: 18),
                        AuratioButton(
                          key: viewActiveEvaluationKey,
                          label: 'View Active Evaluation',
                          variant: AuratioButtonVariant.accent,
                          size: AuratioButtonSize.medium,
                          expand: true,
                          onPressed: _presentationOnly,
                        ),
                      ],
                    ),
                  ),
                ),
              ),

              // Main Body Content
              Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: AuratioSpacing.xl,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 20),

                    // Section 1: Recent Evaluation (y=244)
                    Text(
                      'RECENT EVALUATION',
                      style: AuratioTypography.caption.copyWith(
                        color: AuratioColors.textSecondary,
                        letterSpacing: 0.2,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 10),
                    SizedBox(
                      height: 120,
                      width: double.infinity,
                      child: AuratioCard(
                        key: recentEvaluationCardKey,
                        tone: AuratioCardTone.defaultTone,
                        elevation: AuratioCardElevation.raised,
                        padding: const EdgeInsets.fromLTRB(20, 16, 20, 14),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Business Pitch / Sales Pitch',
                              style: AuratioTypography.titleMedium.copyWith(
                                color: AuratioColors.textPrimary,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'Human Evaluation',
                              style: AuratioTypography.bodyMedium.copyWith(
                                color: AuratioColors.textSecondary,
                              ),
                            ),
                            const SizedBox(height: 6),
                            const AuratioStatusBadge(
                              status: AuratioStatus.pending,
                            ),
                          ],
                        ),
                      ),
                    ),

                    const SizedBox(height: 18),

                    // Section 2: Private Progress (y=408)
                    Text(
                      'PRIVATE PROGRESS',
                      style: AuratioTypography.caption.copyWith(
                        color: AuratioColors.textSecondary,
                        letterSpacing: 0.2,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 10),
                    SizedBox(
                      height: 114,
                      width: double.infinity,
                      child: AuratioCard(
                        key: privateProgressCardKey,
                        tone: AuratioCardTone.brandSoft,
                        elevation: AuratioCardElevation.flat,
                        padding: const EdgeInsets.fromLTRB(20, 16, 20, 14),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Overall Auratio Mastery',
                              style: AuratioTypography.titleMedium.copyWith(
                                color: AuratioColors.textPrimary,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '84.2 / 100 • Approved track masteries averaged equally.',
                              style: AuratioTypography.bodyMedium.copyWith(
                                color: AuratioColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                    const SizedBox(height: 2),

                    // Quick Actions (y=550)
                    SizedBox(
                      height: 40,
                      child: Row(
                        children: [
                          Expanded(
                            child: SizedBox(
                              height: 40,
                              child: AuratioButton(
                                key: leaderboardsButtonKey,
                                label: 'Leaderboards',
                                variant: AuratioButtonVariant.secondary,
                                size: AuratioButtonSize.small,
                                onPressed: () =>
                                    context.go(AppRoutePaths.leaderboard),
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: SizedBox(
                              height: 40,
                              child: AuratioButton(
                                key: eventsButtonKey,
                                label: 'Events',
                                variant: AuratioButtonVariant.secondary,
                                size: AuratioButtonSize.small,
                                onPressed: () =>
                                    context.go(AppRoutePaths.events),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 64),

                    // Section 3: Your Paths (y=654)
                    Text(
                      'YOUR PATHS',
                      style: AuratioTypography.caption.copyWith(
                        color: AuratioColors.textSecondary,
                        letterSpacing: 0.2,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 8),
                    _buildYourPathsChips(selectedPaths),
                    const SizedBox(height: 58),
                  ],
                ),
              ),
            ],
          ),
        ),
        bottomNavigationBar: AuratioMobileNavigationBar(
          destinations: canonicalMobileDestinations,
          currentIndex: 0,
          interactiveIndices: const {1, 2, 3},
          onDestinationSelected: (index) {
            if (index == 1) {
              context.go(AppRoutePaths.tracks);
            } else if (index == 2) {
              context.go(AppRoutePaths.progress);
            } else if (index == 3) {
              context.go(AppRoutePaths.profile);
            }
          },
        ),
      ),
    );
  }

  Widget _buildYourPathsChips(Set<AuratioPath> selectedPaths) {
    if (selectedPaths.isEmpty) {
      return const SizedBox.shrink();
    }

    final pathList = [
      if (selectedPaths.contains(AuratioPath.professionalPresenting))
        AuratioPath.professionalPresenting,
      if (selectedPaths.contains(AuratioPath.publicSpeaking))
        AuratioPath.publicSpeaking,
      if (selectedPaths.contains(AuratioPath.contentCreation))
        AuratioPath.contentCreation,
    ];

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          for (var i = 0; i < pathList.length; i++) ...[
            if (i > 0) const SizedBox(width: 10),
            AuratioChipTab(
              label: pathList[i].label,
              selected: i == 0,
              presentationOnly: true,
            ),
          ],
        ],
      ),
    );
  }
}
