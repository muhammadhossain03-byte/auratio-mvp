import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../onboarding/domain/auratio_path.dart';
import '../data/profile_repository.dart';
import 'profile_repository_provider.dart';

final persistedEndUserProfileProvider =
    FutureProvider.autoDispose<PersistedEndUserProfile>((ref) {
      return ref.watch(auratioProfileRepositoryProvider).fetchProfile();
    });

final persistedSelectedPathsProvider =
    FutureProvider.autoDispose<Set<AuratioPath>>((ref) {
      return ref.watch(auratioProfileRepositoryProvider).fetchPaths();
    });
