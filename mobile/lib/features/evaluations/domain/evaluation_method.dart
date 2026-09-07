enum EvaluationMethod {
  ai('ai'),
  human('human');

  const EvaluationMethod(this.wireValue);

  final String wireValue;

  static EvaluationMethod fromWire(String value) {
    return values.firstWhere(
      (method) => method.wireValue == value,
      orElse: () => throw FormatException('Unknown evaluation method: $value'),
    );
  }

  String get displayName {
    switch (this) {
      case EvaluationMethod.ai:
        return 'AI Evaluation';
      case EvaluationMethod.human:
        return 'Human Evaluation';
    }
  }

  String get assignedTitle {
    switch (this) {
      case EvaluationMethod.ai:
        return 'Assigned to AI Evaluation';
      case EvaluationMethod.human:
        return 'Assigned to Human Evaluation';
    }
  }

  String get badgeLabel {
    switch (this) {
      case EvaluationMethod.ai:
        return 'Assigned to AI';
      case EvaluationMethod.human:
        return 'Assigned to Human';
    }
  }

  String get continueButtonLabel {
    switch (this) {
      case EvaluationMethod.ai:
        return 'Continue with AI Evaluation';
      case EvaluationMethod.human:
        return 'Continue with Human Evaluation';
    }
  }
}
