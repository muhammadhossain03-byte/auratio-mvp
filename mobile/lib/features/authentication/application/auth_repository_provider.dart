import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../foundation/integration/auratio_supabase.dart';
import '../data/auth_repository.dart';

final authRepositoryProvider = Provider<AuratioAuthRepository>((ref) {
  final client = AuratioSupabase.client;
  if (client == null) {
    return const UnconfiguredAuratioAuthRepository();
  }
  return SupabaseAuratioAuthRepository(client);
});
