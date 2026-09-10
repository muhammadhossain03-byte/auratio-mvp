import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router/app_route_paths.dart';
import '../../../../foundation/design_system/auratio_design_system.dart';
import '../../../../foundation/navigation/auratio_navigation.dart';
import '../../../evaluations/application/latest_evaluation_request_provider.dart';
import '../../../evaluations/domain/evaluation_method.dart';
import '../../../evaluations/domain/persisted_evaluation.dart';
import '../../../onboarding/domain/auratio_path.dart';
import '../../../profile/application/profile_state_providers.dart';
import '../../../profile/data/profile_repository.dart';
import '../../../progress/application/progress_data_providers.dart';
import '../../../progress/domain/progress_models.dart';
import '../../../shared/presentation/widgets/auratio_brand_lockup.dart';
import '../../../tracks/domain/track_catalog.dart';

class PersistedHomeScreen extends ConsumerWidget {
  const PersistedHomeScreen({super.key});

  static const screenKey = Key('mobile-persisted-home-screen');
  static const homeScreenKey = Key('mobile-persisted-home-screen');
  static const viewActiveEvaluationKey = Key('home-view-active-evaluation');
  static const browseTracksKey = Key('home-browse-tracks');
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
    final profileAsync = ref.watch(persistedEndUserProfileProvider);
    final progressAsync = ref.watch(userProgressProvider);
    final latestAsync = ref.watch(latestEvaluationRequestProvider);

    final Widget body;

    if (profileAsync.isLoading ||
        progressAsync.isLoading ||
        latestAsync.isLoading) {
      body = const Center(child: CircularProgressIndicator());
    } else if (profileAsync.hasError ||
        progressAsync.hasError ||
        latestAsync.hasError) {
      body = _buildErrorState(ref);
    } else {
      final profile = profileAsync.value;
      final progress = progressAsync.value;
      if (profile == null || progress == null) {
        body = const Center(child: CircularProgressIndicator());
      } else {
        body = _buildContent(
          context,
          profile: profile,
          progress: progress,
          latest: latestAsync.value,
        );
      }
    }

