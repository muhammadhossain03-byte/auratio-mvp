import 'package:auratio_mobile/app/router/app_route_paths.dart';
import 'package:auratio_mobile/features/authentication/application/mobile_auth_routing.dart';
import 'package:auratio_mobile/features/authentication/data/auth_repository.dart';
import 'package:auratio_mobile/features/authentication/domain/auth_profile.dart';
import 'package:flutter_test/flutter_test.dart';

class _FakeAuthRepository implements AuratioAuthRepository {
  _FakeAuthRepository({required this.isConfigured, this.session});

  @override
  final bool isConfigured;

  AuratioAuthSession? session;
  bool signedOut = false;

  @override
  Future<AuratioAuthSession?> currentSession() async => session;

  @override
  Future<void> signOut() async {
    signedOut = true;
    session = null;
  }

  @override
  Future<AuratioAuthSession> signIn({
    required String email,
    required String password,
  }) {
    throw UnimplementedError();
  }

  @override
  Future<AuratioSignUpResult> signUp({
    required String displayName,
    required String email,
    required String password,
  }) {
    throw UnimplementedError();
  }

  @override
  Future<void> resendSignUpVerification({required String email}) {
    throw UnimplementedError();
  }
}

AuratioAuthSession _sessionFor(AuratioAppRole role) {
  return AuratioAuthSession(
    userId: '00000000-0000-4000-8000-000000000801',
    email: 'route-test@example.invalid',
    profile: AuratioAuthProfile(
      userId: '00000000-0000-4000-8000-000000000801',
      displayName: 'Route Test',
      role: role,
      accountStatus: AuratioAccountStatus.active,
      isRootSuperAdmin: false,
    ),
  );
}

void main() {
  test('prototype/unconfigured builds preserve synchronous route behavior', () {
    final repository = _FakeAuthRepository(isConfigured: false);

    final result = mobileAuthRedirect(repository, AppRoutePaths.home);

    expect(result, isNull);
    expect(result, isNot(isA<Future<String?>>()));
  });

  test(
    'public authentication routes do not require an async session lookup',
    () {
      final repository = _FakeAuthRepository(isConfigured: true);

      final signInResult = mobileAuthRedirect(repository, AppRoutePaths.signIn);
      final verifyResult = mobileAuthRedirect(
        repository,
        AppRoutePaths.verifyEmail,
      );

      expect(signInResult, isNull);
      expect(verifyResult, isNull);
      expect(signInResult, isNot(isA<Future<String?>>()));
      expect(verifyResult, isNot(isA<Future<String?>>()));
    },
  );

  test(
    'configured protected route redirects when no End User session exists',
    () async {
      final repository = _FakeAuthRepository(isConfigured: true);

      expect(
        await mobileAuthRedirect(repository, AppRoutePaths.home),
        AppRoutePaths.signIn,
      );
    },
  );

  test('active End User session may enter protected mobile routes', () async {
    final repository = _FakeAuthRepository(
      isConfigured: true,
      session: _sessionFor(AuratioAppRole.endUser),
    );

    expect(await mobileAuthRedirect(repository, AppRoutePaths.home), isNull);
    expect(repository.signedOut, isFalse);
  });

  test('portal staff cannot use protected End User mobile routes', () async {
    final repository = _FakeAuthRepository(
      isConfigured: true,
      session: _sessionFor(AuratioAppRole.volunteer),
    );

    expect(
      await mobileAuthRedirect(repository, AppRoutePaths.home),
      AppRoutePaths.signIn,
    );
    expect(repository.signedOut, isTrue);
  });
}
