import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router/app_route_paths.dart';
import '../../../../foundation/design_system/auratio_design_system.dart';
import '../../../shared/presentation/widgets/auratio_brand_lockup.dart';
import '../widgets/authentication_widgets.dart';

enum SignInFlow { returning, newAccount }

class SignInScreen extends StatefulWidget {
  const SignInScreen({this.flow = SignInFlow.returning, super.key});

  const SignInScreen.newAccount({super.key}) : flow = SignInFlow.newAccount;

  static const returningScreenKey = Key('authentication-sign-in-returning');
  static const newAccountScreenKey = Key('authentication-sign-in-new-account');
  static const emailFieldKey = Key('sign-in-email-field');
  static const passwordFieldKey = Key('sign-in-password-field');
  static const forgotPasswordActionKey = Key('sign-in-forgot-password');
  static const signInActionKey = Key('sign-in-submit');
  static const createAccountActionKey = Key('sign-in-create-account');
  static const trustCardKey = Key('sign-in-trust-card');

  final SignInFlow flow;

  @override
  State<SignInScreen> createState() => _SignInScreenState();
}

class _SignInScreenState extends State<SignInScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _handleSignIn() {
    if (widget.flow == SignInFlow.newAccount) {
      context.go(AppRoutePaths.onboardingIntro);
      return;
    }

    // The returning-user destination belongs to a later mobile screen batch.
  }

  void _handleForgotPassword() {
    context.go(AppRoutePaths.forgotPassword);
  }

  @override
  Widget build(BuildContext context) {
    final screenKey = widget.flow == SignInFlow.newAccount
        ? SignInScreen.newAccountScreenKey
        : SignInScreen.returningScreenKey;

    return AnnotatedRegion(
      value: authenticationSignInOverlayStyle,
      child: Scaffold(
        backgroundColor: AuratioColors.backgroundBrand,
        resizeToAvoidBottomInset: true,
        body: Stack(
          children: [
            const Positioned.fill(
              child: ColoredBox(color: AuratioColors.backgroundBrand),
            ),
            const Positioned(
              left: 0,
              right: 0,
              top: 250,
              bottom: 0,
              child: DecoratedBox(
                decoration: BoxDecoration(
                  color: AuratioColors.surfaceDefault,
                  borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
                ),
              ),
            ),
            AuthenticationSafeCanvas(
              child: KeyedSubtree(
                key: screenKey,
                child: Stack(
                  children: [
                    const Positioned(
                      left: 44,
                      top: 48,
                      child: AuratioBrandLockup(width: 302),
                    ),
                    Positioned(
                      left: 28,
                      top: 168,
                      width: 286,
                      child: Text(
                        'Structured communication evaluation, progress, and recognition.',
                        style: AuratioTypography.bodySmall.copyWith(
                          color: AuratioColors.brandBlue200,
                        ),
                      ),
                    ),
                    Positioned(
                      left: 24,
                      top: 282,
                      child: Text(
                        'Welcome back',
                        style: AuratioTypography.headingMedium.copyWith(
                          color: AuratioColors.textPrimary,
                        ),
                      ),
                    ),
                    Positioned(
                      left: 24,
                      top: 318,
                      width: 330,
                      child: Text(
                        'Sign in to continue your Auratio journey.',
                        style: AuratioTypography.bodyMedium.copyWith(
                          color: AuratioColors.textSecondary,
                        ),
                      ),
                    ),
                    Positioned(
                      left: 24,
                      top: 368,
                      width: 320,
                      child: AuratioInput(
                        key: SignInScreen.emailFieldKey,
                        label: 'Email address',
                        controller: _emailController,
                        placeholder: 'name@example.com',
                        keyboardType: TextInputType.emailAddress,
                        textInputAction: TextInputAction.next,
                        scrollPadding: const EdgeInsets.only(bottom: 32),
                      ),
                    ),
                    Positioned(
                      left: 24,
                      top: 472,
                      width: 320,
                      child: AuratioInput(
                        key: SignInScreen.passwordFieldKey,
                        label: 'Password',
                        controller: _passwordController,
                        placeholder: '••••••••',
                        obscureText: true,
                        textInputAction: TextInputAction.done,
                        scrollPadding: const EdgeInsets.only(bottom: 32),
                      ),
                    ),
                    Positioned(
                      right: 37,
                      top: 554,
                      width: 120,
                      height: AuratioSizing.minimumTouchTarget,
                      child: AuthenticationInlineAction(
                        key: SignInScreen.forgotPasswordActionKey,
                        label: 'Forgot password?',
                        onPressed: _handleForgotPassword,
                        alignment: Alignment.centerRight,
                        style: AuratioTypography.labelMedium.copyWith(
                          color: AuratioColors.textLink,
                        ),
                      ),
                    ),
                    Positioned(
                      left: 24,
                      top: 604,
                      width: 342,
                      child: AuratioButton(
                        key: SignInScreen.signInActionKey,
                        label: 'Sign In',
                        expand: true,
                        onPressed: _handleSignIn,
                      ),
                    ),
                    Positioned(
                      left: 90,
                      top: 661,
                      height: AuratioSizing.minimumTouchTarget,
                      child: Row(
                        children: [
                          Text(
                            'New to Auratio?',
                            style: AuratioTypography.bodySmall.copyWith(
                              color: AuratioColors.textSecondary,
                            ),
                          ),
                          const SizedBox(width: 13),
                          SizedBox(
                            width: 92,
                            child: AuthenticationInlineAction(
                              key: SignInScreen.createAccountActionKey,
                              label: 'Create account',
                              onPressed: () =>
                                  context.go(AppRoutePaths.createAccount),
                              alignment: Alignment.centerLeft,
                              style: AuratioTypography.labelMedium.copyWith(
                                color: AuratioColors.textLink,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const Positioned(
                      left: 24,
                      top: 736,
                      width: 342,
                      height: 72,
                      child: _TrustCard(key: SignInScreen.trustCardKey),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _TrustCard extends StatelessWidget {
  const _TrustCard({super.key});

  @override
  Widget build(BuildContext context) {
    return AuratioCard(
      tone: AuratioCardTone.brandSoft,
      borderColor: Colors.transparent,
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Your performance stays yours',
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: AuratioTypography.labelLarge.copyWith(
              color: AuratioColors.textPrimary,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'Temporary video is deleted after the final publication decision.',
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: AuratioTypography.caption.copyWith(
              color: AuratioColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}
