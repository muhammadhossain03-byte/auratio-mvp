import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router/app_route_paths.dart';
import '../../../../foundation/design_system/auratio_design_system.dart';
import '../../../shared/presentation/widgets/auratio_screen_header.dart';

class CheckingRecordingScreen extends StatefulWidget {
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
  State<CheckingRecordingScreen> createState() =>
      _CheckingRecordingScreenState();
}

class _CheckingRecordingScreenState extends State<CheckingRecordingScreen> {
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    if (widget.autoTransition) {
      _timer = Timer(widget.transitionDelay, () {
        if (mounted) {
          context.go(AppRoutePaths.recordingAccepted);
        }
      });
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
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

                      // Central status treatment: Circle with refresh icon (y=226, w=80, h=80)
                      Container(
                        key: CheckingRecordingScreen.checkingIndicatorKey,
                        width: 80,
                        height: 80,
                        decoration: const BoxDecoration(
                          color: AuratioColors.surfaceBrandSoft,
                          shape: BoxShape.circle,
                        ),
                        child: const Center(
                          child: Text(
                            '↻',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              color: AuratioColors.actionAccentBackground,
                              fontSize: 34,
                              height: 40 / 34,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                      ),

                      const SizedBox(height: 24),

                      // Heading (y=330)
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

                      // Subtitle (y=378, w=290, h=38)
                      SizedBox(
                        width: 290,
                        child: Text(
                          'Uploading the recording and measuring duration on the server.',
                          textAlign: TextAlign.center,
                          style: AuratioTypography.bodySmall.copyWith(
                            color: AuratioColors.textSecondary,
                            fontSize: 13,
                            height: 19 / 13,
                          ),
                        ),
                      ),

                      const SizedBox(height: 28),

                      // Information card (y=444, w=350, h=112)
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
                                'Business Pitch / Sales Pitch',
                                style: AuratioTypography.labelLarge.copyWith(
                                  color: AuratioColors.textPrimary,
                                  fontSize: 14,
                                  height: 20 / 14,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              Text(
                                'Accepted duration: 2:30–5:30',
                                style: AuratioTypography.bodySmall.copyWith(
                                  color: AuratioColors.textSecondary,
                                  fontSize: 12,
                                  height: 18 / 12,
                                ),
                              ),
                              Text(
                                'Evaluation will not begin until this check passes.',
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

                      // Bottom control: Checking... (y=750, w=350, h=48)
                      SizedBox(
                        key: CheckingRecordingScreen.checkingButtonKey,
                        height: 48,
                        width: double.infinity,
                        child: Container(
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
                              style: AuratioTypography.labelLarge.copyWith(
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
