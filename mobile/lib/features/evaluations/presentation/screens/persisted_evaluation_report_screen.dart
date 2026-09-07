import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router/app_route_paths.dart';
import '../../../../foundation/design_system/auratio_design_system.dart';
import '../../../shared/presentation/widgets/auratio_screen_header.dart';
import '../../../tracks/domain/track_catalog.dart';
import '../../application/approved_evaluation_provider.dart';
import '../../application/evaluation_repository_provider.dart';
import '../../data/report_file_saver.dart';
import '../../domain/persisted_evaluation.dart';

class PersistedEvaluationReportScreen extends ConsumerStatefulWidget {
  const PersistedEvaluationReportScreen({
    this.requestId,
    this.submissionId,
    super.key,
  });

  final String? requestId;
  final String? submissionId;

  static const screenKey = Key('persisted-evaluation-report-screen');
  static const downloadButtonKey = Key('persisted-report-download-button');
  static const filenameKey = Key('persisted-report-filename');

  @override
  ConsumerState<PersistedEvaluationReportScreen> createState() =>
      _PersistedEvaluationReportScreenState();
}

class _PersistedEvaluationReportScreenState
    extends ConsumerState<PersistedEvaluationReportScreen> {
  bool _saving = false;

  ApprovedEvaluationLocator get _locator =>
      (requestId: widget.requestId, submissionId: widget.submissionId);

  Future<void> _saveReport() async {
    if (_saving) return;

    setState(() {
      _saving = true;
    });

    try {
      final report = await ref.read(approvedReportProvider(_locator).future);
      if (!mounted) return;
      if (report == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'The official report is still being prepared. Refresh and try again.',
            ),
          ),
        );
        return;
      }

      final bytes = await ref
          .read(auratioEvaluationRepositoryProvider)
          .downloadApprovedReport(report);
      final savedUri = await ref
          .read(auratioReportFileSaverProvider)
          .saveDocx(filename: report.filename, bytes: bytes);

      if (!mounted) return;
      if (savedUri != null) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Auratio report saved.')));
      }
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Unable to save the official report right now.'),
        ),
      );
    } finally {
      if (mounted) {
        setState(() {
          _saving = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final detailAsync = ref.watch(approvedEvaluationDetailProvider(_locator));
    final reportAsync = ref.watch(approvedReportProvider(_locator));

    return AnnotatedRegion<SystemUiOverlayStyle>(
      key: PersistedEvaluationReportScreen.screenKey,
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
                title: 'Official Report',
                showBack: true,
                onBack: () =>
                    context.go(AppRoutePaths.approvedEvaluationHistory),
              ),
              Expanded(
                child: detailAsync.when(
                  loading: () =>
                      const Center(child: CircularProgressIndicator()),
                  error: (_, _) => _state(
                    heading: 'Report unavailable',
                    message: 'Auratio could not load the Approved evaluation for this report.',
                    onRetry: () {
                      ref.invalidate(
                        approvedEvaluationDetailProvider(_locator),
                      );
                      ref.invalidate(approvedReportProvider(_locator));
                    },
                  ),
                  data: (detail) {
                    if (detail == null) {
                      return _state(
                        heading: 'Approved evaluation not found',
                        message: 'Official reports exist only for Approved evaluations.',
                      );
                    }

                    return reportAsync.when(
                      loading: () => _reportBody(
                        detail: detail,
                        report: null,
                        preparing: true,
                      ),
                      error: (_, _) => _reportBody(
                        detail: detail,
                        report: null,
                        loadFailed: true,
                      ),
                      data: (report) =>
                          _reportBody(detail: detail, report: report),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _reportBody({
    required ApprovedEvaluationDetail detail,
    required ApprovedReportMetadata? report,
    bool preparing = false,
    bool loadFailed = false,
  }) {
    final track = AuratioTrackCatalog.findByBackendId(detail.request.trackId);
    final trackName = track?.name ?? detail.request.trackId;
    final statusText = report != null
        ? 'Ready'
        : preparing
        ? 'Preparing'
        : loadFailed
        ? 'Unavailable'
        : 'Preparing';

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 40),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
            decoration: BoxDecoration(
              color: report != null
                  ? AuratioColors.statusApprovedBackground
                  : AuratioColors.surfaceBrandSoft,
              borderRadius: BorderRadius.circular(AuratioRadii.pill),
            ),
            child: Text(
              statusText,
              style: AuratioTypography.caption.copyWith(
                color: report != null
                    ? AuratioColors.statusApprovedForeground
                    : AuratioColors.backgroundBrand,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'Auratio Evaluation Report',
            style: AuratioTypography.headingMedium.copyWith(
              color: AuratioColors.textPrimary,
              fontSize: 24,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            '$trackName · ${detail.request.method.displayName}',
            style: AuratioTypography.bodyMedium.copyWith(
              color: AuratioColors.textSecondary,
            ),
          ),
          const SizedBox(height: 22),
          Container(
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
                _metadataRow(
                  'Final score',
                  '${detail.version.finalScore} / 100',
                ),
                _metadataRow('Submission', detail.request.submissionId),
                _metadataRow(
                  'Approved',
                  _formatDate(detail.version.approvedAt),
                ),
                _metadataRow(
                  'Criteria',
                  '${detail.criteria.length} structured criteria',
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AuratioColors.surfaceBrandSoft,
              border: Border.all(color: AuratioColors.borderDefault),
              borderRadius: BorderRadius.circular(AuratioRadii.lg),
            ),
            child: report == null
                ? Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        loadFailed ? 'Report metadata could not be loaded.' : 'Auratio is preparing the immutable Approved report.',
                        style: AuratioTypography.bodyMedium.copyWith(
                          color: AuratioColors.textPrimary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'The same stored .docx will be returned on every later download.',
                        style: AuratioTypography.bodySmall.copyWith(
                          color: AuratioColors.textSecondary,
                        ),
                      ),
                    ],
                  )
                : Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        report.filename,
                        key: PersistedEvaluationReportScreen.filenameKey,
                        style: AuratioTypography.labelLarge.copyWith(
                          color: AuratioColors.textPrimary,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 10),
                      _metadataRow(
                        'Generated',
                        _formatDate(report.generatedAt),
                      ),
                      _metadataRow('File size', _formatSize(report.sizeBytes)),
                      _metadataRow('Storage', 'Private · immutable'),
                    ],
                  ),
          ),
          const SizedBox(height: 20),
          Text(
            'The official DOCX contains the score summary, all 16 criterion findings, primary timestamps, structured feedback, and the Overall Evaluation Summary. It does not contain your email, evaluator identity, model identity, leaderboard rank, mastery data, or internal moderation notes.',
            style: AuratioTypography.bodySmall.copyWith(
              color: AuratioColors.textSecondary,
              height: 1.5,
            ),
          ),
          const SizedBox(height: 26),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: AuratioButton(
              key: PersistedEvaluationReportScreen.downloadButtonKey,
              label: _saving
                  ? 'Saving…'
                  : report == null
                  ? 'Report Preparing'
                  : 'Save .docx',
              variant: AuratioButtonVariant.primary,
              expand: true,
              onPressed: report != null && !_saving ? _saveReport : null,
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: AuratioButton(
              label: report == null ? 'Refresh Report' : 'View Evaluation',
              variant: AuratioButtonVariant.secondary,
              expand: true,
              onPressed: report == null
                  ? () => ref.invalidate(approvedReportProvider(_locator))
                  : () {
                      final path = detail.request.method.wireValue == 'ai'
                          ? AppRoutePaths.evaluationResultAi
                          : AppRoutePaths.evaluationResultHuman;
                      context.push(
                        Uri(
                          path: path,
                          queryParameters: {'request': detail.request.id},
                        ).toString(),
                      );
                    },
            ),
          ),
        ],
      ),
    );
  }

  Widget _state({
    required String heading,
    required String message,
    VoidCallback? onRetry,
  }) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
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
            if (onRetry != null) ...[
              const SizedBox(height: 20),
              AuratioButton(
                label: 'Try Again',
                variant: AuratioButtonVariant.secondary,
                onPressed: onRetry,
              ),
            ],
          ],
        ),
      ),
    );
  }

  static Widget _metadataRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 92,
            child: Text(
              label,
              style: AuratioTypography.caption.copyWith(
                color: AuratioColors.textTertiary,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: AuratioTypography.bodySmall.copyWith(
                color: AuratioColors.textPrimary,
              ),
            ),
          ),
        ],
      ),
    );
  }

  static String _formatDate(DateTime value) {
    final local = value.toLocal();
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return '${local.day} ${months[local.month - 1]} ${local.year}';
  }

  static String _formatSize(int? bytes) {
    if (bytes == null) return 'Stored';
    const kb = 1024;
    const mb = 1024 * 1024;
    if (bytes >= mb) {
      return '${(bytes / mb).toStringAsFixed(1)} MB';
    }
    if (bytes >= kb) {
      return '${(bytes / kb).toStringAsFixed(1)} KB';
    }
    return '$bytes B';
  }
}
