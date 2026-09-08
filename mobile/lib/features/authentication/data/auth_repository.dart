import 'package:supabase_flutter/supabase_flutter.dart';

import '../domain/auth_profile.dart';

class AuratioAuthenticationException implements Exception {
  const AuratioAuthenticationException(this.code, this.message);

  final String code;
  final String message;

  @override
  String toString() => 'AuratioAuthenticationException($code): $message';
}

class AuratioAuthSession {
  const AuratioAuthSession({
    required this.userId,
    required this.email,
    required this.profile,
  });

  final String userId;
  final String email;
  final AuratioAuthProfile profile;
}

class AuratioSignUpResult {
  const AuratioSignUpResult({
    required this.userId,
    required this.email,
    required this.emailConfirmationRequired,
  });

  final String? userId;
  final String email;
  final bool emailConfirmationRequired;
}

abstract interface class AuratioAuthRepository {
  bool get isConfigured;

  Future<AuratioAuthSession> signIn({
    required String email,
    required String password,
  });

  Future<AuratioSignUpResult> signUp({
    required String displayName,
    required String email,
    required String password,
  });

  Future<void> resendSignUpVerification({required String email});

  Future<void> requestPasswordReset({
    required String email,
    String? redirectTo,
  });

  Future<void> updatePassword({required String newPassword});

  Stream<void> authChanges();

  Future<AuratioAuthSession?> currentSession();

  Future<void> signOut();
}

class SupabaseAuratioAuthRepository implements AuratioAuthRepository {
  const SupabaseAuratioAuthRepository(this._client);

  final SupabaseClient _client;

  @override
  bool get isConfigured => true;

  @override
  Future<AuratioAuthSession> signIn({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _client.auth.signInWithPassword(
        email: email.trim(),
        password: password,
      );
      final user = response.user;
      if (user == null) {
        throw const AuratioAuthenticationException(
          'sign_in_failed',
          'Email or password was not accepted.',
        );
      }

      final profile = await _loadProfile(user.id);
      await _enforceMobileEndUser(profile);
      return AuratioAuthSession(
        userId: user.id,
        email: user.email ?? email.trim(),
        profile: profile,
      );
    } on AuratioAuthenticationException {
      rethrow;
    } on AuthException {
      throw const AuratioAuthenticationException(
        'sign_in_failed',
        'Email or password was not accepted.',
      );
    }
  }

  @override
  Future<AuratioSignUpResult> signUp({
    required String displayName,
    required String email,
    required String password,
  }) async {
    try {
      final response = await _client.auth.signUp(
        email: email.trim(),
        password: password,
        data: {'display_name': displayName.trim()},
      );
      return AuratioSignUpResult(
        userId: response.user?.id,
        email: response.user?.email ?? email.trim(),
        emailConfirmationRequired: response.session == null,
      );
    } on AuthException catch (error) {
      throw AuratioAuthenticationException('sign_up_failed', error.message);
    }
  }

  @override
  Future<void> resendSignUpVerification({required String email}) async {
    try {
      await _client.auth.resend(type: OtpType.signup, email: email.trim());
    } on AuthException catch (error) {
      throw AuratioAuthenticationException(
        'verification_resend_failed',
        error.message,
      );
    }
  }

  @override
  Future<void> requestPasswordReset({
    required String email,
    String? redirectTo,
  }) async {
    final normalizedEmail = email.trim();
    if (normalizedEmail.isEmpty) {
      throw const AuratioAuthenticationException(
        'password_reset_email_invalid',
        'Enter your email address.',
      );
    }

    try {
      await _client.auth.resetPasswordForEmail(
        normalizedEmail,
        redirectTo: redirectTo,
      );
    } on AuthException catch (error) {
      throw AuratioAuthenticationException(
        'password_reset_request_failed',
        error.message,
      );
    }
  }

  @override
  Future<void> updatePassword({required String newPassword}) async {
    if (newPassword.length < 8) {
      throw const AuratioAuthenticationException(
        'password_reset_password_invalid',
        'Use at least 8 characters.',
      );
    }

    try {
      await _client.auth.updateUser(UserAttributes(password: newPassword));
    } on AuthException catch (error) {
      throw AuratioAuthenticationException(
        'password_reset_update_failed',
        error.message,
      );
    }
  }

  @override
  Stream<void> authChanges() {
    return _client.auth.onAuthStateChange.map((_) {});
  }

  @override
  Future<AuratioAuthSession?> currentSession() async {
    final user = _client.auth.currentUser;
    if (user == null) return null;

    final profile = await _loadProfile(user.id);
    await _enforceMobileEndUser(profile);
    return AuratioAuthSession(
      userId: user.id,
      email: user.email ?? '',
      profile: profile,
    );
  }

  @override
  Future<void> signOut() async {
    try {
      await _client.auth.signOut();
    } on AuthException catch (error) {
      throw AuratioAuthenticationException('sign_out_failed', error.message);
    }
  }

  Future<void> _enforceMobileEndUser(AuratioAuthProfile profile) async {
    if (profile.isActiveEndUser) return;

    await _client.auth.signOut();
    throw const AuratioAuthenticationException(
      'mobile_access_denied',
      'This account cannot access the Auratio mobile app.',
    );
  }

  Future<AuratioAuthProfile> _loadProfile(String userId) async {
    try {
      final data = await _client
          .from('profiles')
          .select(
            'user_id,display_name,role,account_status,is_root_super_admin',
          )
          .eq('user_id', userId)
          .maybeSingle();

      if (data == null) {
        throw const AuratioAuthenticationException(
          'profile_missing',
          'Auratio profile is not available for this account.',
        );
      }

      return AuratioAuthProfile.fromJson(data);
    } on AuratioAuthenticationException {
      rethrow;
    } on PostgrestException {
      throw const AuratioAuthenticationException(
        'profile_load_failed',
        'Unable to load the Auratio profile.',
      );
    } on FormatException {
      throw const AuratioAuthenticationException(
        'profile_invalid',
        'The Auratio profile is invalid.',
      );
    }
  }
}

class UnconfiguredAuratioAuthRepository implements AuratioAuthRepository {
  const UnconfiguredAuratioAuthRepository();

  static const _error = AuratioAuthenticationException(
    'integration_not_configured',
    'Auratio Supabase configuration is missing for this build.',
  );

  @override
  bool get isConfigured => false;

  @override
  Stream<void> authChanges() => const Stream<void>.empty();

  @override
  Future<AuratioAuthSession?> currentSession() async => null;

  @override
  Future<void> requestPasswordReset({
    required String email,
    String? redirectTo,
  }) async {
    throw _error;
  }

  @override
  Future<void> updatePassword({required String newPassword}) async {
    throw _error;
  }

  @override
  Future<void> signOut() async {}

  @override
  Future<void> resendSignUpVerification({required String email}) async {
    throw _error;
  }

  @override
  Future<AuratioAuthSession> signIn({
    required String email,
    required String password,
  }) async {
    throw _error;
  }

  @override
  Future<AuratioSignUpResult> signUp({
    required String displayName,
    required String email,
    required String password,
  }) async {
    throw _error;
  }
}
