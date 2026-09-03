import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../domain/auratio_path.dart';

final selectedPathsProvider =
    NotifierProvider<SelectedPathsController, Set<AuratioPath>>(
      SelectedPathsController.new,
    );

class SelectedPathsController extends Notifier<Set<AuratioPath>> {
  @override
  Set<AuratioPath> build() {
    // This reproduces the locked Figma mock state; it is not a business rule.
    return Set.unmodifiable({
      AuratioPath.publicSpeaking,
      AuratioPath.professionalPresenting,
    });
  }

  void toggle(AuratioPath path) {
    final next = {...state};
    if (!next.add(path)) {
      next.remove(path);
    }
    state = Set.unmodifiable(next);
  }

  void setPaths(Set<AuratioPath> paths) {
    if (paths.isNotEmpty) {
      state = Set.unmodifiable(paths);
    }
  }
}
