import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final mockRegistrationProvider =
    NotifierProvider<MockRegistrationNotifier, MockRegistrationState>(
      MockRegistrationNotifier.new,
    );

@immutable
class MockRegistrationState {
  const MockRegistrationState({
    this.fullName = '',
    this.email = directRouteEmail,
    this.password = '',
    this.resendCount = 0,
  });

  static const directRouteEmail = 'alex@example.com';

  final String fullName;
  final String email;
  final String password;
  final int resendCount;

  MockRegistrationState copyWith({
    String? fullName,
    String? email,
    String? password,
    int? resendCount,
  }) {
    return MockRegistrationState(
      fullName: fullName ?? this.fullName,
      email: email ?? this.email,
      password: password ?? this.password,
      resendCount: resendCount ?? this.resendCount,
    );
  }
}

class MockRegistrationNotifier extends Notifier<MockRegistrationState> {
  @override
  MockRegistrationState build() => const MockRegistrationState();

  void capture({
    required String fullName,
    required String email,
    required String password,
  }) {
    state = MockRegistrationState(
      fullName: fullName.trim(),
      email: email.trim(),
      password: password,
    );
  }

  void resendVerificationEmail() {
    state = state.copyWith(resendCount: state.resendCount + 1);
  }
}
