import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../foundation/integration/auratio_supabase.dart';
import '../data/progress_repository.dart';

final auratioProgressRepositoryProvider = Provider<AuratioProgressRepository>((
  ref,
) {
  final client = AuratioSupabase.client;
  if (client == null) {
    return const UnconfiguredAuratioProgressRepository();
  }
  return SupabaseAuratioProgressRepository(client);
});
