import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../domain/persisted_evaluation.dart';
import 'evaluation_repository_provider.dart';

final latestEvaluationRequestProvider =
    FutureProvider<PersistedEvaluationRequest?>((ref) async {
      final repository = ref.watch(auratioEvaluationRepositoryProvider);
      return repository.fetchLatestRequest();
    });
