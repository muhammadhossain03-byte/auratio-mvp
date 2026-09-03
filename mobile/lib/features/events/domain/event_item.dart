import '../../onboarding/domain/auratio_path.dart';

class EventItem {
  const EventItem({
    required this.slug,
    required this.title,
    required this.division,
    required this.location,
    required this.date,
    required this.relevantPath,
    required this.source,
    required this.supportingText,
    required this.aboutText,
    required this.whyShownText,
  });

  final String slug;
  final String title;
  final String division;
  final String location;
  final String date;
  final AuratioPath relevantPath;
  final String source;
  final String supportingText;
  final String aboutText;
  final String whyShownText;
}
