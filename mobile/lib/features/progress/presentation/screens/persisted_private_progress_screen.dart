import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router/app_route_paths.dart';
import '../../../../foundation/design_system/auratio_design_system.dart';
import '../../../../foundation/navigation/auratio_mobile_navigation.dart';
import '../../../shared/presentation/widgets/auratio_screen_header.dart';
import '../../application/progress_data_providers.dart';
import '../../domain/progress_models.dart';

class PersistedPrivateProgressScreen extends ConsumerWidget {
  const PersistedPrivateProgressScreen({super.key});

  static const screenKey = Key('persisted-private-progress-screen');
  static const overallMasteryKey = Key('persisted-progress-overall-mastery');
  static const historyButtonKey = Key('persisted-progress-history-button');

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final progress = ref.watch(userProgressProvider);

    return AnnotatedRegion<SystemUiOverlayStyle>(
      key: screenKey,
      value: const SystemUiOverlayStyle(
        statusBarColor: AuratioColors.backgroundBrand,
        statusBarIconBrightness: Brightness.light,
        statusBarBrightness: Brightness.dark,
        systemNavigationBarColor: AuratioColors.surfaceDefault,
        systemNavigationBarIconBrightness: Brightness.dark,
      ),
      child: Scaffold(
        backgroundColor: AuratioColors.backgroundApp,
        bottomNavigationBar: _bottomNavigation(context),
        body: SafeArea(
          top: false,
          bottom: false,
          child: Column(
            children: [
              const AuratioScreenHeader(title: 'Progress', showBack: false),
              Expanded(
                child: progress.when(
                  loading: () =>
                      const Center(child: CircularProgressIndicator()),
                  error: (_, _) => _errorState(
                    onRetry: () => ref.invalidate(userProgressProvider),
                  ),
                  data: (snapshot) => _content(context, snapshot),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _content(BuildContext context, UserProgressSnapshot snapshot) {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 36),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Private mastery',
            style: AuratioTypography.headingMedium.copyWith(
              color: AuratioColors.textPrimary,
              fontSize: 24,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'Only Approved AI and Human evaluations contribute here.',
            style: AuratioTypography.bodyMedium.copyWith(
              color: AuratioColors.textSecondary,
            ),
          ),
          const SizedBox(height: 20),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: AuratioColors.surfaceBrandSoft,
              border: Border.all(color: AuratioColors.borderDefault),
              borderRadius: BorderRadius.circular(AuratioRadii.lg),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'OVERALL MASTERY',
                  style: AuratioTypography.caption.copyWith(
                    color: AuratioColors.textTertiary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  snapshot.overallMastery == null
                      ? '—'
                      : '${snapshot.overallMastery!.toStringAsFixed(1)}%',
                  key: overallMasteryKey,
                  style: AuratioTypography.headingLarge.copyWith(
                    color: AuratioColors.backgroundBrand,
                    fontSize: 34,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 16),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    _metric(
                      'Approved',
                      snapshot.approvedEvaluations.toString(),
                    ),
                    _metric('AI', snapshot.approvedAi.toString()),
                    _metric('Human', snapshot.approvedHuman.toString()),
                    _metric('Tracks', snapshot.representedTracks.toString()),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          Row(
            children: [
              Expanded(
                child: Text(
                  'Track mastery',
                  style: AuratioTypography.headingSmall.copyWith(
                    color: AuratioColors.textPrimary,
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              Text(
                '${snapshot.tracks.length} represented',
                style: AuratioTypography.caption.copyWith(
                  color: AuratioColors.textTertiary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          if (snapshot.tracks.isEmpty)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: AuratioColors.surfaceDefault,
                border: Border.all(color: AuratioColors.borderDefault),
                borderRadius: BorderRadius.circular(AuratioRadii.lg),
              ),
              child: Text(
                'No Approved evaluations yet. Track Mastery appears after your first Approved result.',
                style: AuratioTypography.bodyMedium.copyWith(
                  color: AuratioColors.textSecondary,
                ),
              ),
            )
          else
            for (final track in snapshot.tracks)
              Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: _trackCard(track),
              ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: AuratioButton(
              key: historyButtonKey,
              label: 'Open Approved History',
              variant: AuratioButtonVariant.primary,
              expand: true,
              onPressed: () =>
                  context.push(AppRoutePaths.approvedEvaluationHistory),
            ),
          ),
        ],
      ),
    );
  }

  static Widget _metric(String label, String value) {
    return Container(
      width: 72,
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 9),
      decoration: BoxDecoration(
        color: AuratioColors.surfaceDefault,
        borderRadius: BorderRadius.circular(AuratioRadii.md),
      ),
      child: Column(
        children: [
          Text(
            value,
            style: AuratioTypography.titleMedium.copyWith(
              color: AuratioColors.backgroundBrand,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            textAlign: TextAlign.center,
            style: AuratioTypography.caption.copyWith(
              color: AuratioColors.textSecondary,
              fontSize: 10,
            ),
          ),
        ],
      ),
    );
  }

  static Widget _trackCard(TrackProgressSnapshot track) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: AuratioColors.surfaceDefault,
        border: Border.all(color: AuratioColors.borderDefault),
        borderRadius: BorderRadius.circular(AuratioRadii.lg),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  track.trackName,
                  style: AuratioTypography.labelLarge.copyWith(
                    color: AuratioColors.textPrimary,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              Text(
                '${track.trackMastery.toStringAsFixed(1)}%',
                style: AuratioTypography.titleMedium.copyWith(
                  color: AuratioColors.backgroundBrand,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          ClipRRect(
            borderRadius: BorderRadius.circular(AuratioRadii.pill),
            child: LinearProgressIndicator(
              value: (track.trackMastery / 100).clamp(0.0, 1.0).toDouble(),
              minHeight: 8,
              backgroundColor: AuratioColors.surfaceBrandSoft,
              valueColor: const AlwaysStoppedAnimation<Color>(
                AuratioColors.actionAccentBackground,
              ),
            ),
          ),
          const SizedBox(height: 10),
          Text(
            '${track.approvedCount} Approved · ${track.aiCount} AI · ${track.humanCount} Human · latest ${_formatDate(track.latestApprovedAt)}',
            style: AuratioTypography.caption.copyWith(
              color: AuratioColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  static Widget _errorState({required VoidCallback onRetry}) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Progress unavailable',
              style: AuratioTypography.headingMedium.copyWith(
                color: AuratioColors.textPrimary,
              ),
            ),
            const SizedBox(height: 10),
            Text(
              'Auratio could not read your persisted Approved progress.',
              textAlign: TextAlign.center,
              style: AuratioTypography.bodyMedium.copyWith(
                color: AuratioColors.textSecondary,
              ),
            ),
            const SizedBox(height: 20),
            AuratioButton(
              label: 'Try Again',
              variant: AuratioButtonVariant.secondary,
              onPressed: onRetry,
            ),
          ],
        ),
      ),
    );
  }

  static Widget _bottomNavigation(BuildContext context) {
    return AuratioMobileNavigationBar(
      destinations: canonicalMobileDestinations,
      currentIndex: 2,
      onDestinationSelected: (index) {
        switch (index) {
          case 0:
            context.go(AppRoutePaths.home);
            break;
          case 1:
            context.go(AppRoutePaths.tracks);
            break;
          case 2:
            context.go(AppRoutePaths.progress);
            break;
          case 3:
            context.go(AppRoutePaths.profile);
            break;
        }
      },
    );
  }

  static String _formatDate(DateTime value) {
    final local = value.toLocal();
    return '${local.day}/${local.month}/${local.year}';
  }
}
