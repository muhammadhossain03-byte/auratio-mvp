import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../foundation/integration/auratio_supabase.dart';
import '../data/profile_repository.dart';

final auratioProfileRepositoryProvider = Provider<AuratioProfileRepository>((
  ref,
) {
  final client = AuratioSupabase.client;
  if (client == null) {
    return const UnconfiguredAuratioProfileRepository();
  }
  return SupabaseAuratioProfileRepository(client);
});
