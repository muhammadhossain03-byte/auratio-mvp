import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router/app_route_paths.dart';
import '../../../../foundation/design_system/auratio_design_system.dart';
import '../../../evaluations/domain/evaluation_method.dart';
import '../../../shared/presentation/widgets/auratio_screen_header.dart';
import '../../../tracks/domain/track_catalog.dart';
import '../../application/leaderboard_data_provider.dart';
import '../../domain/leaderboard_models.dart';

class PersistedLeaderboardScreen extends ConsumerStatefulWidget {
  const PersistedLeaderboardScreen({required this.method, super.key});

  final EvaluationMethod method;

  static const screenKey = Key('persisted-leaderboard-screen');
  static const trackSelectorKey = Key('persisted-leaderboard-track-selector');

  @override
  ConsumerState<PersistedLeaderboardScreen> createState() =>
      _PersistedLeaderboardScreenState();
}

class _PersistedLeaderboardScreenState
    extends ConsumerState<PersistedLeaderboardScreen> {
  String _trackId = AuratioTrackCatalog.businessPitch.backendId;
  LeaderboardPeriod _period = LeaderboardPeriod.allTime;
  late DateTime _month;

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    _month = DateTime(now.year, now.month);
  }

  LeaderboardViewQuery get _query => (
    trackId: _trackId,
    method: widget.method,
    period: _period,
    month: _period == LeaderboardPeriod.monthly ? _month : null,
  );

  @override
  Widget build(BuildContext context) {
    final leaderboard = ref.watch(leaderboardSnapshotProvider(_query));
    final track = AuratioTrackCatalog.findByBackendId(_trackId)!;

    return AnnotatedRegion<SystemUiOverlayStyle>(
      key: PersistedLeaderboardScreen.screenKey,
      value: const SystemUiOverlayStyle(
        statusBarColor: AuratioColors.backgroundBrand,
        statusBarIconBrightness: Brightness.light,
        statusBarBrightness: Brightness.dark,
        systemNavigationBarColor: AuratioColors.backgroundApp,
        systemNavigationBarIconBrightness: Brightness.dark,
      ),
      child: Scaffold(
        backgroundColor: AuratioColors.backgroundApp,
        body: SafeArea(
          top: false,
          child: Column(
            children: [
              AuratioScreenHeader(
                title: 'Leaderboard',
                showBack: true,
                onBack: () => context.go(AppRoutePaths.home),
              ),
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.fromLTRB(20, 24, 20, 40),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${widget.method.displayName} · ${track.name}',
                        style: AuratioTypography.headingMedium.copyWith(
                          color: AuratioColors.textPrimary,
                          fontSize: 22,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'Public rankings are separated by Track, evaluation mode, and period. Qualification requires 3 Approved evaluations in the same scope.',
                        style: AuratioTypography.bodySmall.copyWith(
                          color: AuratioColors.textSecondary,
                          height: 1.45,
                        ),
                      ),
                      const SizedBox(height: 18),
                      DropdownButtonFormField<String>(
                        key: PersistedLeaderboardScreen.trackSelectorKey,
                        initialValue: _trackId,
                        isExpanded: true,
                        decoration: const InputDecoration(
                          labelText: 'Track',
                          border: OutlineInputBorder(),
                        ),
                        items: [
                          for (final item in AuratioTrackCatalog.allTracks)
                            DropdownMenuItem(
                              value: item.backendId,
                              child: Text(
                                item.name,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                        ],
                        onChanged: (value) {
                          if (value == null) return;
                          setState(() {
                            _trackId = value;
                          });
                        },
                      ),
                      const SizedBox(height: 14),
                      Wrap(
                        spacing: 8,
                        children: [
                          ChoiceChip(
                            label: const Text('All-Time'),
                            selected: _period == LeaderboardPeriod.allTime,
                            onSelected: (_) {
                              setState(() {
                                _period = LeaderboardPeriod.allTime;
                              });
                            },
                            showCheckmark: false,
                          ),
                          ChoiceChip(
                            label: Text(
                              'Monthly · ${_month.year}-${_month.month.toString().padLeft(2, '0')}',
                            ),
                            selected: _period == LeaderboardPeriod.monthly,
                            onSelected: (_) {
                              setState(() {
                                _period = LeaderboardPeriod.monthly;
                              });
                            },
                            showCheckmark: false,
                          ),
                        ],
                      ),
                      const SizedBox(height: 22),
                      leaderboard.when(
                        loading: () => const Padding(
                          padding: EdgeInsets.all(40),
                          child: Center(child: CircularProgressIndicator()),
                        ),
                        error: (_, _) => _errorState(),
                        data: _leaderboardContent,
                      ),
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

  Widget _leaderboardContent(LeaderboardSnapshot snapshot) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _currentUserCard(snapshot.currentUser),
        const SizedBox(height: 20),
        Text(
          'Qualified ranking',
          style: AuratioTypography.headingSmall.copyWith(
            color: AuratioColors.textPrimary,
            fontSize: 18,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: 10),
        if (snapshot.rows.isEmpty)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: AuratioColors.surfaceDefault,
              border: Border.all(color: AuratioColors.borderDefault),
              borderRadius: BorderRadius.circular(AuratioRadii.lg),
            ),
            child: Text(
              'No qualified participants are available in this leaderboard scope yet.',
              style: AuratioTypography.bodyMedium.copyWith(
                color: AuratioColors.textSecondary,
              ),
            ),
          )
        else
          for (final entry in snapshot.rows)
            Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: _entryCard(entry),
            ),
      ],
    );
  }

  Widget _currentUserCard(CurrentUserLeaderboardState state) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AuratioColors.surfaceBrandSoft,
        border: Border.all(color: AuratioColors.borderDefault),
        borderRadius: BorderRadius.circular(AuratioRadii.lg),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'YOUR STATUS',
            style: AuratioTypography.caption.copyWith(
              color: AuratioColors.textTertiary,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            state.qualified
                ? 'Qualified · Rank #${state.rank ?? '—'}'
                : 'Not qualified yet',
            style: AuratioTypography.titleMedium.copyWith(
              color: AuratioColors.backgroundBrand,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            state.qualified
                ? 'ALR ${state.alrDisplay?.toStringAsFixed(1) ?? '—'} · ${state.participationCount} Approved participations'
                : '${state.participationCount}/3 Approved evaluations in this exact scope',
            style: AuratioTypography.bodySmall.copyWith(
              color: AuratioColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _entryCard(LeaderboardEntry entry) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
      decoration: BoxDecoration(
        color: AuratioColors.surfaceDefault,
        border: Border.all(color: AuratioColors.borderDefault),
        borderRadius: BorderRadius.circular(AuratioRadii.lg),
      ),
      child: Row(
        children: [
          SizedBox(
            width: 38,
            child: Text(
              '#${entry.rank}',
              style: AuratioTypography.titleMedium.copyWith(
                color: AuratioColors.backgroundBrand,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  entry.displayName,
                  overflow: TextOverflow.ellipsis,
                  style: AuratioTypography.labelLarge.copyWith(
                    color: AuratioColors.textPrimary,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  '${entry.participationCount} Approved participations',
                  style: AuratioTypography.caption.copyWith(
                    color: AuratioColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 10),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                entry.alrDisplay.toStringAsFixed(1),
                style: AuratioTypography.titleMedium.copyWith(
                  color: AuratioColors.backgroundBrand,
                  fontWeight: FontWeight.w700,
                ),
              ),
              Text(
                'ALR',
                style: AuratioTypography.caption.copyWith(
                  color: AuratioColors.textTertiary,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _errorState() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AuratioColors.surfaceDefault,
        border: Border.all(color: AuratioColors.borderDefault),
        borderRadius: BorderRadius.circular(AuratioRadii.lg),
      ),
      child: Column(
        children: [
          Text(
            'Leaderboard unavailable',
            style: AuratioTypography.labelLarge.copyWith(
              color: AuratioColors.textPrimary,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            'Auratio could not load this persisted leaderboard scope.',
            textAlign: TextAlign.center,
            style: AuratioTypography.bodySmall.copyWith(
              color: AuratioColors.textSecondary,
            ),
          ),
          const SizedBox(height: 14),
          AuratioButton(
            label: 'Try Again',
            variant: AuratioButtonVariant.secondary,
            onPressed: () =>
                ref.invalidate(leaderboardSnapshotProvider(_query)),
          ),
        ],
      ),
    );
  }
}
