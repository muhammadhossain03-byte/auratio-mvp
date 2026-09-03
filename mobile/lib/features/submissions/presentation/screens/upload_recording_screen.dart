import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router/app_route_paths.dart';
import '../../../../foundation/design_system/auratio_design_system.dart';
import '../../../shared/presentation/widgets/auratio_screen_header.dart';
import '../../../tracks/application/selected_track_provider.dart';

class UploadRecordingScreen extends ConsumerWidget {
  const UploadRecordingScreen({super.key});

  static const uploadRecordingScreenKey = Key('mobile-upload-recording-screen');
  static const uploadZoneKey = Key('upload-recording-upload-zone');
  static const selectedFileCardKey = Key('upload-selected-file-card');
  static const uploadAndCheckButtonKey = Key('upload-and-check-button');

  static const _overlayStyle = SystemUiOverlayStyle(
    statusBarColor: AuratioColors.backgroundBrand,
    statusBarIconBrightness: Brightness.light,
    statusBarBrightness: Brightness.dark,
    systemNavigationBarColor: AuratioColors.backgroundApp,
    systemNavigationBarIconBrightness: Brightness.dark,
  );

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final track = ref.watch(selectedTrackProvider);

    return AnnotatedRegion<SystemUiOverlayStyle>(
      key: uploadRecordingScreenKey,
      value: _overlayStyle,
      child: Scaffold(
        backgroundColor: AuratioColors.backgroundApp,
        body: SafeArea(
          top: false,
          child: Column(
            children: [
              AuratioScreenHeader(
                title: 'Upload Recording',
                showBack: true,
                onBack: () => context.go(AppRoutePaths.submissionRequirements),
              ),
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AuratioSpacing.xl,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 20),

                      // Track card (y=112, w=350, h=94)
                      SizedBox(
                        width: double.infinity,
                        height: 94,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 20,
                            vertical: 16,
                          ),
                          decoration: BoxDecoration(
                            color: AuratioColors.surfaceBrandSoft,
                            border: Border.all(
                              color: AuratioColors.borderDefault,
                            ),
                            borderRadius: BorderRadius.circular(
                              AuratioRadii.lg,
                            ),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                track.name,
                                style: AuratioTypography.titleMedium.copyWith(
                                  color: AuratioColors.textPrimary,
                                  fontSize: 18,
                                  height: 26 / 18,
                                ),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                'Accepted upload window ${track.acceptedDuration}',
                                style: AuratioTypography.bodyMedium.copyWith(
                                  color: AuratioColors.textSecondary,
                                  fontSize: 14,
                                  height: 20 / 14,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(height: 22),

                      // Upload zone (y=228, w=350, h=220)
                      SizedBox(
                        key: uploadZoneKey,
                        width: double.infinity,
                        height: 220,
                        child: CustomPaint(
                          painter: const _DashedRoundedRectPainter(
                            color: AuratioColors.borderStrong,
                            strokeWidth: 1.0,
                            dashLength: 8.0,
                            gapLength: 6.0,
                            borderRadius: 20.0,
                          ),
                          child: Container(
                            decoration: BoxDecoration(
                              color: AuratioColors.surfaceDefault,
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Container(
                                  width: 72,
                                  height: 72,
                                  decoration: const BoxDecoration(
                                    color: AuratioColors.surfaceBrandSoft,
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Center(
                                    child: Icon(
                                      Icons.add,
                                      size: 32,
                                      color:
                                          AuratioColors.actionAccentBackground,
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 16),
                                Text(
                                  'Choose an .mp4 recording',
                                  textAlign: TextAlign.center,
                                  style: AuratioTypography.titleMedium.copyWith(
                                    color: AuratioColors.textPrimary,
                                    fontSize: 18,
                                    height: 26 / 18,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Padding(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 24,
                                  ),
                                  child: Text(
                                    'Speaker must remain visible throughout the performance.',
                                    textAlign: TextAlign.center,
                                    style: AuratioTypography.caption.copyWith(
                                      color: AuratioColors.textSecondary,
                                      fontSize: 11,
                                      height: 16 / 11,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),

                      const SizedBox(height: 20),

                      // Selected-file card (y=468, w=350, h=104)
                      SizedBox(
                        key: selectedFileCardKey,
                        width: double.infinity,
                        height: 104,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 20,
                            vertical: 14,
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
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                track.effectiveFileName,
                                style: AuratioTypography.titleMedium.copyWith(
                                  color: AuratioColors.textPrimary,
                                  fontSize: 18,
                                  height: 26 / 18,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                'Selected file • upload is not evaluated until eligibility passes.',
                                style: AuratioTypography.bodyMedium.copyWith(
                                  color: AuratioColors.textSecondary,
                                  fontSize: 13.5,
                                  height: 19 / 13.5,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(height: 20),

                      // Section label: BEFORE CONTINUING (y=592)
                      Text(
                        'BEFORE CONTINUING',
                        style: AuratioTypography.caption.copyWith(
                          color: AuratioColors.neutral500,
                          fontSize: 11,
                          height: 16 / 11,
                          fontWeight: FontWeight.w500,
                          letterSpacing: 0.2,
                        ),
                      ),

                      const SizedBox(height: 12),

                      // Check 1: .mp4 only (y=620)
                      _buildCheckRow('.mp4 only'),

                      const SizedBox(height: 12),

                      // Check 2: Speaker-visible recording (y=650)
                      _buildCheckRow('Speaker-visible recording'),

                      const SizedBox(height: 12),

                      // Check 3: Duration will be measured on the server (y=680)
                      _buildCheckRow('Duration will be measured on the server'),

                      const SizedBox(height: 36),

                      // Upload & Check CTA (y=734, h=48)
                      SizedBox(
                        height: 48,
                        width: double.infinity,
                        child: AuratioButton(
                          key: uploadAndCheckButtonKey,
                          label: 'Upload & Check',
                          variant: AuratioButtonVariant.primary,
                          expand: true,
                          onPressed: () =>
                              context.go(AppRoutePaths.checkingRecording),
                        ),
                      ),

                      const SizedBox(height: 10),

                      // Footer disclaimer (y=792)
                      Center(
                        child: Text(
                          'No AI evaluation or Human assignment starts before eligibility passes.',
                          textAlign: TextAlign.center,
                          style: AuratioTypography.caption.copyWith(
                            color: AuratioColors.neutral500,
                            fontSize: 11,
                            height: 16 / 11,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),

                      const SizedBox(height: 20),
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

  static Widget _buildCheckRow(String text) {
    return Row(
      children: [
        Container(
          width: 18,
          height: 18,
          decoration: const BoxDecoration(
            color: AuratioColors.actionAccentBackground,
            shape: BoxShape.circle,
          ),
          child: const Center(
            child: Text(
              '✓',
              style: TextStyle(
                color: AuratioColors.backgroundBrand,
                fontWeight: FontWeight.w700,
                fontSize: 11,
                height: 1.0,
              ),
            ),
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            text,
            style: AuratioTypography.bodySmall.copyWith(
              color: AuratioColors.textSecondary,
              fontSize: 12,
              height: 18 / 12,
            ),
          ),
        ),
      ],
    );
  }
}

class _DashedRoundedRectPainter extends CustomPainter {
  const _DashedRoundedRectPainter({
    required this.color,
    required this.strokeWidth,
    required this.dashLength,
    required this.gapLength,
    required this.borderRadius,
  });

  final Color color;
  final double strokeWidth;
  final double dashLength;
  final double gapLength;
  final double borderRadius;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = strokeWidth
      ..style = PaintingStyle.stroke;

    final rrect = RRect.fromRectAndRadius(
      Offset.zero & size,
      Radius.circular(borderRadius),
    );

    final path = Path()..addRRect(rrect);
    final metrics = path.computeMetrics();

    for (final metric in metrics) {
      var distance = 0.0;
      while (distance < metric.length) {
        final nextDistance = distance + dashLength;
        final extractPath = metric.extractPath(
          distance,
          nextDistance > metric.length ? metric.length : nextDistance,
        );
        canvas.drawPath(extractPath, paint);
        distance = nextDistance + gapLength;
      }
    }
  }

  @override
  bool shouldRepaint(covariant _DashedRoundedRectPainter oldDelegate) {
    return oldDelegate.color != color ||
        oldDelegate.strokeWidth != strokeWidth ||
        oldDelegate.dashLength != dashLength ||
        oldDelegate.gapLength != gapLength ||
        oldDelegate.borderRadius != borderRadius;
  }
}
