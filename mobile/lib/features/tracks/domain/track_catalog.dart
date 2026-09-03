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
    required this.slug,
    required this.category,
    required this.targetDuration,
    required this.acceptedDuration,
    required this.sampleValidDuration,
    required this.description,
    this.sampleFileName,
    this.hasDetailsRoute = true,
  });

  final String name;
  final String slug;
  final TrackCategory category;
  final String targetDuration;
  final String acceptedDuration;
  final String sampleValidDuration;
  final String description;
  final String? sampleFileName;
  final bool hasDetailsRoute;

  String get effectiveFileName => sampleFileName ?? '$slug.mp4';
}

abstract final class AuratioTrackCatalog {
  static const informative = TrackItem(
    name: 'Informative',
    slug: 'informative',
    category: TrackCategory.publicSpeaking,
    targetDuration: '5:00–7:00',
    acceptedDuration: '4:30–7:30',
    sampleValidDuration: '5:45',
    description: 'Deliver an informative presentation structured for clear communication evaluation.',
  );

  static const extempore = TrackItem(
    name: 'Extempore',
    slug: 'extempore',
    category: TrackCategory.publicSpeaking,
    targetDuration: '2:00–3:00',
    acceptedDuration: '1:30–3:30',
    sampleValidDuration: '2:15',
    description: 'Deliver an impromptu speech structured for quick thinking and delivery evaluation.',
  );

  static const persuasive = TrackItem(
    name: 'Persuasive',
    slug: 'persuasive',
    category: TrackCategory.publicSpeaking,
    targetDuration: '5:00–7:00',
    acceptedDuration: '4:30–7:30',
    sampleValidDuration: '5:30',
    description: 'Deliver a persuasive speech designed to convince and engage the audience.',
  );

  static const argumentativeDebate = TrackItem(
    name: 'Argumentative / Debate',
    slug: 'argumentative-debate',
    category: TrackCategory.publicSpeaking,
    targetDuration: '4:00–6:00',
    acceptedDuration: '3:30–6:30',
    sampleValidDuration: '4:45',
    description: 'Present structured arguments and debate points for communication analysis.',
  );

  static const explanatory = TrackItem(
    name: 'Explanatory',
    slug: 'explanatory',
    category: TrackCategory.publicSpeaking,
    targetDuration: '5:00–7:00',
    acceptedDuration: '4:30–7:30',
    sampleValidDuration: '5:15',
    description: 'Deliver an explanatory presentation breaking down complex concepts clearly.',
  );

  static const newsDelivery = TrackItem(
    name: 'News Delivery',
    slug: 'news-delivery',
    category: TrackCategory.professionalPresenting,
    targetDuration: '1:00–3:00',
    acceptedDuration: '0:30–3:30',
    sampleValidDuration: '2:00',
    description: 'Deliver a broadcast-style news segment evaluated on clarity, pacing, and presence.',
  );

  static const businessPitch = TrackItem(
    name: 'Business Pitch / Sales Pitch',
    slug: 'business-pitch-sales-pitch',
    category: TrackCategory.professionalPresenting,
    targetDuration: '3:00–5:00',
    acceptedDuration: '2:30–5:30',
    sampleValidDuration: '4:12',
    description: 'Deliver a speaker-visible pitch for structured communication evaluation.',
    sampleFileName: 'business-pitch.mp4',
  );

  static const generalPresentation = TrackItem(
    name: 'General Presentation / Multimedia',
    slug: 'general-presentation-multimedia',
    category: TrackCategory.professionalPresenting,
    targetDuration: '6:00–10:00',
    acceptedDuration: '5:30–10:30',
    sampleValidDuration: '7:30',
    description: 'Deliver a multimedia-supported presentation evaluated on delivery and structure.',
  );

  static const academicPoster = TrackItem(
    name: 'Academic — Poster / Project / Thesis',
    slug: 'academic-poster-project-thesis',
    category: TrackCategory.professionalPresenting,
    targetDuration: '8:00–15:00',
    acceptedDuration: '7:30–15:30',
    sampleValidDuration: '10:00',
    description: 'Present academic research, project findings, or thesis defense clearly.',
  );

  static const corporateReport = TrackItem(
    name: 'Corporate Report',
    slug: 'corporate-report',
    category: TrackCategory.professionalPresenting,
    targetDuration: '5:00–10:00',
    acceptedDuration: '4:30–10:30',
    sampleValidDuration: '7:00',
    description: 'Deliver a professional business or corporate report for stakeholder communication.',
  );

  static const infotainmentOriented = TrackItem(
    name: 'Infotainment-Oriented',
    slug: 'infotainment-oriented',
    category: TrackCategory.contentCreation,
    targetDuration: '0:45–3:00',
    acceptedDuration: '0:30–3:30',
    sampleValidDuration: '1:45',
    description: 'Create engaging, informative content blending education and entertainment.',
  );

  static const academicLecture = TrackItem(
    name: 'Academic — Lecture / Course',
    slug: 'academic-lecture-course',
    category: TrackCategory.contentCreation,
    targetDuration: '8:00–20:00',
    acceptedDuration: '7:30–20:30',
    sampleValidDuration: '12:30',
    description: 'Deliver an academic lecture or course module with structured educational flow.',
  );

  static const marketingPromotional = TrackItem(
    name: 'Marketing / Promotional',
    slug: 'marketing-promotional',
    category: TrackCategory.contentCreation,
    targetDuration: '0:45–2:00',
    acceptedDuration: '0:30–2:30',
    sampleValidDuration: '1:15',
    description: 'Present a promotional or marketing message evaluated on engagement and call to action.',
  );

  static const publicSpeakingTracks = [
    informative,
    extempore,
    persuasive,
    argumentativeDebate,
    explanatory,
  ];

  static const professionalPresentingTracks = [
    newsDelivery,
    businessPitch,
    generalPresentation,
    academicPoster,
    corporateReport,
  ];

  static const contentCreationTracks = [
    infotainmentOriented,
    academicLecture,
    marketingPromotional,
  ];

  static const allTracks = [
    ...publicSpeakingTracks,
    ...professionalPresentingTracks,
    ...contentCreationTracks,
  ];

  static TrackItem? findBySlug(String slug) {
    for (final track in allTracks) {
      if (track.slug == slug) {
        return track;
      }
    }
    return null;
  }

  static TrackItem? findBySlugOrNull(String slug) => findBySlug(slug);

  static TrackItem? findByName(String name) {
    for (final track in allTracks) {
      if (track.name == name) {
        return track;
      }
    }
    return null;
  }
}
