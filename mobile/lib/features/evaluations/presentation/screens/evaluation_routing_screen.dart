import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router/app_route_paths.dart';
import '../../../../foundation/design_system/auratio_design_system.dart';
import '../../../shared/presentation/widgets/auratio_screen_header.dart';
import '../../application/evaluation_repository_provider.dart';
import '../../application/latest_evaluation_request_provider.dart';
import '../../domain/evaluation_method.dart';
import '../../domain/persisted_evaluation.dart';

class EvaluationRoutingScreen extends ConsumerWidget {
  const EvaluationRoutingScreen({required this.method, super.key});

  final EvaluationMethod method;

  static const aiScreenKey = Key('routing-assigned-ai-screen');
  static const humanScreenKey = Key('routing-assigned-human-screen');
  static const badgeKey = Key('routing-assigned-badge');
  static const headingKey = Key('routing-assigned-heading');
  static const statusCardKey = Key('routing-assigned-status-card');
  static const infoCardKey = Key('routing-assigned-info-card');
  static const continueButtonKey = Key('routing-assigned-continue-button');

  static const _overlayStyle = SystemUiOverlayStyle(
    statusBarColor: AuratioColors.backgroundBrand,
    statusBarIconBrightness: Brightness.light,
    statusBarBrightness: Brightness.dark,
    systemNavigationBarColor: AuratioColors.backgroundApp,
    systemNavigationBarIconBrightness: Brightness.dark,
  );

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final configured = ref
        .watch(auratioEvaluationRepositoryProvider)
        .isConfigured;

    if (!configured) {
      return _buildScreen(
        context: context,
        effectiveMethod: method,
        persistedRequest: null,
        prototype: true,
      );
    }

