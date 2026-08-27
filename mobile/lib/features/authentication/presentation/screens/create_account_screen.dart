import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router/app_route_paths.dart';
import '../../../../foundation/design_system/auratio_design_system.dart';
import '../../application/mock_registration_state.dart';
import '../widgets/authentication_widgets.dart';

class CreateAccountScreen extends ConsumerStatefulWidget {
  const CreateAccountScreen({super.key});

  static const screenKey = Key('authentication-create-account');
  static const fullNameFieldKey = Key('create-account-full-name-field');
  static const emailFieldKey = Key('create-account-email-field');
  static const passwordFieldKey = Key('create-account-password-field');
  static const confirmPasswordFieldKey = Key(
    'create-account-confirm-password-field',
  );
  static const submitActionKey = Key('create-account-submit');
  static const signInActionKey = Key('create-account-sign-in');
  static const pathsCardKey = Key('create-account-paths-card');

  @override
  ConsumerState<CreateAccountScreen> createState() =>
      _CreateAccountScreenState();
}

class _CreateAccountScreenState extends ConsumerState<CreateAccountScreen> {
  final _formKey = GlobalKey<FormState>();
  final _fullNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _reserveConfirmationErrorSpace = false;

  @override
  void dispose() {
    _fullNameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  String? _requiredValue(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'This field is required.';
    }
    return null;
  }

  String? _validateEmail(String? value) {
    final requiredError = _requiredValue(value);
    if (requiredError != null) {
      return requiredError;
    }
    final email = value!.trim();
    if (!email.contains('@') ||
        !email.substring(email.indexOf('@') + 1).contains('.')) {
      return 'Enter a valid email address.';
    }
    return null;
  }

  String? _validatePassword(String? value) {
    final requiredError = _requiredValue(value);
    if (requiredError != null) {
      return requiredError;
    }
    if (value!.length < 8) {
      return 'Use at least 8 characters.';
    }
    return null;
  }

  String? _validateConfirmation(String? value) {
    final requiredError = _requiredValue(value);
    if (requiredError != null) {
      return requiredError;
    }
    if (value != _passwordController.text) {
      return 'Passwords must match.';
    }
    return null;
  }

  void _createAccount() {
    final isValid = _formKey.currentState?.validate() ?? false;
    final needsConfirmationErrorSpace =
        _validateConfirmation(_confirmPasswordController.text) != null;
    if (_reserveConfirmationErrorSpace != needsConfirmationErrorSpace) {
      setState(() {
        _reserveConfirmationErrorSpace = needsConfirmationErrorSpace;
      });
    }

    if (!isValid) {
      return;
    }

    ref
        .read(mockRegistrationProvider.notifier)
        .capture(
          fullName: _fullNameController.text,
          email: _emailController.text,
          password: _passwordController.text,
        );
    context.go(AppRoutePaths.verifyEmail);
  }

