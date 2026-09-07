import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../domain/progress_models.dart';
import 'progress_repository_provider.dart';

final userProgressProvider = FutureProvider<UserProgressSnapshot>((ref) {
  return ref.watch(auratioProgressRepositoryProvider).fetchProgress();
});

final approvedHistoryProvider = FutureProvider<ApprovedHistoryPage>((ref) {
  return ref
      .watch(auratioProgressRepositoryProvider)
      .fetchApprovedHistory(limit: 100);
});
