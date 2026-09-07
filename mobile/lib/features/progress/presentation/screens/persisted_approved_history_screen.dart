import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router/app_route_paths.dart';
import '../../../../foundation/design_system/auratio_design_system.dart';
import '../../../evaluations/domain/evaluation_method.dart';
import '../../../shared/presentation/widgets/auratio_screen_header.dart';
import '../../application/progress_data_providers.dart';
import '../../domain/progress_models.dart';

enum PersistedApprovedHistoryFilter { all, ai, human }

class PersistedApprovedHistoryScreen extends ConsumerStatefulWidget {
  const PersistedApprovedHistoryScreen({super.key});

  static const screenKey = Key('persisted-approved-history-screen');

  @override
  ConsumerState<PersistedApprovedHistoryScreen> createState() =>
      _PersistedApprovedHistoryScreenState();
}

class _PersistedApprovedHistoryScreenState
    extends ConsumerState<PersistedApprovedHistoryScreen> {
  PersistedApprovedHistoryFilter _filter = PersistedApprovedHistoryFilter.all;

  @override
  Widget build(BuildContext context) {
    final history = ref.watch(approvedHistoryProvider);

    return AnnotatedRegion<SystemUiOverlayStyle>(
      key: PersistedApprovedHistoryScreen.screenKey,
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
                title: 'Approved History',
                showBack: true,
                onBack: () => context.go(AppRoutePaths.progress),
              ),
              Expanded(
                child: history.when(
                  loading: () =>
                      const Center(child: CircularProgressIndicator()),
                  error: (_, _) => _errorState(),
                  data: _content,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _content(ApprovedHistoryPage page) {
    final filtered = page.items
        .where((item) {
          switch (_filter) {
            case PersistedApprovedHistoryFilter.all:
              return true;
            case PersistedApprovedHistoryFilter.ai:
              return item.method == EvaluationMethod.ai;
            case PersistedApprovedHistoryFilter.human:
              return item.method == EvaluationMethod.human;
          }
        })
        .toList(growable: false);

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 40),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Approved results remain in your private history and are not removed when a public rating window changes.',
            style: AuratioTypography.bodySmall.copyWith(
              color: AuratioColors.textSecondary,
              height: 1.45,
            ),
          ),
          const SizedBox(height: 16),
          Wrap(
            spacing: 8,
            children: [
              _filterChip(
                label: 'All',
                filter: PersistedApprovedHistoryFilter.all,
              ),
              _filterChip(
                label: 'AI',
                filter: PersistedApprovedHistoryFilter.ai,
              ),
              _filterChip(
                label: 'Human',
                filter: PersistedApprovedHistoryFilter.human,
              ),
            ],
          ),
          const SizedBox(height: 22),
          Text(
            '${page.total} Approved evaluation${page.total == 1 ? '' : 's'}',
            style: AuratioTypography.labelLarge.copyWith(
              color: AuratioColors.textPrimary,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 12),
          if (filtered.isEmpty)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: AuratioColors.surfaceDefault,
                border: Border.all(color: AuratioColors.borderDefault),
                borderRadius: BorderRadius.circular(AuratioRadii.lg),
              ),
              child: Text(
                'No Approved evaluations match this filter.',
                style: AuratioTypography.bodyMedium.copyWith(
                  color: AuratioColors.textSecondary,
                ),
              ),
            )
          else
            for (final item in filtered)
              Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: _historyCard(item),
              ),
        ],
      ),
    );
  }

  Widget _filterChip({
    required String label,
    required PersistedApprovedHistoryFilter filter,
  }) {
    final selected = _filter == filter;
    return ChoiceChip(
      label: Text(label),
      selected: selected,
      onSelected: (_) {
        setState(() {
          _filter = filter;
        });
      },
      selectedColor: AuratioColors.backgroundBrand,
      backgroundColor: AuratioColors.surfaceDefault,
      side: const BorderSide(color: AuratioColors.borderStrong),
      labelStyle: AuratioTypography.caption.copyWith(
        color: selected
            ? AuratioColors.textOnBrand
            : AuratioColors.backgroundBrand,
        fontWeight: FontWeight.w600,
      ),
      showCheckmark: false,
    );
  }

  Widget _historyCard(ApprovedHistoryItem item) {
    final resultPath = item.method == EvaluationMethod.ai
        ? AppRoutePaths.evaluationResultAi
        : AppRoutePaths.evaluationResultHuman;
    final query = {'submission': item.submissionId};

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
          Text(
            item.trackName,
            style: AuratioTypography.labelLarge.copyWith(
              color: AuratioColors.textPrimary,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 5,
                ),
                decoration: BoxDecoration(
                  color: AuratioColors.statusApprovedBackground,
                  borderRadius: BorderRadius.circular(AuratioRadii.pill),
                ),
                child: Text(
                  'Approved',
                  style: AuratioTypography.caption.copyWith(
                    color: AuratioColors.statusApprovedForeground,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Text(
                item.method.displayName,
                style: AuratioTypography.caption.copyWith(
                  color: AuratioColors.textSecondary,
                ),
              ),
              const Spacer(),
              Text(
                '${item.finalScore}/100',
                style: AuratioTypography.titleMedium.copyWith(
                  color: AuratioColors.backgroundBrand,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            'Submitted ${_formatDate(item.submissionDate)} · Approved ${_formatDate(item.approvedAt)}',
            style: AuratioTypography.caption.copyWith(
              color: AuratioColors.textSecondary,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: TextButton(
                  onPressed: () => context.push(
                    Uri(path: resultPath, queryParameters: query).toString(),
                  ),
                  child: const Text('View Result'),
                ),
              ),
              Expanded(
                child: TextButton(
                  onPressed: () => context.push(
                    Uri(
                      path: AppRoutePaths.evaluationReport,
                      queryParameters: query,
                    ).toString(),
                  ),
                  child: Text(
                    item.reportAvailable ? 'Open .docx' : 'Prepare .docx',
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _errorState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Approved history unavailable',
              style: AuratioTypography.headingMedium.copyWith(
                color: AuratioColors.textPrimary,
              ),
            ),
            const SizedBox(height: 10),
            Text(
              'Auratio could not read your persisted Approved history.',
              textAlign: TextAlign.center,
              style: AuratioTypography.bodyMedium.copyWith(
                color: AuratioColors.textSecondary,
              ),
            ),
            const SizedBox(height: 20),
            AuratioButton(
              label: 'Try Again',
              variant: AuratioButtonVariant.secondary,
              onPressed: () => ref.invalidate(approvedHistoryProvider),
            ),
          ],
        ),
      ),
    );
  }

  static String _formatDate(DateTime value) {
    final local = value.toLocal();
    return '${local.day}/${local.month}/${local.year}';
  }
}