    final requestAsync = ref.watch(latestEvaluationRequestProvider);
    return requestAsync.when(
      data: (request) => _buildScreen(
        context: context,
        effectiveMethod: request?.method ?? method,
        persistedRequest: request,
        prototype: false,
      ),
      loading: () => _buildScreen(
        context: context,
        effectiveMethod: method,
        persistedRequest: null,
        prototype: false,
        loading: true,
      ),
      error: (_, _) => _buildScreen(
        context: context,
        effectiveMethod: method,
        persistedRequest: null,
        prototype: false,
        loadFailed: true,
      ),
    );
  }

  Widget _buildScreen({
    required BuildContext context,
    required EvaluationMethod effectiveMethod,
    required PersistedEvaluationRequest? persistedRequest,
    required bool prototype,
    bool loading = false,
    bool loadFailed = false,
  }) {
    final isAi = effectiveMethod == EvaluationMethod.ai;
    final userStatus = persistedRequest?.userStatus;
    final statusLabel = loading
        ? 'Refreshing…'
        : loadFailed
        ? 'Status unavailable'
        : _statusLabel(userStatus);
    final heading = prototype
        ? effectiveMethod.assignedTitle
        : isAi
        ? 'AI Evaluation requested'
        : 'Human Evaluation requested';
    final badge = prototype
        ? effectiveMethod.badgeLabel
        : isAi
        ? 'AI request created'
        : 'Human request created';

    return AnnotatedRegion<SystemUiOverlayStyle>(
      key: isAi ? aiScreenKey : humanScreenKey,
      value: _overlayStyle,
      child: Scaffold(
        backgroundColor: AuratioColors.backgroundApp,
        body: SafeArea(
          top: false,
          child: Column(
            children: [
              AuratioScreenHeader(
                title: 'Evaluation Routing',
                showBack: true,
                onBack: () => context.go(AppRoutePaths.chooseEvaluationMethod),
              ),
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AuratioSpacing.xl,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 24),
                      Container(
                        key: badgeKey,
                        width: isAi ? 122 : 143,
                        height: 30,
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        decoration: BoxDecoration(
                          color: AuratioColors.surfaceBrandSoft,
                          borderRadius: BorderRadius.circular(
                            AuratioRadii.pill,
                          ),
                        ),
                        child: Center(
                          child: Text(
                            badge,
                            style: AuratioTypography.caption.copyWith(
                              color: AuratioColors.backgroundBrand,
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
                        key: headingKey,
                        style: AuratioTypography.headingMedium.copyWith(
                          color: AuratioColors.textPrimary,
                          fontSize: 24,
                          height: 32 / 24,
                          fontWeight: FontWeight.w700,
                          letterSpacing: -0.3,
                        ),
                      ),
                      const SizedBox(height: 24),
                      SizedBox(
                        key: statusCardKey,
                        width: double.infinity,
                        height: 116,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 14,
                            vertical: 16,
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
                                'ROUTING STATUS',
                                style: AuratioTypography.caption.copyWith(
                                  color: AuratioColors.neutral500,
                                  fontSize: 11,
                                  height: 16 / 11,
                                  fontWeight: FontWeight.w500,
                                  letterSpacing: 0.2,
                                ),
                              ),
                              const SizedBox(height: 12),
                              Text(
                                'Requested method: ${effectiveMethod.displayName}',
                                style: AuratioTypography.bodyMedium.copyWith(
                                  color: AuratioColors.textPrimary,
                                  fontSize: 13,
                                  height: 19 / 13,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              const SizedBox(height: 7),
                              Text(
                                prototype
                                    ? 'Current routing: ${effectiveMethod.badgeLabel}'
                                    : 'Persisted status: $statusLabel',
                                style: AuratioTypography.bodyMedium.copyWith(
                                  color: AuratioColors.textPrimary,
                                  fontSize: 13,
                                  height: 19 / 13,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 18),
                      SizedBox(
                        key: infoCardKey,
                        width: double.infinity,
                        height: isAi ? 144 : 218,
                        child: Container(
                          padding: const EdgeInsets.fromLTRB(14, 14, 14, 12),
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
                                isAi ? 'What this means' : 'Human evaluation',
                                style: AuratioTypography.labelLarge.copyWith(
                                  color: AuratioColors.backgroundBrand,
                                  fontSize: 14,
                                  height: 20 / 14,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(height: 8),
                              if (isAi) ...[
                                Text(
                                  prototype
                                      ? 'Auratio will process this recording using the configured AI evaluator.'
                                      : 'The persisted AI request is in the server-controlled evaluation lifecycle.',
                                  style: AuratioTypography.bodySmall.copyWith(
                                    color: AuratioColors.textSecondary,
                                    fontSize: 12,
                                    height: 18 / 12,
                                    fontWeight: FontWeight.w400,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  'Routing decides who evaluates. Publication/moderation is a separate later stage.',
                                  style: AuratioTypography.bodySmall.copyWith(
                                    color: AuratioColors.textSecondary,
                                    fontSize: 12,
                                    height: 18 / 12,
                                    fontWeight: FontWeight.w400,
                                  ),
                                ),
                              ] else ...[
                                Text(
                                  prototype
                                      ? 'An authorized evaluator completes the standardized rubric, criterion-specific anchor assessment, exact scores, and required structured feedback. The official .docx report is generated automatically only after publication approval.'
                                      : 'The persisted Human request starts unassigned. An Admin must assign an authorized evaluator before Human evaluation work can begin.',
                                  style: AuratioTypography.bodySmall.copyWith(
                                    color: AuratioColors.textSecondary,
                                    fontSize: 12,
                                    height: 18 / 12,
                                    fontWeight: FontWeight.w400,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  prototype
                                      ? 'If this is your first Human Evaluation in this track, manual admin review is required before the score can take effect.'
                                      : 'Until assignment, review, and approval occur, the End-User product status remains Processing.',
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
                      SizedBox(height: isAi ? 252 : 178),
                      SizedBox(
                        height: 48,
                        width: double.infinity,
                        child: AuratioButton(
                          key: continueButtonKey,
                          label: 'Continue to Status',
                          variant: AuratioButtonVariant.primary,
                          expand: true,
                          onPressed:
                              !prototype &&
                                  (loading ||
                                      loadFailed ||
                                      persistedRequest == null)
                              ? null
                              : () {
                                  context.go(
                                    isAi
                                        ? AppRoutePaths.evaluationProcessingAi
                                        : AppRoutePaths
                                              .evaluationProcessingHuman,
                                  );
                                },
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
        return 'Not found';
    }
  }
}
