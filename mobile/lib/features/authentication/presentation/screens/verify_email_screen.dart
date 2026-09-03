import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router/app_route_paths.dart';
import '../../../../foundation/design_system/auratio_design_system.dart';
import '../../../shared/presentation/widgets/auratio_screen_header.dart';
import '../../application/mock_registration_state.dart';
import '../widgets/authentication_widgets.dart';

class VerifyEmailScreen extends ConsumerStatefulWidget {
  const VerifyEmailScreen({super.key});

  static const transitionDelay = Duration(milliseconds: 1800);

  static const screenKey = Key('authentication-verify-email');
  static const emailCopyKey = Key('verify-email-address-copy');
  static const requirementCardKey = Key('verify-email-requirement-card');
  static const resendActionKey = Key('verify-email-resend');
  static const backToSignInActionKey = Key('verify-email-back-to-sign-in');

  @override
  ConsumerState<VerifyEmailScreen> createState() => _VerifyEmailScreenState();
}

class _VerifyEmailScreenState extends ConsumerState<VerifyEmailScreen> {
  Timer? _verificationTimer;

  @override
  void initState() {
    super.initState();
    _verificationTimer = Timer(VerifyEmailScreen.transitionDelay, () {
      if (mounted) {
        context.go(AppRoutePaths.emailVerified);
      }
    });
  }

  @override
  void dispose() {
    _verificationTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final email = ref.watch(
      mockRegistrationProvider.select((registration) => registration.email),
    );

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: authenticationLightOverlayStyle,
      child: Scaffold(
        key: VerifyEmailScreen.screenKey,
        backgroundColor: AuratioColors.backgroundApp,
        body: Stack(
          children: [
            Positioned(
              left: 0,
              right: 0,
              top: 0,
              child: AuratioScreenHeader(
                title: 'Verify Email',
                showBack: true,
                onBack: () => context.go(AppRoutePaths.createAccount),
              ),
            ),
            const Positioned(
              left: 155,
              top: 140,
              child: AuthenticationStatusIcon.email(),
            ),
            Positioned(
              left: 20,
              top: 246,
              width: 350,
              child: Text(
                'Check your inbox',
                style: AuratioTypography.headingMedium.copyWith(
                  color: AuratioColors.textPrimary,
                ),
              ),
            ),
            Positioned(
              key: VerifyEmailScreen.emailCopyKey,
              left: 20,
              top: 292,
              width: 350,
              child: Text(
                'We sent a verification link to $email.',
                style: AuratioTypography.bodyMedium.copyWith(
                  color: AuratioColors.textSecondary,
                  fontSize: 13,
                  height: 19 / 13,
                ),
              ),
            ),
            const Positioned(
              left: 20,
              top: 358,
              width: 350,
              height: 126,
              child: _VerificationRequirementCard(
                key: VerifyEmailScreen.requirementCardKey,
              ),
            ),
            Positioned(
              left: 20,
              top: 650,
              width: 350,
              child: AuratioButton(
                key: VerifyEmailScreen.resendActionKey,
                label: 'Resend Verification Email',
                variant: AuratioButtonVariant.secondary,
                expand: true,
                onPressed: () => ref
                    .read(mockRegistrationProvider.notifier)
                    .resendVerificationEmail(),
              ),
            ),
            Positioned(
              left: 20,
              top: 712,
              width: 350,
              child: AuratioButton(
                key: VerifyEmailScreen.backToSignInActionKey,
                label: 'Back to Sign In',
                expand: true,
                onPressed: () => context.go(AppRoutePaths.signIn),
              ),
            ),
            Positioned(
              left: 20,
              top: 776,
              width: 350,
              child: Text(
                'Use the newest verification email if you request another link.',
                textAlign: TextAlign.center,
                style: AuratioTypography.caption.copyWith(
                  color: AuratioColors.textTertiary,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _VerificationRequirementCard extends StatelessWidget {
  const _VerificationRequirementCard({super.key});

  @override
  Widget build(BuildContext context) {
    return AuratioCard(
      tone: AuratioCardTone.brandSoft,
      padding: EdgeInsets.zero,
      child: Stack(
        children: [
          Positioned(
            left: 14,
            top: 16,
            right: 14,
            child: Text(
              'Verification is required',
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: AuratioTypography.labelLarge.copyWith(
                color: AuratioColors.backgroundBrand,
                fontSize: 14,
                height: 20 / 14,
              ),
            ),
          ),
          Positioned(
            left: 14,
            top: 46,
            right: 14,
            child: Text(
              'Your Auratio account cannot be used until the email address is verified.',
              maxLines: 3,
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
