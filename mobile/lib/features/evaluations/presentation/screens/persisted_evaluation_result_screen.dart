import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router/app_route_paths.dart';
import '../../../../foundation/design_system/auratio_design_system.dart';
import '../../../shared/presentation/widgets/auratio_screen_header.dart';
import '../../../tracks/domain/track_catalog.dart';
import '../../application/approved_evaluation_provider.dart';
import '../../domain/evaluation_method.dart';
import '../../domain/persisted_evaluation.dart';

class PersistedEvaluationResultScreen extends ConsumerWidget {
  const PersistedEvaluationResultScreen({
    required this.expectedMethod,
    this.requestId,
    this.submissionId,
    super.key,
  });

  final EvaluationMethod expectedMethod;
  final String? requestId;
  final String? submissionId;

  static const screenKey = Key('persisted-evaluation-result-screen');
  static const finalScoreKey = Key('persisted-evaluation-final-score');
  static const reportButtonKey = Key('persisted-evaluation-report-button');
  static const progressButtonKey = Key('persisted-evaluation-progress-button');

  static const _overlayStyle = SystemUiOverlayStyle(
    statusBarColor: AuratioColors.backgroundBrand,
    statusBarIconBrightness: Brightness.light,
    statusBarBrightness: Brightness.dark,
    systemNavigationBarColor: AuratioColors.backgroundApp,
    systemNavigationBarIconBrightness: Brightness.dark,
  );

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final locator = (requestId: requestId, submissionId: submissionId);
    final result = ref.watch(approvedEvaluationDetailProvider(locator));

