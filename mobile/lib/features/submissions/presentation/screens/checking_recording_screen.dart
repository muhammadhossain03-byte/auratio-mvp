import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router/app_route_paths.dart';
import '../../../../foundation/design_system/auratio_design_system.dart';
import '../../../evaluations/application/evaluation_repository_provider.dart';
import '../../../shared/presentation/widgets/auratio_screen_header.dart';
import '../../../tracks/application/selected_track_provider.dart';
import '../../application/recording_submission_controller.dart';

class CheckingRecordingScreen extends ConsumerStatefulWidget {
  const CheckingRecordingScreen({
    this.autoTransition = true,
    this.transitionDelay = const Duration(milliseconds: 1200),
    super.key,
  });

  static const checkingRecordingScreenKey = Key(
    'mobile-checking-recording-screen',
  );
  static const checkingIndicatorKey = Key('checking-recording-indicator');
  static const checkingInfoCardKey = Key('checking-recording-info-card');
  static const checkingButtonKey = Key('checking-recording-button');

  final bool autoTransition;
  final Duration transitionDelay;

  static const _overlayStyle = SystemUiOverlayStyle(
    statusBarColor: AuratioColors.backgroundBrand,
    statusBarIconBrightness: Brightness.light,
    statusBarBrightness: Brightness.dark,
    systemNavigationBarColor: AuratioColors.backgroundApp,
    systemNavigationBarIconBrightness: Brightness.dark,
  );

  @override
  ConsumerState<CheckingRecordingScreen> createState() =>
      _CheckingRecordingScreenState();
}

class _CheckingRecordingScreenState
    extends ConsumerState<CheckingRecordingScreen> {
  Timer? _prototypeTimer;
  bool _uploadStarted = false;

  @override
  void initState() {
    super.initState();

    final configured = ref
        .read(auratioEvaluationRepositoryProvider)
        .isConfigured;
    if (!configured) {
      if (widget.autoTransition) {
        _prototypeTimer = Timer(widget.transitionDelay, () {
          if (mounted) {
            context.go(AppRoutePaths.recordingAccepted);
          }
        });
      }
      return;
    }

    if (ref.read(recordingSubmissionProvider).recording != null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _beginUpload();
      });
    }
  }

  Future<void> _beginUpload() async {
    if (_uploadStarted) return;
    _uploadStarted = true;

    final success = await ref
        .read(recordingSubmissionProvider.notifier)
        .uploadSelectedRecording();

    if (!mounted) return;
    if (success) {
      context.go(AppRoutePaths.recordingAccepted);
    } else {
      _uploadStarted = false;
    }
  }

  @override
  void dispose() {
    _prototypeTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final track = ref.watch(selectedTrackProvider);
    final submission = ref.watch(recordingSubmissionProvider);
    final configured = ref
        .watch(auratioEvaluationRepositoryProvider)
        .isConfigured;
    final hasRecording = submission.recording != null;
    final hasRetryableRecording =
        submission.recording?.bytes?.isNotEmpty ?? false;

    final statusText = configured && submission.errorMessage != null
        ? submission.errorMessage!
        : configured
        ? 'Uploading the recording to private storage and validating its measured duration.'
        : 'Uploading the recording and measuring duration on the server.';

    return AnnotatedRegion<SystemUiOverlayStyle>(
      key: CheckingRecordingScreen.checkingRecordingScreenKey,
      value: CheckingRecordingScreen._overlayStyle,
      child: Scaffold(
        backgroundColor: AuratioColors.backgroundApp,
        body: SafeArea(
          top: false,
          child: Column(
            children: [
              AuratioScreenHeader(
                title: 'Checking Recording',
                showBack: true,
                onBack: () => context.go(AppRoutePaths.uploadRecording),
              ),
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AuratioSpacing.xl,
                  ),
                  child: Column(
                    children: [
                      const SizedBox(height: 134),
                      Container(
                        key: CheckingRecordingScreen.checkingIndicatorKey,
                        width: 80,
                        height: 80,
                        decoration: const BoxDecoration(
                          color: AuratioColors.surfaceBrandSoft,
                          shape: BoxShape.circle,
                        ),
                        child: Center(
                          child: Text(
                            configured && submission.errorMessage != null
                                ? '!'
                                : '↻',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              color:
                                  configured && submission.errorMessage != null
                                  ? AuratioColors.statusRejectedForeground
                                  : AuratioColors.actionAccentBackground,
                              fontSize: 34,
                              height: 40 / 34,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),
                      Text(
                        'Checking eligibility',
                        textAlign: TextAlign.center,
                        style: AuratioTypography.headingMedium.copyWith(
                          color: AuratioColors.textPrimary,
                          fontSize: 25,
                          height: 32 / 25,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 16),
                      SizedBox(
                        width: 290,
                        child: Text(
                          statusText,
                          textAlign: TextAlign.center,
                          style: AuratioTypography.bodySmall.copyWith(
                            color: submission.errorMessage != null && configured
                                ? AuratioColors.statusRejectedForeground
                                : AuratioColors.textSecondary,
                            fontSize: 13,
                            height: 19 / 13,
                          ),
                        ),
                      ),
                      const SizedBox(height: 28),
                      SizedBox(
                        key: CheckingRecordingScreen.checkingInfoCardKey,
                        width: double.infinity,
                        height: 112,
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
                            borderRadius: BorderRadius.circular(
                              AuratioRadii.lg,
                            ),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                track.name,
                                style: AuratioTypography.labelLarge.copyWith(
                                  color: AuratioColors.textPrimary,
                                  fontSize: 14,
                                  height: 20 / 14,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              Text(
                                'Accepted duration: ${track.acceptedDuration}',
                                style: AuratioTypography.bodySmall.copyWith(
                                  color: AuratioColors.textSecondary,
                                  fontSize: 12,
                                  height: 18 / 12,
                                ),
                              ),
                              Text(
                                configured
                                    ? 'Evaluation will not begin until the persisted request is created.'
                                    : 'Evaluation will not begin until this check passes.',
                                style: AuratioTypography.bodySmall.copyWith(
                                  color: AuratioColors.textSecondary,
                                  fontSize: 12,
                                  height: 18 / 12,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 194),
                      SizedBox(
                        key: CheckingRecordingScreen.checkingButtonKey,
                        height: 48,
                        width: double.infinity,
                        child: configured && submission.errorMessage != null
                            ? AuratioButton(
                                label: hasRecording && hasRetryableRecording
                                    ? 'Retry Upload'
                                    : 'Choose Recording',
                                variant: AuratioButtonVariant.secondary,
                                expand: true,
                                onPressed: hasRecording && hasRetryableRecording
                                    ? _beginUpload
                                    : () => context.go(
                                        AppRoutePaths.uploadRecording,
                                      ),
                              )
                            : Container(
                                decoration: BoxDecoration(
                                  color: AuratioColors.surfaceDefault,
                                  border: Border.all(
                                    color: AuratioColors.borderStrong,
                                  ),
                                  borderRadius: BorderRadius.circular(
                                    AuratioRadii.md,
                                  ),
                                ),
                                child: Center(
                                  child: Text(
                                    'Checking…',
                                    style: AuratioTypography.labelLarge
                                        .copyWith(
                                          color: AuratioColors.backgroundBrand,
                                          fontSize: 14,
                                          height: 20 / 14,
                                          fontWeight: FontWeight.w600,
                                        ),
                                  ),
                                ),
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
}
