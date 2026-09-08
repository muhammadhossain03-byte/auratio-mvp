import 'dart:io';

import 'package:auratio_mobile/features/onboarding/domain/auratio_path.dart';
import 'package:auratio_mobile/features/profile/data/profile_repository.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('Step VII-E1A persisted profile/Path contract', () {
    test('canonical Path IDs remain locked', () {
      expect(AuratioPath.values.map((path) => path.wireValue).toList(), const [
        'public-speaking',
        'professional-presenting',
        'content-creation',
      ]);
    });

    test('persisted profile derives initials from saved display name', () {
      const profile = PersistedEndUserProfile(
        userId: 'user',
        email: 'user@example.com',
        displayName: 'Alex Morgan',
        paths: {AuratioPath.publicSpeaking},
      );
      expect(profile.initials, 'AM');
    });

    test('repository uses only authenticated self-owned public tables', () {
      final source = File('lib/features/profile/data/profile_repository.dart')
          .readAsStringSync();

      expect(source, contains(".from('profiles')"));
      expect(source, contains(".from('user_paths')"));
      expect(source, contains(".eq('user_id', user.id)"));
      expect(source, contains("profile['role'] != 'end_user'"));
      expect(source, contains("profile['account_status'] != 'active'"));
      expect(source, contains('desired.difference(current)'));
      expect(source, contains('current.difference(desired)'));

      expect(source, isNot(contains('SUPABASE_SERVICE_ROLE_KEY')));
      expect(source, isNot(contains('service_role')));
      expect(source, isNot(contains('svc_')));
    });

    test('display-name mutation is column-scoped', () {
      final source = File('lib/features/profile/data/profile_repository.dart')
          .readAsStringSync();

      expect(source, contains(".update({'display_name': normalized})"));
      expect(source, isNot(contains("'role':")));
      expect(source, isNot(contains("'account_status':")));
      expect(source, isNot(contains("'is_root_super_admin':")));
    });
  });
}
