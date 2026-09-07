import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../domain/persisted_evaluation.dart';
import 'evaluation_repository_provider.dart';

typedef ApprovedEvaluationLocator = ({String? requestId, String? submissionId});

final approvedEvaluationDetailProvider =
    FutureProvider.family<ApprovedEvaluationDetail?, ApprovedEvaluationLocator>(
      (ref, locator) async {
        final repository = ref.watch(auratioEvaluationRepositoryProvider);
        final requestId = _normalized(locator.requestId);
        if (requestId != null) {
          return repository.fetchApprovedEvaluation(requestId);
        }

        final submissionId = _normalized(locator.submissionId);
        if (submissionId != null) {
          return repository.fetchApprovedEvaluationForSubmission(submissionId);
        }

        final latest = await repository.fetchLatestRequest();
        if (latest == null ||
            latest.status != PersistedEvaluationStatus.approved) {
          return null;
        }
        return repository.fetchApprovedEvaluation(latest.id);
      },
    );

final approvedReportProvider =
    FutureProvider.family<ApprovedReportMetadata?, ApprovedEvaluationLocator>((
      ref,
      locator,
    ) async {
      final detail = await ref.watch(
        approvedEvaluationDetailProvider(locator).future,
      );
      if (detail == null) {
        return null;
      }

      final repository = ref.watch(auratioEvaluationRepositoryProvider);
      return repository.ensureApprovedReport(detail.request.id);
    });

String? _normalized(String? value) {
  final normalized = value?.trim();
  if (normalized == null || normalized.isEmpty) {
    return null;
  }
  return normalized;
}
