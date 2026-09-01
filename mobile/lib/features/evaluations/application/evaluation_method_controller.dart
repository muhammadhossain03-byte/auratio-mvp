import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../domain/evaluation_method.dart';

final evaluationMethodSelectionProvider =
    NotifierProvider<EvaluationMethodSelectionController, EvaluationMethod>(
      EvaluationMethodSelectionController.new,
    );

class EvaluationMethodSelectionController extends Notifier<EvaluationMethod> {
  @override
  EvaluationMethod build() => EvaluationMethod.ai;

  void select(EvaluationMethod method) {
    state = method;
  }
}
