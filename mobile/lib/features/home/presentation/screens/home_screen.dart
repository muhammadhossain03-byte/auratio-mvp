import 'dart:math' as math;

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
    final topInset = MediaQuery.paddingOf(context).top;
    final heroTopPadding = math.max(12.0, topInset);

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
              ColoredBox(
                color: AuratioColors.backgroundBrand,
                child: Padding(
                  padding: EdgeInsets.fromLTRB(
                    AuratioSpacing.xl,
                    heroTopPadding + 14,
                    AuratioSpacing.xl,
                    AuratioSpacing.xl,
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
                      const SizedBox(height: 4),
                      Text(
                        'You have an active evaluation awaiting a final decision.',
                        style: AuratioTypography.bodySmall.copyWith(
                          color: AuratioColors.brandBlue200,
                        ),
                      ),
                      const SizedBox(height: 16),
                      AuratioButton(
                        key: viewActiveEvaluationKey,
                        label: 'View Active Evaluation',
                        variant: AuratioButtonVariant.accent,
                        size: AuratioButtonSize.medium,
                        expand: true,
                        onPressed: null,
                      ),
                    ],
                  ),
                ),
              ),

              // Main Body Content
              Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: AuratioSpacing.xl,
                  vertical: AuratioSpacing.xl,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Section 1: Recent Evaluation
                    Text(
                      'RECENT EVALUATION',
                      style: AuratioTypography.caption.copyWith(
                        color: AuratioColors.textSecondary,
                        letterSpacing: 0.2,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: AuratioSpacing.sm),
                    AuratioCard(
                      key: recentEvaluationCardKey,
                      tone: AuratioCardTone.defaultTone,
                      elevation: AuratioCardElevation.raised,
                      padding: const EdgeInsets.all(AuratioSpacing.xl),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Business Pitch / Sales Pitch',
                            style: AuratioTypography.titleMedium.copyWith(
                              color: AuratioColors.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Human Evaluation',
                            style: AuratioTypography.bodyMedium.copyWith(
                              color: AuratioColors.textSecondary,
                            ),
                          ),
                          const SizedBox(height: 12),
                          const AuratioStatusBadge(
                            status: AuratioStatus.pending,
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 20),

                    // Section 2: Private Progress
                    Text(
                      'PRIVATE PROGRESS',
                      style: AuratioTypography.caption.copyWith(
                        color: AuratioColors.textSecondary,
                        letterSpacing: 0.2,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: AuratioSpacing.sm),
                    AuratioCard(
                      key: privateProgressCardKey,
                      tone: AuratioCardTone.brandSoft,
                      elevation: AuratioCardElevation.flat,
                      padding: const EdgeInsets.all(AuratioSpacing.xl),
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
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          child: AuratioButton(
                            key: leaderboardsButtonKey,
                            label: 'Leaderboards',
                            variant: AuratioButtonVariant.secondary,
                            size: AuratioButtonSize.small,
                            onPressed: null,
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: AuratioButton(
                            key: eventsButtonKey,
                            label: 'Events',
                            variant: AuratioButtonVariant.secondary,
                            size: AuratioButtonSize.small,
                            onPressed: null,
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 20),

                    // Section 3: Your Paths
                    Text(
                      'YOUR PATHS',
                      style: AuratioTypography.caption.copyWith(
                        color: AuratioColors.textSecondary,
                        letterSpacing: 0.2,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: AuratioSpacing.sm),
                    _buildYourPathsChips(selectedPaths),
                  ],
                ),
              ),
            ],
          ),
        ),
        bottomNavigationBar: AuratioMobileNavigationBar(
          destinations: canonicalMobileDestinations,
          currentIndex: 0,
          onDestinationSelected: (index) {
            if (index == 1) {
              context.go(AppRoutePaths.tracks);
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

    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        for (var i = 0; i < pathList.length; i++)
          AuratioChipTab(
            label: pathList[i].label,
            selected: i == 0,
            onPressed: null,
          ),
      ],
    );
  }
}
