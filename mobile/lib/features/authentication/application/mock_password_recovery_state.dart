import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final mockPasswordRecoveryProvider =
    NotifierProvider<MockPasswordRecoveryNotifier, MockPasswordRecoveryState>(
      MockPasswordRecoveryNotifier.new,
    );

@immutable
class MockPasswordRecoveryState {
  const MockPasswordRecoveryState({
    this.email = directRouteEmail,
    this.resendCount = 0,
  });

  static const directRouteEmail = 'alex@example.com';

  final String email;
  final int resendCount;

  MockPasswordRecoveryState copyWith({String? email, int? resendCount}) {
    return MockPasswordRecoveryState(
      email: email ?? this.email,
      resendCount: resendCount ?? this.resendCount,
    );
  }
}

class MockPasswordRecoveryNotifier extends Notifier<MockPasswordRecoveryState> {
  @override
  MockPasswordRecoveryState build() => const MockPasswordRecoveryState();

  void captureEmail(String email) {
    state = MockPasswordRecoveryState(email: email.trim());
  }

  void resendResetEmail() {
    state = state.copyWith(resendCount: state.resendCount + 1);
  }
}
