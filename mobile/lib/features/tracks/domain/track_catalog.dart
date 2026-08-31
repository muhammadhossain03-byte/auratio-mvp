import '../../onboarding/domain/auratio_path.dart';

enum TrackCategory {
  publicSpeaking(header: 'PUBLIC SPEAKING', path: AuratioPath.publicSpeaking),
  professionalPresenting(
    header: 'PROFESSIONAL PRESENTING',
    path: AuratioPath.professionalPresenting,
  ),
  contentCreation(
    header: 'CONTENT CREATION',
    path: AuratioPath.contentCreation,
  );

  const TrackCategory({required this.header, required this.path});

  final String header;
  final AuratioPath path;
}

class TrackItem {
  const TrackItem({
    required this.name,
    required this.category,
    this.hasDetailsRoute = false,
  });

  final String name;
  final TrackCategory category;
  final bool hasDetailsRoute;
}

abstract final class AuratioTrackCatalog {
  static const publicSpeakingTracks = [
    TrackItem(name: 'Informative', category: TrackCategory.publicSpeaking),
    TrackItem(name: 'Extempore', category: TrackCategory.publicSpeaking),
    TrackItem(name: 'Persuasive', category: TrackCategory.publicSpeaking),
    TrackItem(
      name: 'Argumentative / Debate',
      category: TrackCategory.publicSpeaking,
    ),
    TrackItem(name: 'Explanatory', category: TrackCategory.publicSpeaking),
  ];

  static const professionalPresentingTracks = [
    TrackItem(
      name: 'News Delivery',
      category: TrackCategory.professionalPresenting,
    ),
    TrackItem(
      name: 'Business Pitch / Sales Pitch',
      category: TrackCategory.professionalPresenting,
      hasDetailsRoute: true,
    ),
    TrackItem(
      name: 'General Presentation / Multimedia',
      category: TrackCategory.professionalPresenting,
    ),
    TrackItem(
      name: 'Academic — Poster / Project / Thesis',
      category: TrackCategory.professionalPresenting,
    ),
    TrackItem(
      name: 'Corporate Report',
      category: TrackCategory.professionalPresenting,
    ),
  ];

  static const contentCreationTracks = [
    TrackItem(
      name: 'Infotainment-Oriented',
      category: TrackCategory.contentCreation,
    ),
    TrackItem(
      name: 'Academic — Lecture / Course',
      category: TrackCategory.contentCreation,
    ),
    TrackItem(
      name: 'Marketing / Promotional',
      category: TrackCategory.contentCreation,
    ),
  ];

  static const allTracks = [
    ...publicSpeakingTracks,
    ...professionalPresentingTracks,
    ...contentCreationTracks,
  ];
}
