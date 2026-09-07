enum AuratioPath {
  publicSpeaking(
    wireValue: 'public-speaking',
    label: 'Public Speaking',
    description: 'Five speaking formats',
  ),
  professionalPresenting(
    wireValue: 'professional-presenting',
    label: 'Professional Presenting',
    description: 'Five professional presentation modes',
  ),
  contentCreation(
    wireValue: 'content-creation',
    label: 'Content Creation',
    description: 'Three speaker-led content niches',
  );

  const AuratioPath({
    required this.wireValue,
    required this.label,
    required this.description,
  });

  final String wireValue;
  final String label;
  final String description;

  static AuratioPath fromWire(String value) {
    return values.firstWhere(
      (path) => path.wireValue == value,
      orElse: () => throw FormatException('Unknown Auratio path: $value'),
    );
  }
}
