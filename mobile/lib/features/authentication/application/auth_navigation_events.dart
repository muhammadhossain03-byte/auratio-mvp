import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../foundation/integration/auratio_supabase.dart';

enum AuratioAuthNavigationEvent { passwordRecovery }

final authNavigationEventProvider = StreamProvider<AuratioAuthNavigationEvent>((
  ref,
) {
  final client = AuratioSupabase.client;
  if (client == null) {
    return const Stream<AuratioAuthNavigationEvent>.empty();
  }

  return client.auth.onAuthStateChange
      .where((state) => state.event == AuthChangeEvent.passwordRecovery)
      .map((_) => AuratioAuthNavigationEvent.passwordRecovery);
});
