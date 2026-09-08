import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router/app_route_paths.dart';
import '../../../../foundation/design_system/auratio_design_system.dart';
import '../../../shared/presentation/widgets/auratio_screen_header.dart';
import '../../../tracks/application/selected_track_provider.dart';
import '../../../tracks/domain/track_catalog.dart';
import '../../application/evaluation_repository_provider.dart';
import '../../application/latest_evaluation_request_provider.dart';
import '../../data/evaluation_repository.dart';
import '../../domain/evaluation_method.dart';
import '../../domain/persisted_evaluation.dart';

class EvaluationProcessingScreen extends ConsumerStatefulWidget {
  const EvaluationProcessingScreen({required this.method, super.key});

  final EvaluationMethod method;

  static const aiScreenKey = Key('evaluation-processing-ai-screen');
  static const humanScreenKey = Key('evaluation-processing-human-screen');
  static const badgeKey = Key('evaluation-processing-badge');
  static const headingKey = Key('evaluation-processing-heading');
  static const subtitleKey = Key('evaluation-processing-subtitle');
  static const evaluationCardKey = Key('evaluation-processing-evaluation-card');
  static const publicationStatusCardKey = Key(
    'evaluation-processing-publication-status-card',
  );
  static const videoNoteKey = Key('evaluation-processing-video-note');
  static const returnHomeButtonKey = Key(
    'evaluation-processing-return-home-button',
  );
  static const redirectCardKey = Key('evaluation-processing-redirect-card');
  static const redirectButtonKey = Key('evaluation-processing-redirect-button');
  static const redirectKeepAiButtonKey = Key(
    'evaluation-processing-redirect-keep-ai-button',
  );
  static const redirectConfirmButtonKey = Key(
    'evaluation-processing-redirect-confirm-button',
  );
  static const redirectErrorKey = Key('evaluation-processing-redirect-error');

  static const _overlayStyle = SystemUiOverlayStyle(
    statusBarColor: AuratioColors.backgroundBrand,
    statusBarIconBrightness: Brightness.light,
    statusBarBrightness: Brightness.dark,
    systemNavigationBarColor: AuratioColors.backgroundApp,
    systemNavigationBarIconBrightness: Brightness.dark,
  );

  @override
  ConsumerState<EvaluationProcessingScreen> createState() =>
      _EvaluationProcessingScreenState();
}

