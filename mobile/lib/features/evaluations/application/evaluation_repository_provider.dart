import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../foundation/integration/auratio_supabase.dart';
import '../data/evaluation_repository.dart';

final auratioEvaluationRepositoryProvider =
    Provider<AuratioEvaluationRepository>((ref) {
      final client = AuratioSupabase.client;
      if (client == null) {
        return const UnconfiguredAuratioEvaluationRepository();
      }
      return SupabaseAuratioEvaluationRepository(client);
    });
