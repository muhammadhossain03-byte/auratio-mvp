import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router/app_route_paths.dart';
import '../../../../foundation/design_system/auratio_design_system.dart';
import '../../../shared/presentation/widgets/auratio_screen_header.dart';
import '../widgets/authentication_widgets.dart';

class EmailVerifiedScreen extends StatelessWidget {
  const EmailVerifiedScreen({super.key});

  static const screenKey = Key('authentication-email-verified');
  static const nextStepCardKey = Key('email-verified-next-step-card');
  static const continueActionKey = Key('email-verified-continue');

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: authenticationLightOverlayStyle,
      child: Scaffold(
        key: EmailVerifiedScreen.screenKey,
        backgroundColor: AuratioColors.backgroundApp,
        body: Stack(
          children: [
            const Positioned(
              left: 0,
              right: 0,
              top: 0,
              child: AuratioScreenHeader(title: 'Email Verified'),
            ),
            const Positioned(
              left: 155,
              top: 176,
              child: AuthenticationStatusIcon.success(),
            ),
            Positioned(
              left: 20,
              top: 286,
              width: 350,
              child: Text(
                'Email verified',
                textAlign: TextAlign.center,
                style: AuratioTypography.headingMedium.copyWith(
                  color: AuratioColors.textPrimary,
                ),
              ),
            ),
            Positioned(
              left: 34,
              top: 334,
              width: 322,
              child: Text(
                'Your email address is confirmed. Your Auratio account is now eligible for use.',
                textAlign: TextAlign.center,
                style: AuratioTypography.bodyMedium.copyWith(
                  color: AuratioColors.textSecondary,
                  fontSize: 13,
                  height: 19 / 13,
                ),
              ),
            ),
            const Positioned(
              left: 20,
              top: 430,
              width: 350,
              height: 92,
              child: _NextStepCard(key: EmailVerifiedScreen.nextStepCardKey),
            ),
            Positioned(
              left: 20,
              top: 712,
              width: 350,
              child: AuratioButton(
                key: EmailVerifiedScreen.continueActionKey,
                label: 'Continue to Sign In',
                expand: true,
                onPressed: () => context.go(AppRoutePaths.signInNewAccount),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _NextStepCard extends StatelessWidget {
  const _NextStepCard({super.key});

  @override
  Widget build(BuildContext context) {
    return AuratioCard(
      tone: AuratioCardTone.brandSoft,
      padding: EdgeInsets.zero,
      child: Stack(
        children: [
          Positioned(
            left: 16,
            top: 16,
            right: 16,
            child: Text(
              'Next step',
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: AuratioTypography.labelLarge.copyWith(
                color: AuratioColors.backgroundBrand,
                fontSize: 13,
                height: 18 / 13,
              ),
            ),
          ),
          Positioned(
            left: 16,
            top: 44,
            right: 16,
            child: Text(
              'Sign in with your email and password to continue.',
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: AuratioTypography.bodySmall.copyWith(
                color: AuratioColors.textSecondary,
                fontSize: 12,
                height: 18 / 12,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