class _EvaluationProcessingScreenState
    extends ConsumerState<EvaluationProcessingScreen> {
  Timer? _pollTimer;
  bool _redirecting = false;
  String? _redirectError;

  @override
  void initState() {
    super.initState();
    if (ref.read(auratioEvaluationRepositoryProvider).isConfigured) {
      _pollTimer = Timer.periodic(const Duration(seconds: 5), (_) {
        if (mounted) {
          ref.invalidate(latestEvaluationRequestProvider);
        }
      });
    }
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final configured = ref
        .watch(auratioEvaluationRepositoryProvider)
        .isConfigured;

    if (!configured) {
      final track = ref.watch(selectedTrackProvider);
      return _buildScreen(
        context: context,
        method: widget.method,
        trackName: track.name,
        status: UserEvaluationStatus.processing,
        prototype: true,
        persistedRequest: null,
      );
    }

    final requestAsync = ref.watch(latestEvaluationRequestProvider);
    return requestAsync.when(
      data: (request) {
        final track = request == null
            ? null
            : AuratioTrackCatalog.findByBackendId(request.trackId);
        return _buildScreen(
          context: context,
          method: request?.method ?? widget.method,
          trackName: track?.name ?? 'Evaluation',
          status: request?.userStatus,
          prototype: false,
          requestFound: request != null,
          persistedRequest: request,
        );
      },
      loading: () => _buildScreen(
        context: context,
        method: widget.method,
        trackName: 'Evaluation',
        status: null,
        prototype: false,
        persistedRequest: null,
        loading: true,
      ),
      error: (_, _) => _buildScreen(
        context: context,
        method: widget.method,
        trackName: 'Evaluation',
        status: null,
        prototype: false,
        persistedRequest: null,
        loadFailed: true,
      ),
    );
  }

  Future<bool> _confirmHumanRedirect() async {
    final result = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Switch this request to Human?'),
        content: const Text(
          'You originally requested AI Evaluation. By confirming, you explicitly consent to redirect this same request to Human Evaluation. This is not automatic and is not an AI-error fallback.',
        ),
        actions: [
          TextButton(
            key: EvaluationProcessingScreen.redirectKeepAiButtonKey,
            onPressed: () => Navigator.of(dialogContext).pop(false),
            child: const Text('Keep AI Evaluation'),
          ),
          TextButton(
            key: EvaluationProcessingScreen.redirectConfirmButtonKey,
            onPressed: () => Navigator.of(dialogContext).pop(true),
            child: const Text('Yes, switch to Human'),
          ),
        ],
      ),
    );
    return result ?? false;
  }

  Future<void> _consentAiToHuman(PersistedEvaluationRequest request) async {
    if (!request.canConsentAiToHuman || _redirecting) return;

    final confirmed = await _confirmHumanRedirect();
    if (!confirmed || !mounted) return;

    setState(() {
      _redirecting = true;
      _redirectError = null;
    });

    try {
      await ref
          .read(auratioEvaluationRepositoryProvider)
          .consentAiToHuman(request.id);
      ref.invalidate(latestEvaluationRequestProvider);
      if (!mounted) return;
      setState(() {
        _redirecting = false;
      });
    } on AuratioEvaluationDataException catch (error) {
      if (!mounted) return;
      setState(() {
        _redirecting = false;
        _redirectError = error.message;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _redirecting = false;
        _redirectError = 'Unable to switch this request to Human. The AI route remains unchanged.';
      });
    }
  }

  Widget _buildScreen({
    required BuildContext context,
    required EvaluationMethod method,
    required String trackName,
    required UserEvaluationStatus? status,
    required bool prototype,
    bool loading = false,
    bool loadFailed = false,
    bool requestFound = true,
    required PersistedEvaluationRequest? persistedRequest,
  }) {
    final isAi = method == EvaluationMethod.ai;
    final requestedMethod = persistedRequest?.requestedMethod ?? method;
    final requestId = persistedRequest?.id;
    final redirectableRequest =
        !prototype && persistedRequest?.canConsentAiToHuman == true
        ? persistedRequest
        : null;
    final wasRedirected =
        !prototype && persistedRequest?.wasRedirectedAiToHuman == true;
    final canViewApprovedResult =
        !prototype &&
        status == UserEvaluationStatus.approved &&
        requestId != null;
    final statusLabel = loading
        ? 'Refreshing…'
        : loadFailed
        ? 'Status unavailable'
        : !requestFound
        ? 'No request found'
        : _statusLabel(status);
    final heading = _heading(status, loading: loading, failed: loadFailed);
    final subtitle = prototype
        ? 'The evaluation is being generated or reviewed.'
        : _subtitle(status, loading: loading, failed: loadFailed);
    final effectText = status == UserEvaluationStatus.approved
        ? 'Approved score effects are persisted. Return to Home to continue.'
        : status == UserEvaluationStatus.rejected ||
              status == UserEvaluationStatus.cancelled
        ? 'No score, progress, qualification, or leaderboard effect is created.'
        : 'No score, progress, rating-window, qualification, or leaderboard effect yet.';

    return AnnotatedRegion<SystemUiOverlayStyle>(
      key: isAi
          ? EvaluationProcessingScreen.aiScreenKey
          : EvaluationProcessingScreen.humanScreenKey,
      value: EvaluationProcessingScreen._overlayStyle,
      child: Scaffold(
        backgroundColor: AuratioColors.backgroundApp,
        body: SafeArea(
          top: false,
          child: Column(
            children: [
              AuratioScreenHeader(
                title: 'Evaluation Status',
                showBack: true,
                onBack: () => context.go(
                  isAi
                      ? AppRoutePaths.routingAssignedAi
                      : AppRoutePaths.routingAssignedHuman,
                ),
              ),
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 24),
                      SizedBox(
                        key: EvaluationProcessingScreen.badgeKey,
                        width: prototype ? 94 : 110,
                        height: 30,
                        child: Container(
                          alignment: Alignment.center,
                          decoration: BoxDecoration(
                            color: _statusBackground(status),
                            borderRadius: BorderRadius.circular(999),
                          ),
                          child: Text(
                            statusLabel,
                            textAlign: TextAlign.center,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: AuratioTypography.caption.copyWith(
                              color: _statusForeground(status),
                              fontSize: 11,
                              height: 16 / 11,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 18),
                      Text(
                        heading,
                        key: EvaluationProcessingScreen.headingKey,
                        style: AuratioTypography.headingMedium.copyWith(
                          color: AuratioColors.textPrimary,
                          fontSize: 24,
                          height: 32 / 24,
                          fontWeight: FontWeight.w700,
                          letterSpacing: -0.3,
                        ),
                      ),
                      const SizedBox(height: 10),
                      Text(
                        subtitle,
                        key: EvaluationProcessingScreen.subtitleKey,
                        style: AuratioTypography.bodyMedium.copyWith(
                          color: AuratioColors.textSecondary,
                          fontSize: 13,
                          height: 19 / 13,
                          fontWeight: FontWeight.w400,
                        ),
                      ),
                      const SizedBox(height: 39),
                      SizedBox(
                        key: EvaluationProcessingScreen.evaluationCardKey,
                        width: double.infinity,
                        height: prototype ? 104 : 128,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 14,
                            vertical: 14,
                          ),
                          decoration: BoxDecoration(
                            color: AuratioColors.surfaceDefault,
                            border: Border.all(
                              color: AuratioColors.borderDefault,
                            ),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'EVALUATION',
                                style: AuratioTypography.caption.copyWith(
                                  color: AuratioColors.neutral500,
                                  fontSize: 11,
                                  height: 16 / 11,
                                  fontWeight: FontWeight.w500,
                                  letterSpacing: 0.2,
                                ),
                              ),
                              const SizedBox(height: 10),
                              Text(
                                trackName,
                                style: AuratioTypography.labelLarge.copyWith(
                                  color: AuratioColors.textPrimary,
                                  fontSize: 14,
                                  height: 20 / 14,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(height: 8),
                              if (prototype) ...[
                                Text(
                                  'Method: ${method.displayName}',
                                  style: AuratioTypography.bodySmall.copyWith(
                                    color: AuratioColors.textSecondary,
                                    fontSize: 12,
                                    height: 18 / 12,
                                    fontWeight: FontWeight.w400,
                                  ),
                                ),
                              ] else ...[
                                Text(
                                  'Requested: ${requestedMethod.displayName}',
                                  style: AuratioTypography.bodySmall.copyWith(
                                    color: AuratioColors.textSecondary,
                                    fontSize: 12,
                                    height: 18 / 12,
                                    fontWeight: FontWeight.w400,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Current route: ${method.displayName}',
                                  style: AuratioTypography.bodySmall.copyWith(
                                    color: AuratioColors.textSecondary,
                                    fontSize: 12,
                                    height: 18 / 12,
                                    fontWeight: FontWeight.w400,
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 18),
                      SizedBox(
                        key:
                            EvaluationProcessingScreen.publicationStatusCardKey,
                        width: double.infinity,
                        height: 126,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 14,
                            vertical: 14,
                          ),
                          decoration: BoxDecoration(
                            color: AuratioColors.surfaceBrandSoft,
                            border: Border.all(
                              color: AuratioColors.borderDefault,
                            ),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'PUBLICATION STATUS',
                                style: AuratioTypography.caption.copyWith(
                                  color: AuratioColors.neutral500,
                                  fontSize: 11,
                                  height: 16 / 11,
                                  fontWeight: FontWeight.w500,
                                  letterSpacing: 0.2,
                                ),
                              ),
                              const SizedBox(height: 10),
                              Text(
                                prototype ? 'Processing' : statusLabel,
                                style: AuratioTypography.titleMedium.copyWith(
                                  color: _statusForeground(status),
                                  fontSize: 15,
                                  height: 22 / 15,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                effectText,
                                style: AuratioTypography.bodySmall.copyWith(
                                  color: AuratioColors.textSecondary,
                                  fontSize: 12,
                                  height: 18 / 12,
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      if (redirectableRequest != null) ...[
                        const SizedBox(height: 18),
                        Container(
                          key: EvaluationProcessingScreen.redirectCardKey,
                          width: double.infinity,
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: AuratioColors.surfaceBrandSoft,
                            border: Border.all(
                              color: AuratioColors.borderDefault,
                            ),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Prefer Human evaluation?',
                                style: AuratioTypography.labelLarge.copyWith(
                                  color: AuratioColors.backgroundBrand,
                                  fontSize: 14,
                                  height: 20 / 14,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'You requested AI. You may explicitly switch this same request to Human before AI output is persisted. Auratio will never make this switch automatically because of an AI/API failure.',
                                style: AuratioTypography.bodySmall.copyWith(
                                  color: AuratioColors.textSecondary,
                                  fontSize: 12,
                                  height: 18 / 12,
                                ),
                              ),
                              const SizedBox(height: 12),
                              SizedBox(
                                width: double.infinity,
                                height: 44,
                                child: AuratioButton(
                                  key: EvaluationProcessingScreen
                                      .redirectButtonKey,
                                  label: _redirecting
                                      ? 'Switching…'
                                      : 'Switch to Human',
                                  variant: AuratioButtonVariant.secondary,
                                  expand: true,
                                  onPressed: _redirecting
                                      ? null
                                      : () => _consentAiToHuman(
                                          redirectableRequest,
                                        ),
                                ),
                              ),
                              if (_redirectError != null) ...[
                                const SizedBox(height: 10),
                                Text(
                                  _redirectError!,
                                  key: EvaluationProcessingScreen
                                      .redirectErrorKey,
                                  style: AuratioTypography.bodySmall.copyWith(
                                    color:
                                        AuratioColors.statusRejectedForeground,
                                    fontSize: 12,
                                    height: 18 / 12,
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                      ] else if (wasRedirected) ...[
                        const SizedBox(height: 18),
                        Container(
                          key: EvaluationProcessingScreen.redirectCardKey,
                          width: double.infinity,
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: AuratioColors.surfaceBrandSoft,
                            border: Border.all(
                              color: AuratioColors.borderDefault,
                            ),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'AI → Human consent recorded',
                                style: AuratioTypography.labelLarge.copyWith(
                                  color: AuratioColors.backgroundBrand,
                                  fontSize: 14,
                                  height: 20 / 14,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'You originally requested AI and explicitly consented to Human evaluation. The original request method remains recorded while the current route is Human.',
                                style: AuratioTypography.bodySmall.copyWith(
                                  color: AuratioColors.textSecondary,
                                  fontSize: 12,
                                  height: 18 / 12,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                      const SizedBox(height: 26),
                      Text(
                        status == UserEvaluationStatus.processing || prototype
                            ? 'The temporary video remains available while evaluation or required moderation is in progress.'
                            : 'The final request status shown here is read from persisted Supabase data.',
                        key: EvaluationProcessingScreen.videoNoteKey,
                        style: AuratioTypography.bodySmall.copyWith(
                          color: AuratioColors.textSecondary,
                          fontSize: 12,
                          height: 18 / 12,
                          fontWeight: FontWeight.w400,
                        ),
                      ),
                      const SizedBox(height: 176),
                      SizedBox(
                        height: 48,
                        width: double.infinity,
                        child: AuratioButton(
                          key: EvaluationProcessingScreen.returnHomeButtonKey,
                          label: canViewApprovedResult
                              ? 'View Approved Result'
                              : 'Return to Home',
                          variant: canViewApprovedResult
                              ? AuratioButtonVariant.primary
                              : AuratioButtonVariant.secondary,
                          expand: true,
                          onPressed: canViewApprovedResult
                              ? () {
                                  final resultPath = isAi
                                      ? AppRoutePaths.evaluationResultAi
                                      : AppRoutePaths.evaluationResultHuman;
                                  context.go(
                                    Uri(
                                      path: resultPath,
                                      queryParameters: {'request': requestId},
                                    ).toString(),
                                  );
                                }
                              : () => context.go(AppRoutePaths.home),
                        ),
                      ),
                      const SizedBox(height: 46),
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

  static String _statusLabel(UserEvaluationStatus? status) {
    switch (status) {
      case UserEvaluationStatus.processing:
        return 'Processing';
      case UserEvaluationStatus.approved:
        return 'Approved';
      case UserEvaluationStatus.rejected:
        return 'Rejected';
      case UserEvaluationStatus.cancelled:
        return 'Cancelled';
      case null:
        return 'Refreshing…';
    }
  }

  static String _heading(
    UserEvaluationStatus? status, {
    required bool loading,
    required bool failed,
  }) {
    if (loading) return 'Refreshing evaluation status';
    if (failed) return 'Status temporarily unavailable';
    switch (status) {
      case UserEvaluationStatus.approved:
        return 'Your evaluation is approved';
      case UserEvaluationStatus.rejected:
        return 'Your evaluation was rejected';
      case UserEvaluationStatus.cancelled:
        return 'Your evaluation was cancelled';
      case UserEvaluationStatus.processing:
      case null:
        return 'Your evaluation is in progress';
    }
  }

  static String _subtitle(
    UserEvaluationStatus? status, {
    required bool loading,
    required bool failed,
  }) {
    if (loading) {
      return 'Auratio is reading the latest persisted request state.';
    }
    if (failed) {
      return 'Return later to refresh the persisted request state.';
    }
    switch (status) {
      case UserEvaluationStatus.approved:
        return 'The approved evaluation is persisted and ready for the next presentation step.';
      case UserEvaluationStatus.rejected:
        return 'The evaluation did not create Approved product effects.';
      case UserEvaluationStatus.cancelled:
        return 'The evaluation request ended without Approved product effects.';
      case UserEvaluationStatus.processing:
      case null:
        return 'The evaluation is being generated, assigned, reviewed, or moderated.';
    }
  }

  static Color _statusBackground(UserEvaluationStatus? status) {
    switch (status) {
      case UserEvaluationStatus.approved:
        return AuratioColors.statusApprovedBackground;
      case UserEvaluationStatus.rejected:
      case UserEvaluationStatus.cancelled:
        return AuratioColors.statusRejectedBackground;
      case UserEvaluationStatus.processing:
      case null:
        return AuratioColors.surfaceBrandSoft;
    }
  }

  static Color _statusForeground(UserEvaluationStatus? status) {
    switch (status) {
      case UserEvaluationStatus.approved:
        return AuratioColors.statusApprovedForeground;
      case UserEvaluationStatus.rejected:
      case UserEvaluationStatus.cancelled:
        return AuratioColors.statusRejectedForeground;
      case UserEvaluationStatus.processing:
      case null:
        return AuratioColors.brandNavy900;
    }
  }
}
