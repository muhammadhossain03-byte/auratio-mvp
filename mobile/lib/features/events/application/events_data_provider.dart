import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../onboarding/domain/auratio_path.dart';
import '../domain/persisted_event.dart';
import 'events_repository_provider.dart';

typedef PersistedEventsQuery = ({
  String? division,
  AuratioPath? path,
  bool upcomingOnly,
});

final persistedEventsProvider =
    FutureProvider.family<List<PersistedEvent>, PersistedEventsQuery>((
      ref,
      query,
    ) {
      return ref
          .watch(auratioEventsRepositoryProvider)
          .fetchPublishedEvents(
            division: query.division,
            path: query.path,
            fromInclusive: query.upcomingOnly ? DateTime.now().toUtc() : null,
          );
    });

final persistedEventProvider = FutureProvider.family<PersistedEvent?, String>((
  ref,
  eventId,
) {
  return ref
      .watch(auratioEventsRepositoryProvider)
      .fetchPublishedEvent(eventId);
});