  @override
  Widget build(BuildContext context) {
    final postFormOffset = _reserveConfirmationErrorSpace ? 20.0 : 0.0;

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: authenticationLightOverlayStyle,
      child: Scaffold(
        backgroundColor: AuratioColors.backgroundApp,
        resizeToAvoidBottomInset: true,
        body: AuthenticationSafeCanvas(
          child: KeyedSubtree(
            key: CreateAccountScreen.screenKey,
            child: Form(
              key: _formKey,
              child: Stack(
                children: [
                  const Positioned(
                    left: 0,
                    right: 0,
                    top: 0,
                    height: 160,
                    child: ColoredBox(color: AuratioColors.backgroundBrand),
                  ),
                  Positioned(
                    left: 24,
                    top: 58,
                    child: Text(
                      'Create your account',
                      style: AuratioTypography.headingMedium.copyWith(
                        color: AuratioColors.textOnBrand,
                        fontSize: 26,
                        height: 34 / 26,
                      ),
                    ),
                  ),
                  Positioned(
                    left: 24,
                    top: 96,
                    width: 342,
                    child: Text(
                      'Start building your communication performance.',
                      style: AuratioTypography.bodySmall.copyWith(
                        color: AuratioColors.brandBlue200,
                        fontSize: 13,
                        height: 20 / 13,
                      ),
                    ),
                  ),
                  Positioned(
                    left: 24,
                    top: 188,
                    width: 342,
                    child: AuratioInput(
                      key: CreateAccountScreen.fullNameFieldKey,
                      label: 'FULL NAME',
                      controller: _fullNameController,
                      placeholder: 'Alex Morgan',
                      keyboardType: TextInputType.name,
                      textInputAction: TextInputAction.next,
                      validator: _requiredValue,
                      scrollPadding: const EdgeInsets.only(bottom: 32),
                      controlHeight: 52,
                      labelGap: 8,
                      labelStyle: AuratioTypography.caption.copyWith(
                        color: AuratioColors.textTertiary,
                      ),
                    ),
                  ),
                  Positioned(
                    left: 24,
                    top: 292,
                    width: 342,
                    child: AuratioInput(
                      key: CreateAccountScreen.emailFieldKey,
                      label: 'EMAIL ADDRESS',
                      controller: _emailController,
                      placeholder: 'alex@example.com',
                      keyboardType: TextInputType.emailAddress,
                      textInputAction: TextInputAction.next,
                      validator: _validateEmail,
                      scrollPadding: const EdgeInsets.only(bottom: 32),
                      controlHeight: 52,
                      labelGap: 8,
                      labelStyle: AuratioTypography.caption.copyWith(
                        color: AuratioColors.textTertiary,
                      ),
                    ),
                  ),
                  Positioned(
                    left: 24,
                    top: 396,
                    width: 342,
                    child: AuratioInput(
                      key: CreateAccountScreen.passwordFieldKey,
                      label: 'PASSWORD',
                      controller: _passwordController,
                      placeholder: 'At least 8 characters',
                      obscureText: true,
                      textInputAction: TextInputAction.next,
                      validator: _validatePassword,
                      scrollPadding: const EdgeInsets.only(bottom: 32),
                      controlHeight: 52,
                      labelGap: 8,
                      labelStyle: AuratioTypography.caption.copyWith(
                        color: AuratioColors.textTertiary,
                      ),
                    ),
                  ),
                  Positioned(
                    left: 24,
                    top: 500,
                    width: 342,
                    child: AuratioInput(
                      key: CreateAccountScreen.confirmPasswordFieldKey,
                      label: 'CONFIRM PASSWORD',
                      controller: _confirmPasswordController,
                      placeholder: 'Repeat your password',
                      obscureText: true,
                      textInputAction: TextInputAction.done,
                      validator: _validateConfirmation,
                      scrollPadding: const EdgeInsets.only(bottom: 32),
                      controlHeight: 52,
                      labelGap: 8,
                      labelStyle: AuratioTypography.caption.copyWith(
                        color: AuratioColors.textTertiary,
                      ),
                    ),
                  ),
                  Positioned(
                    left: 24,
                    top: 586 + postFormOffset,
                    width: 342,
                    child: Text(
                      'We’ll send a verification email before the account can be used.',
                      style: AuratioTypography.caption.copyWith(
                        color: AuratioColors.textTertiary,
                      ),
                    ),
                  ),
                  Positioned(
                    left: 24,
                    top: 628 + postFormOffset,
                    width: 342,
                    child: AuratioButton(
                      key: CreateAccountScreen.submitActionKey,
                      label: 'Create Account',
                      expand: true,
                      onPressed: _createAccount,
                    ),
                  ),
                  Positioned(
                    left: 24,
                    top: 682 + postFormOffset,
                    width: 342,
                    height: AuratioSizing.minimumTouchTarget,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          'Already have an account?',
                          style: AuratioTypography.bodySmall.copyWith(
                            color: AuratioColors.textSecondary,
                          ),
                        ),
                        const SizedBox(width: 10),
                        SizedBox(
                          width: 58,
                          child: AuthenticationInlineAction(
                            key: CreateAccountScreen.signInActionKey,
                            label: 'Sign in',
                            onPressed: () => context.go(AppRoutePaths.signIn),
                            alignment: Alignment.centerLeft,
                            style: AuratioTypography.bodySmall.copyWith(
                              color: AuratioColors.backgroundBrand,
                              fontSize: 12,
                              height: 18 / 12,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  Positioned(
                    left: 24,
                    top: 738 + postFormOffset,
                    width: 342,
                    height: 76,
                    child: const _PathsCard(
                      key: CreateAccountScreen.pathsCardKey,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _PathsCard extends StatelessWidget {
  const _PathsCard({super.key});

  @override
  Widget build(BuildContext context) {
    return AuratioCard(
      tone: AuratioCardTone.brandSoft,
      padding: EdgeInsets.zero,
      child: Stack(
        children: [
          Positioned(
            left: 16,
            top: 12,
            right: 16,
            child: Text(
              'One account, multiple paths',
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: AuratioTypography.labelLarge.copyWith(
                color: AuratioColors.backgroundBrand,
                fontSize: 13,
                height: 19 / 13,
              ),
            ),
          ),
          Positioned(
            left: 16,
            top: 36,
            right: 16,
            child: Text(
              'Choose one or more Auratio paths during onboarding.',
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
