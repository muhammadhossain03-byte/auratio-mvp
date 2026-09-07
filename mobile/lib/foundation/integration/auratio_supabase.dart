import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'supabase_config.dart';

abstract final class AuratioSupabase {
  static SupabaseClient? _client;
  static AuratioSupabaseConfig? _config;

  static SupabaseClient? get client => _client;
  static AuratioSupabaseConfig? get config => _config;
  static bool get isConfigured => _client != null;

  static Future<void> initializeFromEnvironment() async {
    final config = AuratioSupabaseConfig.fromEnvironment();
    config.validate();
    _config = config;

    if (!config.isConfigured) {
      if (kReleaseMode) {
        throw const AuratioSupabaseConfigurationException(
          'SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY are required for release builds.',
        );
      }

      return;
    }

    await Supabase.initialize(
      url: config.url.trim(),
      publishableKey: config.publishableKey.trim(),
    );
    _client = Supabase.instance.client;
  }

  static SupabaseClient requireClient() {
    final client = _client;
    if (client == null) {
      throw const AuratioSupabaseConfigurationException(
        'Auratio Supabase is not configured for this build.',
      );
    }
    return client;
  }
}
