import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router/app_route_paths.dart';
import '../../../../foundation/design_system/auratio_design_system.dart';
import '../../../shared/presentation/widgets/auratio_screen_header.dart';
import '../../../submissions/application/recording_submission_controller.dart';
import '../../application/evaluation_method_controller.dart';
import '../../application/evaluation_repository_provider.dart';
import '../../application/latest_evaluation_request_provider.dart';
import '../../domain/evaluation_method.dart';

class ChooseEvaluationMethodScreen extends ConsumerStatefulWidget {
  const ChooseEvaluationMethodScreen({this.initialMethod, super.key});

  final EvaluationMethod? initialMethod;

  static const screenKey = Key('choose-evaluation-method-screen');
  static const aiCardKey = Key('choose-evaluation-card-ai');
  static const humanCardKey = Key('choose-evaluation-card-human');
  static const aiRadioKey = Key('choose-evaluation-radio-ai');
  static const humanRadioKey = Key('choose-evaluation-radio-human');
  static const consentCardKey = Key('choose-evaluation-consent-card');
  static const continueButtonKey = Key('choose-evaluation-continue-button');
  static const footerNoteKey = Key('choose-evaluation-footer-note');

  static const _overlayStyle = SystemUiOverlayStyle(
    statusBarColor: AuratioColors.backgroundBrand,
    statusBarIconBrightness: Brightness.light,
    statusBarBrightness: Brightness.dark,
    systemNavigationBarColor: AuratioColors.backgroundApp,
    systemNavigationBarIconBrightness: Brightness.dark,
  );

  @override
  ConsumerState<ChooseEvaluationMethodScreen> createState() =>
      _ChooseEvaluationMethodScreenState();
}

