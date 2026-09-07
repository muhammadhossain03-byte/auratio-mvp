enum AuratioAppRole {
  endUser('end_user'),
  volunteer('volunteer'),
  admin('admin'),
  superAdmin('super_admin');

  const AuratioAppRole(this.wireValue);

  final String wireValue;

  static AuratioAppRole fromWire(String value) {
    return values.firstWhere(
      (role) => role.wireValue == value,
      orElse: () => throw FormatException('Unknown Auratio role: $value'),
    );
  }
}

enum AuratioAccountStatus {
  active('active'),
  disabled('disabled');

  const AuratioAccountStatus(this.wireValue);

  final String wireValue;

  static AuratioAccountStatus fromWire(String value) {
    return values.firstWhere(
      (status) => status.wireValue == value,
      orElse: () => throw FormatException('Unknown account status: $value'),
    );
  }
}

class AuratioAuthProfile {
  const AuratioAuthProfile({
    required this.userId,
    required this.displayName,
    required this.role,
    required this.accountStatus,
    required this.isRootSuperAdmin,
  });

  factory AuratioAuthProfile.fromJson(Map<String, dynamic> json) {
    final userId = json['user_id'];
    final displayName = json['display_name'];
    final role = json['role'];
    final accountStatus = json['account_status'];
    final isRootSuperAdmin = json['is_root_super_admin'];

    if (userId is! String ||
        displayName is! String ||
        role is! String ||
        accountStatus is! String ||
        isRootSuperAdmin is! bool) {
      throw const FormatException('Profile payload is incomplete.');
    }

    return AuratioAuthProfile(
      userId: userId,
      displayName: displayName,
      role: AuratioAppRole.fromWire(role),
      accountStatus: AuratioAccountStatus.fromWire(accountStatus),
      isRootSuperAdmin: isRootSuperAdmin,
    );
  }

  final String userId;
  final String displayName;
  final AuratioAppRole role;
  final AuratioAccountStatus accountStatus;
  final bool isRootSuperAdmin;

  bool get isActiveEndUser =>
      accountStatus == AuratioAccountStatus.active &&
      role == AuratioAppRole.endUser;

  bool get isActivePortalStaff =>
      accountStatus == AuratioAccountStatus.active &&
      role != AuratioAppRole.endUser;
}
