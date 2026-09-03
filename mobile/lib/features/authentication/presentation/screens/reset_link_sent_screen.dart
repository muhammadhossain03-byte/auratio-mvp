import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router/app_route_paths.dart';
import '../../../../foundation/design_system/auratio_design_system.dart';
import '../../../shared/presentation/widgets/auratio_screen_header.dart';
import '../../application/mock_password_recovery_state.dart';
import '../widgets/authentication_widgets.dart';

class ResetLinkSentScreen extends ConsumerStatefulWidget {
  const ResetLinkSentScreen({super.key});

  static const transitionDelay = Duration(milliseconds: 1800);

  static const screenKey = Key('authentication-reset-link-sent');
  static const emailCopyKey = Key('reset-link-sent-email-copy');
  static const guidanceCardKey = Key('reset-link-sent-guidance-card');
  static const resendActionKey = Key('reset-link-sent-resend');
  static const backToSignInActionKey = Key('reset-link-sent-back-to-sign-in');

  @override
  ConsumerState<ResetLinkSentScreen> createState() =>
      _ResetLinkSentScreenState();
}

class _ResetLinkSentScreenState extends ConsumerState<ResetLinkSentScreen> {
  Timer? _resetLinkTimer;

  @override
  void initState() {
    super.initState();
    _resetLinkTimer = Timer(ResetLinkSentScreen.transitionDelay, () {
      if (mounted) {
        context.push(AppRoutePaths.resetPassword);
      }
    });
  }

  @override
  void dispose() {
    _resetLinkTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final email = ref.watch(
      mockPasswordRecoveryProvider.select((recovery) => recovery.email),
    );

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: authenticationLightOverlayStyle,
      child: Scaffold(
        key: ResetLinkSentScreen.screenKey,
        backgroundColor: AuratioColors.backgroundApp,
        body: Stack(
          children: [
            Positioned(
              left: 0,
              right: 0,
              top: 0,
              child: AuratioScreenHeader(
                title: 'Check Your Email',
                showBack: true,
                onBack: () => context.go(AppRoutePaths.forgotPassword),
              ),
            ),
            const Positioned(
              left: 155,
              top: 150,
              child: AuthenticationStatusIcon.email(),
            ),
            Positioned(
              left: 20,
              top: 254,
              width: 350,
              child: Text(
                'Reset link sent',
                textAlign: TextAlign.center,
                style: AuratioTypography.headingMedium.copyWith(
                  color: AuratioColors.textPrimary,
                ),
              ),
            ),
            Positioned(
              key: ResetLinkSentScreen.emailCopyKey,
              left: 30,
              top: 304,
              width: 330,
              child: Text(
                'If an Auratio account exists for $email, a password-reset email has been sent.',
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
              top: 406,
              width: 350,
              height: 112,
              child: _ResetGuidanceCard(
                key: ResetLinkSentScreen.guidanceCardKey,
              ),
            ),
            Positioned(
              left: 20,
              top: 650,
              width: 350,
              child: AuratioButton(
                key: ResetLinkSentScreen.resendActionKey,
                label: 'Resend Reset Email',
                variant: AuratioButtonVariant.secondary,
                expand: true,
                onPressed: () => ref
                    .read(mockPasswordRecoveryProvider.notifier)
                    .resendResetEmail(),
              ),
            ),
            Positioned(
              left: 20,
              top: 712,
              width: 350,
              child: AuratioButton(
                key: ResetLinkSentScreen.backToSignInActionKey,
                label: 'Back to Sign In',
                expand: true,
                onPressed: () => context.go(AppRoutePaths.signIn),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ResetGuidanceCard extends StatelessWidget {
  const _ResetGuidanceCard({super.key});

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
            width: 300,
            child: Text(
              'Use the link from your email',
              style: AuratioTypography.labelLarge.copyWith(
                color: AuratioColors.backgroundBrand,
                fontSize: 13,
                height: 18 / 13,
              ),
            ),
          ),
          Positioned(
            left: 14,
            top: 44,
            width: 300,
            child: Text(
              'The reset link opens the password-update step. If you request another link, use the newest email.',
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
