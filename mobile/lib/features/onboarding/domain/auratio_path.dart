enum AuratioPath {
  publicSpeaking(
    label: 'Public Speaking',
    description: 'Five speaking formats',
  ),
  professionalPresenting(
    label: 'Professional Presenting',
    description: 'Five professional presentation modes',
  ),
  contentCreation(
    label: 'Content Creation',
    description: 'Three speaker-led content niches',
  );

  const AuratioPath({required this.label, required this.description});

  final String label;
  final String description;
}