    return AnnotatedRegion<SystemUiOverlayStyle>(
      key: screenKey,
      value: _overlayStyle,
      child: Scaffold(
        backgroundColor: AuratioColors.backgroundApp,
        body: body,
        bottomNavigationBar: _buildBottomNavigation(context),
      ),
    );
  }

  Widget _buildErrorState(WidgetRef ref) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AuratioSpacing.xl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Unable to load your Home data.',
              textAlign: TextAlign.center,
              style: AuratioTypography.headingMedium.copyWith(
                color: AuratioColors.textPrimary,
              ),
            ),
            const SizedBox(height: 20),
            AuratioButton(
              label: 'Try Again',
              variant: AuratioButtonVariant.secondary,
              onPressed: () {
                ref.invalidate(persistedEndUserProfileProvider);
                ref.invalidate(userProgressProvider);
                ref.invalidate(latestEvaluationRequestProvider);
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContent(
    BuildContext context, {
    required PersistedEndUserProfile profile,
    required UserProgressSnapshot progress,
    required PersistedEvaluationRequest? latest,
  }) {
    final isActive = latest != null && !latest.status.isTerminal;

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Hero Section
          _buildHeroSection(
            context,
            profile: profile,
            latest: latest,
            isActive: isActive,
          ),

          // Main Body Content
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AuratioSpacing.xl),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 20),

                // Section 1: Recent Evaluation
                Text(
                  'RECENT EVALUATION',
                  style: AuratioTypography.caption.copyWith(
                    color: AuratioColors.textSecondary,
                    letterSpacing: 0.2,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 10),
                _buildRecentEvaluationCard(latest),

                const SizedBox(height: 18),

                // Section 2: Private Progress
                Text(
                  'PRIVATE PROGRESS',
                  style: AuratioTypography.caption.copyWith(
                    color: AuratioColors.textSecondary,
                    letterSpacing: 0.2,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 10),
                _buildPrivateProgressCard(progress),

                const SizedBox(height: 2),

                // Quick Actions
                _buildQuickActions(context),

                const SizedBox(height: 64),

                // Section 3: Your Paths
                Text(
                  'YOUR PATHS',
                  style: AuratioTypography.caption.copyWith(
                    color: AuratioColors.textSecondary,
                    letterSpacing: 0.2,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 8),
                _buildYourPaths(context, profile.paths),
                const SizedBox(height: 58),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeroSection(
    BuildContext context, {
    required PersistedEndUserProfile profile,
    required PersistedEvaluationRequest? latest,
    required bool isActive,
  }) {
    final firstWord = _firstName(profile.displayName);
    final subtitle = isActive
        ? 'You have an active evaluation awaiting a final decision.'
        : "No active evaluation. Start a new one when you're ready.";
    final buttonLabel = isActive ? 'View Active Evaluation' : 'Browse Tracks';
    final buttonKey = isActive ? viewActiveEvaluationKey : browseTracksKey;

    return SizedBox(
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
                    label: 'User profile avatar for ${profile.displayName}',
                    child: Container(
                      width: 36,
                      height: 36,
                      decoration: const BoxDecoration(
                        color: AuratioColors.brandBlue200,
                        shape: BoxShape.circle,
                      ),
                      child: Center(
                        child: Text(
                          profile.initials,
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
                'Hello, $firstWord',
                style: AuratioTypography.headingMedium.copyWith(
                  color: AuratioColors.textOnBrand,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                subtitle,
                style: AuratioTypography.bodySmall.copyWith(
                  color: AuratioColors.brandBlue200,
                ),
              ),
              const SizedBox(height: 18),
              AuratioButton(
                key: buttonKey,
                label: buttonLabel,
                variant: AuratioButtonVariant.accent,
                size: AuratioButtonSize.medium,
                expand: true,
                onPressed: () {
                  if (isActive) {
                    if (latest!.method == EvaluationMethod.ai) {
                      context.go(AppRoutePaths.evaluationProcessingAi);
                    } else {
                      context.go(AppRoutePaths.evaluationProcessingHuman);
                    }
                  } else {
                    context.go(AppRoutePaths.tracks);
                  }
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  static String _firstName(String displayName) {
    final words = displayName
        .trim()
        .split(RegExp(r'\s+'))
        .where((word) => word.isNotEmpty)
        .toList();
    return words.isNotEmpty ? words.first : displayName;
  }

  Widget _buildRecentEvaluationCard(PersistedEvaluationRequest? latest) {
    return SizedBox(
      height: 120,
      width: double.infinity,
      child: AuratioCard(
        key: recentEvaluationCardKey,
        tone: AuratioCardTone.defaultTone,
        elevation: AuratioCardElevation.raised,
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 14),
        child: latest != null
            ? Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    AuratioTrackCatalog.findByBackendId(latest.trackId)?.name ??
                        latest.trackId,
                    style: AuratioTypography.titleMedium.copyWith(
                      color: AuratioColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    latest.method.displayName,
                    style: AuratioTypography.bodyMedium.copyWith(
                      color: AuratioColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 6),
                  _buildStatusBadge(latest.status),
                ],
              )
            : Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'No evaluations yet',
                    style: AuratioTypography.titleMedium.copyWith(
                      color: AuratioColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Your latest evaluation will appear here.',
                    style: AuratioTypography.bodyMedium.copyWith(
                      color: AuratioColors.textSecondary,
                    ),
                  ),
                ],
              ),
      ),
    );
  }

  static String _statusLabel(PersistedEvaluationStatus status) {
    return switch (status) {
      PersistedEvaluationStatus.unassigned => 'Unassigned',
      PersistedEvaluationStatus.assigned => 'Assigned',
      PersistedEvaluationStatus.accepted => 'Accepted',
      PersistedEvaluationStatus.inEvaluation => 'In Evaluation',
      PersistedEvaluationStatus.processing => 'Processing',
      PersistedEvaluationStatus.submitted => 'Submitted',
      PersistedEvaluationStatus.pendingModeration => 'Pending Moderation',
      PersistedEvaluationStatus.reopened => 'Reopened',
      PersistedEvaluationStatus.approved => 'Approved',
      PersistedEvaluationStatus.rejected => 'Rejected',
      PersistedEvaluationStatus.cancelled => 'Cancelled',
    };
  }

  static Widget _buildStatusBadge(PersistedEvaluationStatus status) {
    final label = _statusLabel(status);
    final (backgroundColor, foregroundColor) = switch (status) {
      PersistedEvaluationStatus.approved => (
        AuratioColors.statusApprovedBackground,
        AuratioColors.statusApprovedForeground,
      ),
      PersistedEvaluationStatus.rejected => (
        AuratioColors.statusRejectedBackground,
        AuratioColors.statusRejectedForeground,
      ),
      PersistedEvaluationStatus.pendingModeration => (
        AuratioColors.statusPendingBackground,
        AuratioColors.statusPendingForeground,
      ),
      PersistedEvaluationStatus.cancelled => (
        AuratioColors.surfaceBrandSoft,
        AuratioColors.textSecondary,
      ),
      _ => (
        AuratioColors.statusProcessingBackground,
        AuratioColors.statusProcessingForeground,
      ),
    };

    return Semantics(
      excludeSemantics: true,
      label: 'Status: $label',
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: backgroundColor,
          borderRadius: BorderRadius.circular(AuratioRadii.pill),
        ),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
          child: Text(
            label,
            style: AuratioTypography.labelMedium.copyWith(
              color: foregroundColor,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildPrivateProgressCard(UserProgressSnapshot progress) {
    final String progressSubtitle;
    if (progress.overallMastery != null) {
      final masteryString = progress.overallMastery!.toStringAsFixed(1);
      final count = progress.approvedEvaluations;
      final evaluationWord = count == 1
          ? 'Approved evaluation'
          : 'Approved evaluations';
      progressSubtitle = '$masteryString / 100 • $count $evaluationWord';
    } else {
      progressSubtitle = '— / 100 • No Approved evaluations yet.';
    }

    return SizedBox(
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
              progressSubtitle,
              style: AuratioTypography.bodyMedium.copyWith(
                color: AuratioColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickActions(BuildContext context) {
    return SizedBox(
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
                onPressed: () => context.go(AppRoutePaths.leaderboard),
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
                onPressed: () => context.go(AppRoutePaths.events),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildYourPaths(BuildContext context, Set<AuratioPath> paths) {
    final orderedPaths = AuratioPath.values
        .where((path) => paths.contains(path))
        .toList();

    if (orderedPaths.isEmpty) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'No Paths selected yet.',
            style: AuratioTypography.bodyMedium.copyWith(
              color: AuratioColors.textSecondary,
            ),
          ),
          const SizedBox(height: 12),
          AuratioButton(
            label: 'Choose Paths',
            variant: AuratioButtonVariant.secondary,
            size: AuratioButtonSize.small,
            onPressed: () => context.go(AppRoutePaths.choosePaths),
          ),
        ],
      );
    }

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          for (var i = 0; i < orderedPaths.length; i++) ...[
            if (i > 0) const SizedBox(width: 10),
            AuratioChipTab(
              label: orderedPaths[i].label,
              selected: false,
              presentationOnly: true,
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildBottomNavigation(BuildContext context) {
    return AuratioMobileNavigationBar(
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
    );
  }
}
