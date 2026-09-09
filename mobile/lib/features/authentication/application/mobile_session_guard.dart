import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'auth_repository_provider.dart';
import '../data/auth_repository.dart';

enum MobileSessionGuardEvent { accessRevoked }

const mobileSessionGuardInterval = Duration(seconds: 60);

bool isTerminalMobileSessionError(AuratioAuthenticationException error) {
  return error.code != 'profile_load_failed';
}

final mobileSessionGuardProvider = StreamProvider<MobileSessionGuardEvent>((
  ref,
) {
  final repository = ref.watch(authRepositoryProvider);
  if (!repository.isConfigured) {
    return const Stream<MobileSessionGuardEvent>.empty();
  }

  final controller = StreamController<MobileSessionGuardEvent>();
  var disposed = false;
  var checking = false;
  var accessRevoked = false;

  Future<void> validateSession() async {
    if (disposed || checking) return;

    checking = true;
    try {
      final session = await repository.currentSession();
      if (disposed) return;

      if (session == null || !session.profile.isActiveEndUser) {
        if (!accessRevoked) {
          accessRevoked = true;
          controller.add(MobileSessionGuardEvent.accessRevoked);
        }
        return;
      }

      accessRevoked = false;
    } on AuratioAuthenticationException catch (error) {
      if (disposed || !isTerminalMobileSessionError(error)) return;

      if (!accessRevoked) {
        accessRevoked = true;
        controller.add(MobileSessionGuardEvent.accessRevoked);
      }
    } finally {
      checking = false;
    }
  }

  final authSubscription = repository.authChanges().listen(
    (_) => unawaited(validateSession()),
    onError: (_) {
      // Auth-stream transport errors do not revoke access by themselves.
      // The periodic authoritative session/profile check remains active.
    },
  );

  final timer = Timer.periodic(
    mobileSessionGuardInterval,
    (_) => unawaited(validateSession()),
  );

  scheduleMicrotask(() => unawaited(validateSession()));

  ref.onDispose(() {
    disposed = true;
    timer.cancel();
    unawaited(authSubscription.cancel());
    unawaited(controller.close());
  });

  return controller.stream;
});
