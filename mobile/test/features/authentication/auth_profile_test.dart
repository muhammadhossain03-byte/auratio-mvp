import 'package:auratio_mobile/features/authentication/domain/auth_profile.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('parses active End User profile from persisted wire values', () {
    final profile = AuratioAuthProfile.fromJson(const {
      'user_id': '00000000-0000-4000-8000-000000000701',
      'display_name': 'Test User',
      'role': 'end_user',
      'account_status': 'active',
      'is_root_super_admin': false,
    });

    expect(profile.role, AuratioAppRole.endUser);
    expect(profile.accountStatus, AuratioAccountStatus.active);
    expect(profile.isActiveEndUser, isTrue);
    expect(profile.isActivePortalStaff, isFalse);
  });

  test('distinguishes active portal staff from mobile End User', () {
    final profile = AuratioAuthProfile.fromJson(const {
      'user_id': '00000000-0000-4000-8000-000000000702',
      'display_name': 'Volunteer',
      'role': 'volunteer',
      'account_status': 'active',
      'is_root_super_admin': false,
    });

    expect(profile.isActiveEndUser, isFalse);
    expect(profile.isActivePortalStaff, isTrue);
  });

  test('rejects unknown role values instead of trusting client data', () {
    expect(
      () => AuratioAuthProfile.fromJson(const {
        'user_id': '00000000-0000-4000-8000-000000000703',
        'display_name': 'Invalid',
        'role': 'owner',
        'account_status': 'active',
        'is_root_super_admin': false,
      }),
      throwsFormatException,
    );
  });
}
