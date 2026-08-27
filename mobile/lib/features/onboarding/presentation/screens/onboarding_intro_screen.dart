import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router/app_route_paths.dart';
import '../../../../foundation/design_system/auratio_design_system.dart';
import '../../../shared/presentation/widgets/auratio_brand_lockup.dart';
import '../../../shared/presentation/widgets/auratio_screen_header.dart';
import '../onboarding_keys.dart';

class OnboardingIntroScreen extends StatelessWidget {
  const OnboardingIntroScreen({super.key});

  static const _overlayStyle = SystemUiOverlayStyle(
    statusBarColor: AuratioColors.backgroundBrand,
    statusBarIconBrightness: Brightness.light,
    statusBarBrightness: Brightness.dark,
    systemNavigationBarColor: AuratioColors.backgroundApp,
    systemNavigationBarIconBrightness: Brightness.dark,
  );

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      key: OnboardingKeys.introScreen,
      value: _overlayStyle,
      child: Scaffold(
        backgroundColor: AuratioColors.backgroundApp,
        body: SafeArea(
          top: false,
          child: Column(
            children: [
              const AuratioScreenHeader(title: 'Welcome to Auratio'),
              Expanded(
                child: Stack(
                  children: [
                    Positioned(
                      left: AuratioSpacing.xl,
                      right: AuratioSpacing.xl,
                      top: 34,
                      child: Text(
                        'Build communication skill through practice.',
                        style: AuratioTypography.headingLarge.copyWith(
                          color: AuratioColors.textPrimary,
                          fontSize: 28,
                          height: 36 / 28,
                        ),
                      ),
                    ),
                    Positioned(
                      left: AuratioSpacing.xl,
                      right: AuratioSpacing.xl,
                      top: 118,
                      child: Text(
                        'Choose specialized tracks, submit speaker-visible '
                        'performances, and receive structured AI or Human '
                        'Evaluation.',
                        style: AuratioTypography.bodyMedium.copyWith(
                          color: AuratioColors.textSecondary,
                          height: 21 / 14,
                        ),
                      ),
                    ),
                    const Positioned(
                      left: AuratioSpacing.xl,
                      right: AuratioSpacing.xl,
                      top: 214,
                      height: 250,
                      child: _IntroBrandPanel(),
                    ),
                    Positioned(
                      left: AuratioSpacing.xl,
                      right: AuratioSpacing.xl,
                      bottom: 46,
                      child: AuratioButton(
                        key: OnboardingKeys.getStartedButton,
                        label: 'Get Started',
                        onPressed: () => context.go(AppRoutePaths.choosePaths),
                        expand: true,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _IntroBrandPanel extends StatelessWidget {
  const _IntroBrandPanel();

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: AuratioColors.backgroundBrand,
        border: Border.all(color: AuratioColors.borderDefault),
        borderRadius: BorderRadius.circular(24),
      ),
      child: Stack(
        children: [
          const Positioned(
            left: 45,
            right: 45,
            top: AuratioSpacing.xxxl,
            child: AuratioBrandLockup(width: 260),
          ),
          Positioned(
            left: 0,
            right: 0,
            top: 124,
            child: Text(
              'Practice  •  Evaluate  •  Improve',
              textAlign: TextAlign.center,
              style: AuratioTypography.labelLarge.copyWith(
                color: AuratioColors.textOnBrand,
                fontSize: 13,
                height: 20 / 13,
                letterSpacing: AuratioTypography.normalTracking,
              ),
            ),
          ),
          Positioned(
            left: 28,
            right: 28,
            top: 178,
            child: Text(
              'Your videos are temporary evaluation artifacts, not a '
              'permanent media library.',
              textAlign: TextAlign.center,
              style: AuratioTypography.bodySmall.copyWith(
                color: AuratioColors.brandBlue200,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