    return AnnotatedRegion<SystemUiOverlayStyle>(
      key: screenKey,
      value: _overlayStyle,
      child: result.when(
        loading: () => _stateScaffold(
          context,
          title: 'Evaluation Result',
          heading: 'Loading Approved result',
          message: 'Auratio is reading the final persisted evaluation.',
        ),
        error: (_, _) => _stateScaffold(
          context,
          title: 'Evaluation Result',
          heading: 'Result unavailable',
          message: 'Auratio could not load this Approved evaluation. Return to history and try again.',
          retry: () =>
              ref.invalidate(approvedEvaluationDetailProvider(locator)),
        ),
        data: (detail) {
          if (detail == null || detail.request.method != expectedMethod) {
            return _stateScaffold(
              context,
              title: 'Evaluation Result',
              heading: 'Approved result not found',
              message:
                  'No matching Approved ${expectedMethod.displayName} result is available for this request.',
            );
          }
          return _buildResult(context, detail);
        },
      ),
    );
  }

  Widget _buildResult(BuildContext context, ApprovedEvaluationDetail detail) {
    final track = AuratioTrackCatalog.findByBackendId(detail.request.trackId);
    final trackName = track?.name ?? detail.request.trackId;
    final grouped = <String, List<EvaluationCriterionResult>>{
      'universal_delivery': [],
      'structural_flow': [],
      'track_specialisation': [],
    };
    for (final criterion in detail.criteria) {
      grouped[criterion.category]?.add(criterion);
    }

    final locatorQuery = <String, String>{'request': detail.request.id};

    return Scaffold(
      backgroundColor: AuratioColors.backgroundApp,
      body: SafeArea(
        top: false,
        child: Column(
          children: [
            AuratioScreenHeader(
              title: 'Evaluation Result',
              showBack: true,
              onBack: () => context.go(AppRoutePaths.approvedEvaluationHistory),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(20, 24, 20, 40),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 7,
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
                    const SizedBox(height: 16),
                    Text(
                      trackName,
                      style: AuratioTypography.headingMedium.copyWith(
                        color: AuratioColors.textPrimary,
                        fontSize: 24,
                        height: 32 / 24,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      detail.request.method.displayName,
                      style: AuratioTypography.bodyMedium.copyWith(
                        color: AuratioColors.textSecondary,
                      ),
                    ),
                    const SizedBox(height: 22),
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
                            'FINAL SCORE',
                            style: AuratioTypography.caption.copyWith(
                              color: AuratioColors.textTertiary,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            '${detail.version.finalScore} / 100',
                            key: finalScoreKey,
                            style: AuratioTypography.headingLarge.copyWith(
                              color: AuratioColors.backgroundBrand,
                              fontSize: 34,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              Expanded(
                                child: _scoreTile(
                                  'Universal',
                                  detail.version.universalScore,
                                  40,
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: _scoreTile(
                                  'Structure',
                                  detail.version.structuralScore,
                                  20,
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: _scoreTile(
                                  'Track',
                                  detail.version.trackScore,
                                  40,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 18),
                    _sectionCard(
                      title: 'Overall Evaluation Summary',
                      child: Text(
                        detail.version.overallSummary,
                        style: AuratioTypography.bodyMedium.copyWith(
                          color: AuratioColors.textSecondary,
                          height: 1.5,
                        ),
                      ),
                    ),
                    const SizedBox(height: 26),
                    for (final category in const [
                      'universal_delivery',
                      'structural_flow',
                      'track_specialisation',
                    ]) ...[
                      Text(
                        _categoryLabel(category),
                        style: AuratioTypography.headingSmall.copyWith(
                          color: AuratioColors.textPrimary,
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 10),
                      for (final criterion in grouped[category]!)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: _criterionCard(criterion),
                        ),
                      const SizedBox(height: 8),
                    ],
                    const SizedBox(height: 12),
                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: AuratioButton(
                        key: reportButtonKey,
                        label: 'Open Official .docx Report',
                        variant: AuratioButtonVariant.primary,
                        expand: true,
                        onPressed: () => context.push(
                          Uri(
                            path: AppRoutePaths.evaluationReport,
                            queryParameters: locatorQuery,
                          ).toString(),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: AuratioButton(
                        key: progressButtonKey,
                        label: 'View Progress',
                        variant: AuratioButtonVariant.secondary,
                        expand: true,
                        onPressed: () => context.go(AppRoutePaths.progress),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  static Widget _scoreTile(String label, int score, int maxScore) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
      decoration: BoxDecoration(
        color: AuratioColors.surfaceDefault,
        borderRadius: BorderRadius.circular(AuratioRadii.md),
      ),
      child: Column(
        children: [
          Text(
            '$score/$maxScore',
            style: AuratioTypography.titleMedium.copyWith(
              color: AuratioColors.backgroundBrand,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 3),
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

  static Widget _sectionCard({required String title, required Widget child}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AuratioColors.surfaceDefault,
        border: Border.all(color: AuratioColors.borderDefault),
        borderRadius: BorderRadius.circular(AuratioRadii.lg),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: AuratioTypography.labelLarge.copyWith(
              color: AuratioColors.textPrimary,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 10),
          child,
        ],
      ),
    );
  }

  static Widget _criterionCard(EvaluationCriterionResult criterion) {
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
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Text(
                  criterion.criterionName,
                  style: AuratioTypography.labelLarge.copyWith(
                    color: AuratioColors.textPrimary,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Text(
                '${criterion.score}/${criterion.maxPoints}',
                style: AuratioTypography.labelLarge.copyWith(
                  color: AuratioColors.backgroundBrand,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 6,
            children: [
              _chip('Anchor: ${_anchorLabel(criterion.anchor)}'),
              _chip(
                'Timestamp: ${_formatTimestamp(criterion.primaryTimestampSeconds)}',
              ),
            ],
          ),
          const SizedBox(height: 12),
          _feedbackLine('Evidence', criterion.evidence),
          _feedbackLine('Strength', criterion.strength),
          _feedbackLine('Weakness', criterion.weakness),
          _feedbackLine(
            'Actionable Improvement',
            criterion.actionableImprovement,
          ),
        ],
      ),
    );
  }

  static Widget _chip(String value) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
      decoration: BoxDecoration(
        color: AuratioColors.surfaceBrandSoft,
        borderRadius: BorderRadius.circular(AuratioRadii.pill),
      ),
      child: Text(
        value,
        style: AuratioTypography.caption.copyWith(
          color: AuratioColors.backgroundBrand,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  static Widget _feedbackLine(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: RichText(
        text: TextSpan(
          style: AuratioTypography.bodySmall.copyWith(
            color: AuratioColors.textSecondary,
            height: 1.45,
          ),
          children: [
            TextSpan(
              text: '$label: ',
              style: const TextStyle(fontWeight: FontWeight.w700),
            ),
            TextSpan(text: value),
          ],
        ),
      ),
    );
  }

  static String _categoryLabel(String category) {
    switch (category) {
      case 'universal_delivery':
        return 'Universal Delivery · /40';
      case 'structural_flow':
        return 'Structural Flow · /20';
      case 'track_specialisation':
        return 'Track Specialisation · /40';
      default:
        return category;
    }
  }

  static String _anchorLabel(String value) {
    switch (value) {
      case 'low':
        return 'Low';
      case 'competent':
        return 'Competent';
      case 'excellent':
        return 'Excellent';
      default:
        return value;
    }
  }

  static String _formatTimestamp(double secondsValue) {
    final total = secondsValue.floor();
    final minutes = total ~/ 60;
    final seconds = total % 60;
    return '$minutes:${seconds.toString().padLeft(2, '0')}';
  }

  static Widget _stateScaffold(
    BuildContext context, {
    required String title,
    required String heading,
    required String message,
    VoidCallback? retry,
  }) {
    return Scaffold(
      backgroundColor: AuratioColors.backgroundApp,
      body: SafeArea(
        top: false,
        child: Column(
          children: [
            AuratioScreenHeader(
              title: title,
              showBack: true,
              onBack: () => context.go(AppRoutePaths.approvedEvaluationHistory),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        heading,
                        textAlign: TextAlign.center,
                        style: AuratioTypography.headingMedium.copyWith(
                          color: AuratioColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 10),
                      Text(
                        message,
                        textAlign: TextAlign.center,
                        style: AuratioTypography.bodyMedium.copyWith(
                          color: AuratioColors.textSecondary,
                        ),
                      ),
                      if (retry != null) ...[
                        const SizedBox(height: 20),
                        AuratioButton(
                          label: 'Try Again',
                          variant: AuratioButtonVariant.secondary,
                          onPressed: retry,
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
