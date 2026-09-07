import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../foundation/integration/auratio_supabase.dart';
import '../data/events_repository.dart';

final auratioEventsRepositoryProvider = Provider<AuratioEventsRepository>((
  ref,
) {
  final client = AuratioSupabase.client;
  if (client == null) {
    return const UnconfiguredAuratioEventsRepository();
  }
  return SupabaseAuratioEventsRepository(client);
});