class _ChooseEvaluationMethodScreenState
    extends ConsumerState<ChooseEvaluationMethodScreen> {
  @override
  void initState() {
    super.initState();
    if (widget.initialMethod != null) {
      Future.microtask(() {
        if (mounted) {
          ref
              .read(evaluationMethodSelectionProvider.notifier)
              .select(widget.initialMethod!);
        }
      });
    }
  }

  Future<void> _continue(EvaluationMethod method) async {
    final repository = ref.read(auratioEvaluationRepositoryProvider);
    if (!repository.isConfigured) {
      _goToRouting(method);
      return;
    }

    final receipt = await ref
        .read(recordingSubmissionProvider.notifier)
        .createEvaluationRequest(method);
    if (!mounted) return;

    ref.invalidate(latestEvaluationRequestProvider);

    if (receipt != null) {
      _goToRouting(method);
      return;
    }

    final state = ref.read(recordingSubmissionProvider);
    if (state.errorCode == 'active_request_exists') {
      context.go(
        method == EvaluationMethod.ai
            ? AppRoutePaths.evaluationProcessingAi
            : AppRoutePaths.evaluationProcessingHuman,
      );
      return;
    }

    final message =
        state.errorMessage ?? 'Unable to create the evaluation request.';
    ScaffoldMessenger.of(context)
        .showSnackBar(SnackBar(content: Text(message)));
  }

  void _goToRouting(EvaluationMethod method) {
    context.go(
      method == EvaluationMethod.ai
          ? AppRoutePaths.routingAssignedAi
          : AppRoutePaths.routingAssignedHuman,
    );
  }

  @override
  Widget build(BuildContext context) {
    final selectedMethod = ref.watch(evaluationMethodSelectionProvider);
    final submission = ref.watch(recordingSubmissionProvider);
    final repositoryConfigured = ref
        .watch(auratioEvaluationRepositoryProvider)
        .isConfigured;
    final isAi = selectedMethod == EvaluationMethod.ai;
    final isHuman = selectedMethod == EvaluationMethod.human;
    final canCreateRequest =
        !repositoryConfigured ||
        (submission.hasUploadedRecording && !submission.isBusy);

    return AnnotatedRegion<SystemUiOverlayStyle>(
      key: ChooseEvaluationMethodScreen.screenKey,
      value: ChooseEvaluationMethodScreen._overlayStyle,
      child: Scaffold(
        backgroundColor: AuratioColors.backgroundApp,
        body: SafeArea(
          top: false,
          child: Column(
            children: [
              AuratioScreenHeader(
                title: 'Choose Evaluation',
                showBack: true,
                onBack: () => context.go(AppRoutePaths.recordingAccepted),
                titleStyle: AuratioTypography.headingSmall.copyWith(
                  color: AuratioColors.textOnBrand,
                  fontSize: 20,
                  height: 28 / 20,
                  fontWeight: FontWeight.w600,
                ),
              ),
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AuratioSpacing.xl,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 30),
                      Text(
                        'How should this performance\nbe evaluated?',
                        style: AuratioTypography.headingMedium.copyWith(
                          color: AuratioColors.textPrimary,
                          fontSize: 24,
                          height: 32 / 24,
                          fontWeight: FontWeight.w700,
                          letterSpacing: -0.3,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Both methods use Auratio’s same 100-point scoring architecture.',
                        style: AuratioTypography.bodyMedium.copyWith(
                          color: AuratioColors.textSecondary,
                          fontSize: 14,
                          height: 20 / 14,
                          fontWeight: FontWeight.w400,
                        ),
                      ),
                      const SizedBox(height: 24),
                      _EvaluationMethodCard(
                        key: ChooseEvaluationMethodScreen.aiCardKey,
                        radioKey: ChooseEvaluationMethodScreen.aiRadioKey,
                        category: 'AI EVALUATION',
                        categoryColor: AuratioColors.brandBlue700,
                        title: 'Fast structured evaluation',
                        description: 'Server-side AI evaluator scores the selected track rubric and provides timestamped evidence.',
                        isSelected: isAi,
                        onTap: submission.isBusy
                            ? null
                            : () {
                                ref
                                    .read(
                                      evaluationMethodSelectionProvider
                                          .notifier,
                                    )
                                    .select(EvaluationMethod.ai);
                              },
                      ),
                      const SizedBox(height: 18),
                      _EvaluationMethodCard(
                        key: ChooseEvaluationMethodScreen.humanCardKey,
                        radioKey: ChooseEvaluationMethodScreen.humanRadioKey,
                        category: 'HUMAN EVALUATION',
                        categoryColor: AuratioColors.neutral500,
                        title: 'Evaluator-led review',
                        description: 'A Human Evaluator applies the same scoring architecture with required timestamped evidence.',
                        isSelected: isHuman,
                        onTap: submission.isBusy
                            ? null
                            : () {
                                ref
                                    .read(
                                      evaluationMethodSelectionProvider
                                          .notifier,
                                    )
                                    .select(EvaluationMethod.human);
                              },
                      ),
                      const SizedBox(height: 24),
                      SizedBox(
                        key: ChooseEvaluationMethodScreen.consentCardKey,
                        width: double.infinity,
                        height: 94,
                        child: Container(
                          padding: const EdgeInsets.fromLTRB(14, 12, 14, 8),
                          decoration: BoxDecoration(
                            color: AuratioColors.surfaceBrandSoft,
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                repositoryConfigured
                                    ? 'One persisted request at a time'
                                    : 'Redirects require your consent',
                                style: AuratioTypography.labelLarge.copyWith(
                                  color: AuratioColors.textPrimary,
                                  fontSize: 14,
                                  height: 20 / 14,
                                  fontWeight: FontWeight.w600,
                                  letterSpacing: 0.2,
                                ),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                repositoryConfigured
                                    ? 'Your selected method is submitted to Auratio exactly as chosen. A second active evaluation request is blocked by the server.'
                                    : 'If the requested method is unavailable, Auratio may propose the alternate method. Declining cancels the request.',
                                style: AuratioTypography.caption.copyWith(
                                  color: AuratioColors.textSecondary,
                                  fontSize: 11,
                                  height: 16 / 11,
                                  fontWeight: FontWeight.w500,
                                  letterSpacing: 0.2,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 18),
                      SizedBox(
                        height: 48,
                        width: double.infinity,
                        child: AuratioButton(
                          key: ChooseEvaluationMethodScreen.continueButtonKey,
                          label:
                              submission.phase ==
                                  RecordingSubmissionPhase.creatingRequest
                              ? 'Creating Request…'
                              : isAi
                              ? 'Continue with AI Evaluation'
                              : 'Continue with Human Evaluation',
                          variant: AuratioButtonVariant.primary,
                          expand: true,
                          onPressed: canCreateRequest
                              ? () => _continue(selectedMethod)
                              : null,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        repositoryConfigured
                            ? 'Continuing creates the persisted evaluation request. Status is read back from Supabase.'
                            : 'Evaluator choice affects routing. Processing / moderation / publication status happens later.',
                        key: ChooseEvaluationMethodScreen.footerNoteKey,
                        style: AuratioTypography.caption.copyWith(
                          color: AuratioColors.neutral500,
                          fontSize: 11,
                          height: 16 / 11,
                          fontWeight: FontWeight.w500,
                          letterSpacing: 0.2,
                        ),
                      ),
                      const SizedBox(height: 38),
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
}

class _EvaluationMethodCard extends StatelessWidget {
  const _EvaluationMethodCard({
    required this.category,
    required this.categoryColor,
    required this.title,
    required this.description,
    required this.isSelected,
    required this.onTap,
    this.radioKey,
    super.key,
  });

  final String category;
  final Color categoryColor;
  final String title;
  final String description;
  final bool isSelected;
  final VoidCallback? onTap;
  final Key? radioKey;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 154,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: isSelected
                ? AuratioColors.surfaceBrandSoft
                : AuratioColors.surfaceDefault,
            border: Border.all(
              color: isSelected
                  ? AuratioColors.brandBlue500
                  : AuratioColors.borderDefault,
              width: isSelected ? 2 : 1,
            ),
            borderRadius: BorderRadius.circular(18),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Text(
                      category,
                      style: AuratioTypography.caption.copyWith(
                        color: categoryColor,
                        fontSize: 11,
                        height: 16 / 11,
                        fontWeight: FontWeight.w500,
                        letterSpacing: 0.2,
                      ),
                    ),
                  ),
                  _RadioIndicator(key: radioKey, isSelected: isSelected),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                title,
                style: AuratioTypography.titleMedium.copyWith(
                  color: AuratioColors.textPrimary,
                  fontSize: 18,
                  height: 26 / 18,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                description,
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
    );
  }
}

class _RadioIndicator extends StatelessWidget {
  const _RadioIndicator({required this.isSelected, super.key});

  final bool isSelected;

  @override
  Widget build(BuildContext context) {
    if (isSelected) {
      return Container(
        width: 22,
        height: 22,
        decoration: const BoxDecoration(
          color: AuratioColors.backgroundBrand,
          shape: BoxShape.circle,
        ),
        child: Center(
          child: Container(
            width: 8,
            height: 8,
            decoration: const BoxDecoration(
              color: AuratioColors.neutralWhite,
              shape: BoxShape.circle,
            ),
          ),
        ),
      );
    }

    return Container(
      width: 22,
      height: 22,
      decoration: BoxDecoration(
        color: AuratioColors.surfaceDefault,
        shape: BoxShape.circle,
        border: Border.all(color: AuratioColors.neutral300, width: 1),
      ),
    );
  }
}
